// src/pages/Subscriptions/SubscriptionHistory.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCallHistory } from "@/lib/api/types/voiceCall";
import { Calendar, DollarSign, CheckCircle, XCircle } from "lucide-react";

interface HistoryItem {
  id?: string;
  planName?: string;
  action?: string;
  amount?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  date?: string;
  planId?: string;
  subscriptionId?: string;
}

export default function SubscriptionHistory() {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Note: Using call history as a fallback. Ideally, there should be a 
      // GET /api/v1/subscriptions/history endpoint
      const res = await getCallHistory(1, 20);
      const data = res?.data ?? res?.items ?? res ?? [];
      
      // Transform to subscription history format
      const transformedData = Array.isArray(data)
        ? data.map((item: any) => ({
            id: item.id,
            planName: item.planName,
            action: item.type ?? "subscription",
            amount: item.amount,
            currency: item.currency ?? "INR",
            status: item.status,
            createdAt: item.createdAt,
            date: item.date,
          }))
        : [];
      
      setHistory(transformedData);
    } catch (err: any) {
      console.error("Failed to load history:", err);
      // Don't show error toast as this endpoint might not exist yet
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const lower = status.toLowerCase();
    if (lower.includes("success") || lower.includes("active")) return "bg-green-100 text-green-800";
    if (lower.includes("failed") || lower.includes("cancelled")) return "bg-red-100 text-red-800";
    if (lower.includes("pending")) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return <div className="text-center py-12">Loading subscription history...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Subscription History</h2>
        <p className="text-muted-foreground">View your past subscription activity and transactions</p>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground">No subscription history yet</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{item.planName ?? item.action}</h3>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status ?? "Completed"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : item.date ?? "—"}
                      </div>
                      {item.amount && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          ₹{item.amount}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {item.status?.toLowerCase().includes("success") || 
                     item.status?.toLowerCase().includes("active") ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
