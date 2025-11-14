// src/pages/TopicDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DailyTopicsAPI } from "@/lib/api/types/dailyTopics";

export default function TopicDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Topic ID is required");
      setLoading(false);
      return;
    }

    async function loadTopic() {
      try {
        setLoading(true);
        setError(null);
        const res: any = await DailyTopicsAPI.getById(id);
        
        // Handle different response shapes
        const topicData = res?.data ?? res ?? null;
        if (topicData) {
          setTopic(topicData);
        } else {
          setError("Topic not found");
        }
      } catch (err: any) {
        console.error("Failed to load topic:", err);
        const message = err?.response?.data?.detail ?? err?.message ?? "Failed to load topic";
        setError(message);
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadTopic();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading topic...</div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">{error ?? "Topic not found"}</div>
            <div className="mt-4 text-center">
              <Button onClick={() => navigate("/dashboard")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        onClick={() => navigate("/dashboard")}
        variant="ghost"
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{topic.title ?? "Untitled Topic"}</CardTitle>
              <CardDescription className="text-base">
                {topic.description ?? topic.summary ?? "No description available"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            {topic.difficulty && (
              <Badge variant="outline" className="text-sm">
                {topic.difficulty}
              </Badge>
            )}
            {topic.estimatedDurationMinutes && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {topic.estimatedDurationMinutes} minutes
              </div>
            )}
            {topic.categoryId && (
              <Badge variant="secondary">{topic.categoryId}</Badge>
            )}
          </div>

          {topic.discussionPoints && Array.isArray(topic.discussionPoints) && topic.discussionPoints.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Discussion Points
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {topic.discussionPoints.map((point: string, idx: number) => (
                  <li key={idx} className="text-muted-foreground">{point}</li>
                ))}
              </ul>
            </div>
          )}

          {topic.vocabularyList && Array.isArray(topic.vocabularyList) && topic.vocabularyList.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Vocabulary</h3>
              <div className="flex flex-wrap gap-2">
                {topic.vocabularyList.map((word: string, idx: number) => (
                  <Badge key={idx} variant="outline">{word}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              onClick={() => {
                toast({
                  title: "Topic Started",
                  description: "Begin your learning session!",
                });
              }}
              className="w-full"
            >
              Start Learning Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

