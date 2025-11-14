// src/components/dashboard/AIPronunciation.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Volume2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import * as PronunciationAPI from "@/lib/api/types/pronunciation";

export const AIPronunciation: React.FC = () => {
  const { toast } = useToast();

  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  // paragraphs from backend
  const [paragraphs, setParagraphs] = useState<Array<{ id: string; title: string; text: string }>>([]);
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // load paragraphs on mount
  useEffect(() => {
    async function load() {
      try {
        const res: any = await PronunciationAPI.listParagraphs({ pageNumber: 1, pageSize: 50 });
        // Handle different response shapes: { data: [] }, array, { items: [] }, etc.
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (Array.isArray(res?.data)) {
          list = res.data;
        } else if (Array.isArray(res?.items)) {
          list = res.items;
        }
        
        if (list.length > 0) {
          const validParagraphs = list
            .filter((p: any) => p?.id) // Only include paragraphs with an id
            .map((p: any) => ({ 
              id: p.id, 
              title: p.title ?? p.name ?? "Untitled", 
              text: p.text ?? p.content ?? "" 
            }));
          setParagraphs(validParagraphs);
          if (validParagraphs.length > 0) {
            setSelectedParagraphId(validParagraphs[0].id);
          }
        } else {
          setParagraphs([]);
          setSelectedParagraphId(null);
        }
      } catch (err) {
        console.error("Failed to load paragraphs:", err);
        toast({
          title: "Unable to load paragraphs",
          description: "Check network or server logs.",
          variant: "destructive",
        });
        setParagraphs([]);
        setSelectedParagraphId(null);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // start recording
  const startRecording = async () => {
    setScore(null);
    setAudioUrl(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: "Microphone not supported",
        description: "Your browser doesn't support audio recording.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      toast({ title: "Recording started", description: "Speak clearly into the microphone." });
    } catch (err: any) {
      console.error("getUserMedia error:", err);
      toast({
        title: "Microphone access denied",
        description: err?.message ?? "Please allow microphone permissions.",
        variant: "destructive",
      });
    }
  };

  // stop recording and send to backend (ParagraphId + AudioFile)
  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    try {
      recorder.stream.getTracks().forEach((t) => t.stop());
    } catch {}
    setIsRecording(false);
    setAnalyzing(true);

    try {
      // give recorder a short moment to flush
      await new Promise((r) => setTimeout(r, 200));
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });

      if (!selectedParagraphId) {
        toast({
          title: "No paragraph selected",
          description: "Please select a paragraph to analyze.",
          variant: "destructive",
        });
        setAnalyzing(false);
        return;
      }

      const form = new FormData();
      // backend docs: ParagraphId + AudioFile
      form.append("ParagraphId", selectedParagraphId);
      form.append("AudioFile", blob, "recording.webm");

      // call API (assessForm posts FormData)
      const res: any = await PronunciationAPI.assessForm(form);
      // docs say: 202 Accepted -> body is string (operation id)
      const data = res ?? res?.data ?? res;

      // If server returned a string id (202), show submitted message.
      if (typeof data === "string" && data.length > 0) {
        toast({
          title: "Submitted",
          description: "Assessment submitted. Results will be available shortly (check history).",
        });
        // optionally: navigate to history or poll for result using data as id
        // e.g. setTimeout / polling calls to GET /api/v1/pronunciation/attempts/{id}
        setAnalyzing(false);
        recordedChunksRef.current = [];
        mediaRecorderRef.current = null;
        return;
      }

      // Otherwise, try to parse immediate score (some backends may return it)
      const detectedScore =
        data?.overallScore ??
        data?.pronunciationAccuracy ??
        data?.score ??
        data?.data?.overallScore ??
        data?.data?.score ??
        (typeof data === "number" ? data : null);

      if (typeof detectedScore === "number") {
        const rounded = Math.round(detectedScore);
        setScore(rounded);
        toast({ title: "Analysis complete", description: `Your pronunciation score: ${rounded}%` });
      } else {
        console.warn("Unexpected assess response:", data);
        toast({
          title: "Submitted",
          description: "Assessment submitted. Server returned unexpected format; check history later.",
        });
      }
    } catch (err: any) {
      console.error("Assess error:", err);
      const msg = err?.response?.data?.detail ?? err?.response?.data ?? err?.message ?? "Network error";
      toast({ title: "Analysis failed", description: String(msg), variant: "destructive" });
    } finally {
      setAnalyzing(false);
      recordedChunksRef.current = [];
      mediaRecorderRef.current = null;
    }
  };

  const playRecorded = () => {
    if (!audioUrl) {
      toast({ title: "No recording", description: "Record first.", variant: "destructive" });
      return;
    }
    new Audio(audioUrl).play().catch((e) => {
      console.error("Playback failed:", e);
      toast({ title: "Playback failed", description: String(e?.message ?? e), variant: "destructive" });
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            AI Pronunciation Feedback
          </CardTitle>
          <CardDescription>Practice paragraphs from server, submit audio for assessment.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Choose paragraph</label>
              <select
                value={selectedParagraphId ?? ""}
                onChange={(e) => setSelectedParagraphId(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {paragraphs.length === 0 && <option value="">No paragraphs available</option>}
                {paragraphs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title ?? p.text?.slice(0, 80) ?? p.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-muted rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Selected paragraph preview</p>
              <div className="text-left max-h-40 overflow-auto p-2 bg-white rounded border">
                {paragraphs.find((x) => x.id === selectedParagraphId)?.text ?? "No paragraph selected."}
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div
                className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? "bg-red-500 animate-pulse" : "gradient-hero"
                }`}
              >
                {isRecording ? (
                  <Square className="h-10 w-10 text-white" />
                ) : (
                  <Mic className="h-10 w-10 text-white" />
                )}
              </div>

              <div className="space-y-2 text-center">
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "default"}
                  disabled={analyzing}
                >
                  {isRecording ? "Stop Recording" : analyzing ? "Analyzing..." : "Start Recording"}
                </Button>

                <div className="flex gap-2 justify-center mt-2">
                  <Button size="sm" variant="outline" onClick={playRecorded} disabled={!audioUrl}>
                    <Volume2 className="w-4 h-4 mr-2" /> Play
                  </Button>
                </div>
              </div>
            </div>

            {score !== null && (
              <Card className="border-2 border-primary/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold">Your Score</h3>
                      <div className="text-sm text-muted-foreground">Pronunciation accuracy</div>
                    </div>
                    <div className="text-2xl font-bold">{score}%</div>
                  </div>
                  <Progress value={score} className="h-3" />
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPronunciation;
