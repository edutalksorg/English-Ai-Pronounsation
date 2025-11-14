// src/components/dashboard/DailyTopics.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DailyTopicsAPI, TopicDto } from "@/lib/api/types/dailyTopics";

export const DailyTopics: React.FC = () => {
  const [topics, setTopics] = useState<TopicDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // call your API list endpoint
        // you may pass params e.g. { PageSize: 10 } to limit results
        const list = await DailyTopicsAPI.list({ pageSize: 10 });
        if (mounted) setTopics(list);
      } catch (err: any) {
        console.error("Failed to load topics:", err);
        const message = err?.response?.data?.detail ?? err?.message ?? "Failed to load topics";
        setError(message);
        toast({ title: "Failed to load topics", description: message, variant: "destructive" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [toast]);

  if (loading) {
    return <div className="text-center mt-8">Loading topics...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

  if (!topics.length) {
    return <div className="text-center mt-8">No topics for today.</div>;
  }

  const handleStart = (t: TopicDto) => {
    const id = t.topicId ?? t.id;
    if (!id) {
      toast({ title: "Missing topic id", description: "Cannot open this topic", variant: "destructive" });
      return;
    }
    navigate(`/topics/${id}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Today's Topics
              </CardTitle>
              <CardDescription>Fresh learning content curated for you</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">Total: {topics.length}</div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {topics.map((topic) => (
              <Card key={topic.id ?? topic.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{topic.title}</h3>
                        {topic.completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{topic.categoryLabel ?? topic.categoryName ?? "General"}</Badge>
                        {topic.difficulty && <Badge variant="secondary">{topic.difficulty}</Badge>}
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {topic.durationLabel ?? (topic.estimatedDurationMinutes ? `${topic.estimatedDurationMinutes} min` : "—")}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={topic.completed ? "outline" : "default"}
                      className={!topic.completed ? "gradient-hero" : ""}
                      onClick={() => handleStart(topic)}
                    >
                      {topic.completed ? "Review" : "Start Learning"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTopics;
