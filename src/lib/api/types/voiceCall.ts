// src/lib/api/voice.ts
import api from "./axiosClient"; // your axios instance with baseURL and auth header

export interface AvailableUser {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  preferredLanguage?: string;
  status?: string;
  lastActiveAt?: string;
}

export interface CallObject {
  callId: string;
  callerId?: string;
  callerName?: string;
  calleeId?: string;
  calleeName?: string;
  status?: string; // Ringing, InProgress, Ended
  initiatedAt?: string;
  acceptedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  topicId?: string;
  topicTitle?: string;
  callQualityRating?: number;
  remainingSeconds?: number;
}

/** GET list of online users available for calls */
export async function getAvailableUsers(preferredLanguage?: string, search?: string) {
  const res = await api.get<AvailableUser[]>("/api/v1/calls/available-users", { params: { preferredLanguage, search } });
  return res.data;
}

/** GET ICE servers config */
export async function getWebrtcConfig() {
  const res = await api.get<{ iceServers: any[] }>("/api/v1/calls/webrtc-config");
  return res.data;
}

/**
 * Initiate a call.
 * payload: { calleeId, topicId }.
 */
export async function initiateCall(payload: { calleeId: string; topicId?: string }) {
  const res = await api.post<CallObject>("/api/v1/calls/initiate", payload);
  return res.data;
}

/** Respond to a call (accept/reject). */
export async function respondCall(callId: string, accept: boolean) {
  const res = await api.post<CallObject>(`/api/v1/calls/${callId}/respond`, accept);
  return res.data;
}

/** End call */
export async function endCall(callId: string, reason?: string) {
  const res = await api.post(`/api/v1/calls/${callId}/end`, reason ?? "");
  return res.data;
}

/** Get call object (polling) - NOTE: This endpoint may not exist in the API, using initiate response for status */
export async function getCall(callId: string) {
  // Note: The API schema doesn't show a GET /api/v1/calls/{callId} endpoint
  // This might need to be implemented via WebSocket or polling the history endpoint
  // For now, we'll return null and handle status updates via the initiate response
  throw new Error("GET /api/v1/calls/{callId} endpoint not available in API schema");
}

/** Rate a call after completion */
export async function rateCall(callId: string, rating: number) {
  const res = await api.post(`/api/v1/calls/${callId}/rate`, rating);
  return res.data;
}

/** Get call history */
export async function getCallHistory(pageNumber = 1, pageSize = 20) {
  const res = await api.get(`/api/v1/calls/history`, { params: { pageNumber, pageSize } });
  return res.data;
}
