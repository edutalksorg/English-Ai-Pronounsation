// src/pages/Subscriptions/SubscriptionsPage.tsx
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, FileText, History } from "lucide-react";
import SubscriptionPlans from "./SubscriptionPlans";
import SubscriptionDetails from "./SubscriptionDetails";
import SubscriptionHistory from "./SubscriptionHistory";

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Subscriptions</h1>
        <p className="text-muted-foreground">Manage your subscription plans and billing</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-2">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">My Subscription</span>
            <span className="sm:hidden">Current</span>
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Browse Plans</span>
            <span className="sm:hidden">Plans</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
            <span className="sm:hidden">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <SubscriptionDetails />
        </TabsContent>

        <TabsContent value="plans" className="mt-6">
          <SubscriptionPlans />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <SubscriptionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
