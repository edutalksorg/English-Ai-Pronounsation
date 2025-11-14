// src/pages/Profile/Wallet.tsx
import React, { useEffect, useState } from "react";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getWalletBalance, getWalletTransactions, requestWithdrawal } from "@/lib/api/wallet";
import type { WalletTransaction } from "@/lib/api/types/wallet";
import { useToast } from "@/hooks/use-toast";

export default function Wallet() {
  const { toast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("INR");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const b = await getWalletBalance();
      setBalance(b.balance);
      setCurrency(b.currency);
      const tx = await getWalletTransactions({ pageNumber: 1, pageSize: 10 });
      setTransactions(tx);
    } catch (e) {
      console.error("wallet load", e);
      toast({
        title: "Error",
        description: "Failed to load wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleWithdraw = async () => {
    if (!balance || balance <= 0) {
      toast({
        title: "Error",
        description: "No available balance to withdraw",
        variant: "destructive",
      });
      return;
    }
    setWithdrawing(true);
    try {
      await requestWithdrawal({
        amount: balance,
        currency,
        bankDetails: {
          accountHolderName: "User Name",
          accountNumber: "0000000000",
          bankName: "Your Bank",
        },
      });
      toast({
        title: "Success",
        description: "Withdrawal request submitted",
      });
      await load();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Withdrawal failed",
        variant: "destructive",
      });
    } finally { setWithdrawing(false); }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WalletIcon className="h-5 w-5" />
          Wallet
        </CardTitle>
        <CardDescription>Manage your balance and transactions</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Balance Section */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Available Balance</div>
          <div className="text-4xl font-bold mb-4">{loading ? "..." : `${currency} ${balance?.toFixed(2) ?? "0.00"}`}</div>
          <div className="flex gap-3">
            <Button 
              size="sm" 
              onClick={handleWithdraw} 
              disabled={withdrawing || !balance}
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Request Withdrawal
            </Button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">Recent Transactions</h3>
          <div className="space-y-2">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No transactions yet</div>
            ) : transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === "credit" 
                    ? "bg-green-100 dark:bg-green-900" 
                    : "bg-red-100 dark:bg-red-900"}`}>
                    {t.type === "credit" 
                      ? <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                      : <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className={`font-semibold text-sm ${t.type === "credit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {t.type === "credit" ? "+" : "-"}{t.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

