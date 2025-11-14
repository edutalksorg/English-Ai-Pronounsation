import React, { useEffect, useState } from "react";
import { Wallet2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserTabsNav } from "@/components/profile/UserTabsNav";
import { Button } from "@/components/ui/button";
import { getWalletBalance, getWalletTransactions, requestWithdrawal } from "@/lib/api/wallet";
import type { WalletTransaction } from "@/lib/api/types/wallet";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("INR");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawing, setWithdrawing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const b = await getWalletBalance();
      setBalance(b.balance);
      setCurrency(b.currency || "INR");
      const tx = await getWalletTransactions({ pageNumber: 1, pageSize: 10 });
      setTransactions(tx);
    } catch (err) {
      console.error("wallet load", err);
      toast({ title: "Error", description: "Failed to load wallet", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleWithdraw = async () => {
    if (!balance || balance <= 0) {
      toast({ title: "Error", description: "No available balance to withdraw", variant: "destructive" });
      return;
    }
    setWithdrawing(true);
    try {
      await requestWithdrawal({ amount: balance, currency, bankDetails: { accountHolderName: "User", accountNumber: "000000", bankName: "Bank" } });
      toast({ title: "Success", description: "Withdrawal request submitted" });
      await load();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Withdrawal failed", variant: "destructive" });
    } finally { setWithdrawing(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">{user?.fullName ?? "EduTalks Learner"}</h1>
          <p className="text-gray-500">{user?.email ?? "student@edutalks.tech"}</p>
          <UserTabsNav active="wallet" />
        </header>

        <section className="space-y-6">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white p-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Wallet2 className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-white/80">Available Balance</p>
                <p className="text-4xl font-extrabold mt-1">{loading ? "..." : `${currency} ${balance?.toFixed(2) ?? "0.00"}`}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6" onClick={handleWithdraw} disabled={withdrawing || loading}>
              {withdrawing ? "Requesting..." : "Request Withdrawal"}
            </Button>
            <Button variant="outline" className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50">Use for Courses</Button>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
              <p className="text-sm text-gray-500">Recent wallet activity and rewards</p>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No transactions yet</div>
            ) : (
              transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === "credit" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                      {t.type === "credit" ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.title}</p>
                      <p className="text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <p className={`text-lg font-bold ${t.type === "credit" ? "text-emerald-600" : "text-rose-500"}`}>{t.type === "credit" ? "+" : "-"}{Math.abs(t.amount).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

