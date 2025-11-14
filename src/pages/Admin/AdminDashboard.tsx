// src/pages/Admin/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, MessageSquare, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AdminAPI from "@/lib/api/types/admin";
import { useToast } from "@/hooks/use-toast";

type AdminStats = {
  totalUsers?: number;
  activeSubscriptions?: number;
  newThisWeek?: number;
  totalInstructors?: number;
  totalCourses?: number;
  totalRevenue?: number;
  // any other fields returned by actual API
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      setLoading(true);
      try {
        // Prefer explicit dashboard endpoint if implemented in AdminAPI
        const maybeGetDashboardStats = (AdminAPI as any).getDashboardStats;
        if (typeof maybeGetDashboardStats === "function") {
          const res = await maybeGetDashboardStats();
          // Accept different shapes: { data: {...} } or {...}
          const payload = res?.data ?? res ?? {};
          if (mounted) setStats(payload);
          return;
        }

        // FALLBACK: no getDashboardStats implemented — try to build minimal stats
        // We know AdminAPI.getApplications exists (your admin.ts). Use it to derive some numbers.
        const appsRes = await AdminAPI.getApplications?.({ page: 1, pageSize: 50 });
        // AdminAPI.getApplications returns res.data in your module; handle shapes:
        const appsPayload = appsRes?.items ?? appsRes?.data ?? appsRes ?? [];
        const applicationsArray = Array.isArray(appsPayload) ? appsPayload : appsPayload?.items ?? [];

        // Basic heuristics for fallback stats
        const fallbackStats: AdminStats = {
          totalUsers: undefined, // unknown without users endpoint
          activeSubscriptions: undefined, // unknown without subscriptions endpoint
          newThisWeek: Array.isArray(applicationsArray) ? applicationsArray.length : 0,
          totalInstructors: undefined,
          totalCourses: undefined,
          totalRevenue: undefined,
        };

        if (mounted) setStats(fallbackStats);
      } catch (err: any) {
        console.error("Failed to load admin dashboard stats:", err);
        toast({
          title: "Failed to load admin stats",
          description: err?.response?.data?.message ?? err?.message ?? "Network error",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStats();
    return () => {
      mounted = false;
    };
  }, [toast]);

  if (loading) {
    return <div className="text-center mt-12">Loading admin dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName ?? user?.email ?? user?.name}
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="users" className="flex items-center gap-2 py-3">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2 py-3">
            <BookOpen className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2 py-3">
            <MessageSquare className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 py-3">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {typeof stats?.totalUsers === "number"
                          ? stats.totalUsers.toLocaleString()
                          : "-"}
                      </CardTitle>
                      <CardDescription>Total Users</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {typeof stats?.activeSubscriptions === "number"
                          ? stats.activeSubscriptions.toLocaleString()
                          : "-"}
                      </CardTitle>
                      <CardDescription>Active Subscriptions</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {typeof stats?.newThisWeek === "number"
                          ? stats.newThisWeek.toLocaleString()
                          : "-"}
                      </CardTitle>
                      <CardDescription>New This Week</CardDescription>
                    </CardHeader>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {typeof stats?.totalInstructors === "number"
                          ? stats.totalInstructors
                          : "-"}
                      </CardTitle>
                      <CardDescription>Total Instructors</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {typeof stats?.totalCourses === "number" ? stats.totalCourses : "-"}
                      </CardTitle>
                      <CardDescription>Total Courses</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">
                        {typeof stats?.totalRevenue === "number"
                          ? `₹${stats.totalRevenue!.toLocaleString()}`
                          : "-"}
                      </CardTitle>
                      <CardDescription>Total Revenue</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage daily topics, quizzes, and learning materials</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Content management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Review and manage user reports and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Reports interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Monitor platform usage and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
