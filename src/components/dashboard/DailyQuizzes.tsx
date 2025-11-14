// src/components/dashboard/DailyQuizzes.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Trophy, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import QuizzesAPI from "@/lib/api/types/quizzes";

type Quiz = {
  id?: string | number;
  quizId?: string | number;
  title: string;
  questions?: number;
  difficulty?: string;
  completed?: boolean;
  score?: number | null;
  [key: string]: any;
};

export const DailyQuizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // call your API: GET /api/v1/quizzes
        // you can pass params if needed: QuizzesAPI.getQuizzes({ PageSize: 10 })
        const res: any = await QuizzesAPI.getQuizzes?.();

        // QuizzesAPI.getQuizzes returns res.data in your module.
        // Handle common shapes: array, { items: [] }, { data: { items: [] } }, etc.
        let items: any[] = [];
        if (Array.isArray(res)) {
          items = res;
        } else if (Array.isArray(res?.data)) {
          items = res.data;
        } else if (Array.isArray(res?.items)) {
          items = res.items;
        } else if (res?.data && Array.isArray(res.data.items)) {
          items = res.data.items;
        }

        if (!mounted) return;

        const normalized: Quiz[] = items.map((q: any) => ({
          id: q.id ?? q.quizId ?? q.quiz_id ?? q.idString ?? q._id,
          title: q.title ?? q.name ?? "Untitled Quiz",
          questions: q.questions ?? q.questionCount ?? q.totalQuestions ?? 0,
          difficulty: q.difficulty ?? q.level ?? "Unknown",
          completed: !!q.completed,
          score: typeof q.score === "number" ? q.score : q.userScore ?? null,
          ...q,
        }));

        setQuizzes(normalized);
      } catch (err: any) {
        console.error("Failed to load quizzes:", err);
        const message = err?.response?.data?.detail ?? err?.message ?? "Failed to load quizzes";
        setError(message);
        toast({ title: "Failed to load quizzes", description: message, variant: "destructive" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [toast]);

  const getDifficultyColor = (difficulty?: string) => {
    switch ((difficulty || "").toLowerCase()) {
      case "easy":
      case "beginner":
        return "bg-green-100 text-green-800";
      case "medium":
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStart = (q: Quiz) => {
    const id = q.id ?? q.quizId;
    if (!id) {
      toast({ title: "Missing quiz id", description: "Cannot start this quiz", variant: "destructive" });
      return;
    }
    // Navigate to quiz page — adjust route if your app uses different path
    navigate(`/quizzes/${id}`);
  };

  if (loading) return <div className="text-center mt-8">Loading quizzes...</div>;
  if (error) return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  if (!quizzes.length) return <div className="text-center mt-8">No quizzes available today.</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Daily Quizzes
              </CardTitle>
              <CardDescription>Test your knowledge and track your progress</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">Total: {quizzes.length}</div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id ?? quiz.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{quiz.title}</h3>
                        {quiz.completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">{quiz.questions ?? 0} questions</Badge>
                        <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                      </div>

                      {quiz.completed && quiz.score !== null && (
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Your Score</span>
                            <span className="font-semibold">{quiz.score}%</span>
                          </div>
                          <Progress value={quiz.score ?? 0} className="h-2 mt-2" />
                        </div>
                      )}
                    </div>

                    <Button
                      variant={quiz.completed ? "outline" : "default"}
                      className={!quiz.completed ? "gradient-hero" : ""}
                      onClick={() => handleStart(quiz)}
                    >
                      {quiz.completed ? "Retake" : "Start Quiz"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-success text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">Keep it up!</h3>
              <p className="text-white/90">Complete all quizzes to unlock bonus rewards</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyQuizzes;
