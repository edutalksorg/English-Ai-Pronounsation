// src/pages/Voice/VoiceCalls.tsx
import React, { useEffect, useRef, useState } from "react";
import { getAvailableUsers, getWebrtcConfig, initiateCall, getCall, endCall } from "@/lib/api/types/voiceCall";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Minimal call UI:
 * - List online users
 * - Start call (creates RTCPeerConnection, gets local audio)
 * - Create offer, send to backend via initiateCall({ calleeId, offerSdp })
 * - Poll call object for answerSdp and setRemoteDescription
 *
 * IMPORTANT: you must adapt SDP field names if your backend uses different keys.
 */

export default function VoiceCalls() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // call state
  const [currentCallId, setCurrentCallId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null); // Ringing, InProgress, Ended
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    loadUsers();
    return () => {
      stopCallCleanup();
    };
  }, []);

  async function loadUsers() {
    setLoadingUsers(true);
    setError(null);
    try {
      const res = await getAvailableUsers();
      setUsers(res ?? []);
    } catch (e: any) {
      console.error(e);
      setError("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }

  function stopCallCleanup() {
    // stop polls
    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    // stop tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    setCurrentCallId(null);
    setCallStatus(null);
  }

  async function startCallAgainst(userId: string) {
    setError(null);

    try {
      // 1) get local audio
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;

      // 2) fetch ICE servers from backend
      let iceConfig = { iceServers: undefined as any };
      try {
        const cfg = await getWebrtcConfig();
        iceConfig = cfg ?? { iceServers: undefined };
      } catch (e) {
        console.warn("Failed to fetch ICE config - continuing with default STUN only");
      }

      // 3) create RTCPeerConnection
      const pc = new RTCPeerConnection({ iceServers: iceConfig?.iceServers ?? [] });
      pcRef.current = pc;

      // add tracks
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      // when remote stream/tracks arrive -> attach to audio element
      pc.ontrack = (ev) => {
        const [remoteStream] = ev.streams;
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        } else {
          console.warn("remoteAudioRef not ready");
        }
      };

      // optional: ICE candidate handling (send candidates to backend if required)
      pc.onicecandidate = (event) => {
        // If your backend expects candidates, you'll need to send them here.
        // For many apps, trickle ICE is not required if both sides are able to connect via STUN/TURN.
        if (event.candidate) {
          // console.log("Local ICE candidate available", event.candidate);
          // TODO: send candidate to backend if required by your signaling design
        }
      };

      // 4) create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 5) send offer to backend inside initiateCall payload
      // Note: your backend docs show initiate payload as { calleeId, topicId }.
      // Many servers also accept offerSdp (key may be "offer", "offerSdp", "callerSdp", etc).
      // We send as "offerSdp" — if your backend expects a different key, change below.
      const initiatePayload = { calleeId: userId, offerSdp: offer.sdp }; // adapt key if needed
      const callObj = await initiateCall(initiatePayload);

      // callObj should contain callId. Save it and poll for answer.
      const callId = (callObj as any)?.callId ?? (callObj as any)?.data?.callId;
      if (!callId) {
        throw new Error("Call initiation failed: missing callId in response");
      }

      setCurrentCallId(callId);
      setCallStatus((callObj as any)?.status ?? "Ringing");

      // 6) poll for answer (server might put answerSdp into call object)
      // Poll every 1.5s for up to N seconds (adjust as needed)
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const updated = await getCall(callId);
          const status = updated?.status ?? updated?.data?.status ?? null;
          setCallStatus(status);

          // try to extract answer SDP from server response
          // common keys: answerSdp, calleeSdp, answer, sdpAnswer, callData.answerSdp
          const maybeAnswer =
            updated?.answerSdp ??
            updated?.calleeSdp ??
            updated?.data?.answerSdp ??
            updated?.callData?.answerSdp ??
            updated?.data?.callData?.answerSdp;

          if (maybeAnswer) {
            // set remote description
            try {
              await pc.setRemoteDescription({ type: "answer", sdp: maybeAnswer });
              setCallStatus("InProgress");
              // stop polling once we have answer
              if (pollIntervalRef.current) {
                window.clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            } catch (err) {
              console.error("Error applying remote answer SDP", err);
            }
          }

          // if server indicates ended, clean up
          if (status && (status === "Ended" || status === "Cancelled" || status === "Rejected")) {
            stopCallCleanup();
          }
        } catch (err) {
          console.warn("poll call error", err);
        }
      }, 1500);
    } catch (err: any) {
      console.error("startCall error", err);
      setError((err && err.message) || "Failed to start call");
      stopCallCleanup();
    }
  }

  async function hangup() {
    if (!currentCallId) return;
    try {
      await endCall(currentCallId);
    } catch (err) {
      console.warn("end call failed", err);
    } finally {
      stopCallCleanup();
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Voice Calls</h2>

      <div className="mb-4">
        <button onClick={loadUsers} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
      </div>

      {loadingUsers && <div>Loading users...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {users.map((u:any) => (
          <div key={u.userId || u.id} className="p-3 border rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{u.fullName ?? u.email}</div>
              <div className="text-sm text-gray-500">{u.status ?? u.preferredLanguage ?? ""}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startCallAgainst(u.userId ?? u.id)}
                className="px-3 py-1 bg-green-600 text-white rounded"
                disabled={Boolean(currentCallId)}
              >
                Call
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-medium">Active call</h3>
        <div className="p-3 border rounded">
          <div>Call ID: {currentCallId ?? "—"}</div>
          <div>Status: {callStatus ?? "—"}</div>
          <div className="mt-2">
            <button onClick={hangup} disabled={!currentCallId} className="px-3 py-1 bg-red-600 text-white rounded">Hang up</button>
          </div>
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      </div>
    </div>
  );
}
