// src/pages/Dashboard.tsx
import React, { Suspense, lazy, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, BookOpen, Brain, Mic } from "lucide-react";

/**
 * Lazy-load heavy dashboard feature components so a single failing import
 * won't break the whole page at runtime. Suspense + a small ErrorBoundary
 * will surface runtime errors instead of a white screen.
 */
// Helper to normalize dynamic imports that may use named exports instead of default
const loadComponent = (p: Promise<any>) =>
  p.then((m) => ({ default: m.default ?? m?.defaultExport ?? m?.AIPronunciation ?? m?.defaultComponent ?? m }));

const VoiceCalling = lazy(() => loadComponent(import("@/components/dashboard/VoiceCalling")));
const DailyTopics = lazy(() => loadComponent(import("@/components/dashboard/DailyTopics")));
const DailyQuizzes = lazy(() => loadComponent(import("@/components/dashboard/DailyQuizzes")));
const AIPronunciation = lazy(() => loadComponent(import("@/components/dashboard/AIPronunciation")));
// Wallet and Referrals panels intentionally removed from dashboard
// per design: those features are accessible via the user dropdown menu.

/** Tiny Error Boundary local to this file to show runtime errors cleanly */
class LocalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    // still log to console for debugging
    console.error("Dashboard child error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 rounded border border-red-200">
          <h3 className="text-lg font-semibold text-red-700">Something went wrong</h3>
          <p className="text-sm text-red-600 mt-2">
            A dashboard feature failed to load. Open DevTools Console for details.
          </p>
          <details className="mt-3 text-xs text-gray-600">
            <summary className="cursor-pointer">Error (click to view)</summary>
            <pre className="whitespace-pre-wrap mt-2">{String(this.state.error)}</pre>
          </details>
        </div>
      );
    }
    return this.props.children as any;
  }
}

/** Lightweight spinner used for Suspense fallback */
function LoadingBox({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="w-full py-8 flex items-center justify-center">
      <div className="text-sm text-gray-500">{text}</div>
    </div>
  );
}

export default function Dashboard(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();

  // Allowed dashboard feature keys
  const allowedTabs = ["voice", "topics", "quizzes", "pronunciation"] as const;

  const getInitialTab = (): string => {
    const params = new URLSearchParams(location.search);
    const q = params.get("tab") || location.hash.replace("#", "") || "voice";
    return allowedTabs.includes(q as any) ? q : "voice";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // Keep URL in sync when tab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("tab", activeTab);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Learning Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress and continue learning
        </p>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(v) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="voice" className="flex items-center gap-2 py-3 justify-center">
              <Phone className="h-4 w-4" />
              <span>Voice Calls</span>
            </TabsTrigger>

            <TabsTrigger value="topics" className="flex items-center gap-2 py-3 justify-center">
              <BookOpen className="h-4 w-4" />
              <span>Daily Topics</span>
            </TabsTrigger>

            <TabsTrigger value="quizzes" className="flex items-center gap-2 py-3 justify-center">
              <Brain className="h-4 w-4" />
              <span>Quizzes</span>
            </TabsTrigger>

            <TabsTrigger value="pronunciation" className="flex items-center gap-2 py-3 justify-center">
              <Mic className="h-4 w-4" />
              <span>AI Pronunciation</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <LocalErrorBoundary>
              <Suspense fallback={<LoadingBox text="Loading voice calling..." />}>
                <TabsContent value="voice">
                  <VoiceCalling />
                </TabsContent>
              </Suspense>
            </LocalErrorBoundary>

            <LocalErrorBoundary>
              <Suspense fallback={<LoadingBox text="Loading daily topics..." />}>
                <TabsContent value="topics">
                  <DailyTopics />
                </TabsContent>
              </Suspense>
            </LocalErrorBoundary>

            <LocalErrorBoundary>
              <Suspense fallback={<LoadingBox text="Loading quizzes..." />}>
                <TabsContent value="quizzes">
                  <DailyQuizzes />
                </TabsContent>
              </Suspense>
            </LocalErrorBoundary>

            <LocalErrorBoundary>
              <Suspense fallback={<LoadingBox text="Loading pronunciation tool..." />}>
                <TabsContent value="pronunciation">
                  <AIPronunciation />
                </TabsContent>
              </Suspense>
            </LocalErrorBoundary>
          </div>
        </Tabs>

        {/* Wallet and referrals removed from the dashboard to keep UI minimal.
            Access Wallet and Referral from the user dropdown menu in the header. */}
      </div>
    </div>
  );
}
