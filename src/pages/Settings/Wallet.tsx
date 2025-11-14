// src/pages/Settings/Wallet.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { getWalletBalance, getWalletTransactions } from '@/lib/api/wallet';
import type { WalletTransaction } from '@/lib/api/types/wallet';
import { useToast } from '@/hooks/use-toast';

export default function WalletTab() {
  const { toast } = useToast();
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>('INR');
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balanceData, transactionsData] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions({ pageNumber: 1, pageSize: 15 }),
      ]);

      setBalance(balanceData.balance);
      setCurrency(balanceData.currency);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load wallet data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid withdrawal amount',
        variant: 'destructive',
      });
      return;
    }

    if (!balance || amount > balance) {
      toast({
        title: 'Insufficient balance',
        description: 'Withdrawal amount exceeds your available balance',
        variant: 'destructive',
      });
      return;
    }

    if (!accountHolder.trim() || !accountNumber.trim() || !bankName.trim()) {
      toast({
        title: 'Incomplete details',
        description: 'Please provide all bank account details',
        variant: 'destructive',
      });
      return;
    }

    setWithdrawing(true);
    try {
      // Call the withdraw API
      const { requestWithdrawal } = await import('@/lib/api/wallet');
      await requestWithdrawal({
        amount,
        currency,
        bankDetails: {
          accountHolderName: accountHolder,
          accountNumber: accountNumber,
          bankName: bankName,
        },
      });

      toast({
        title: 'Success',
        description: 'Withdrawal request submitted successfully',
      });

      // Reset form
      setWithdrawAmount('');
      setAccountHolder('');
      setAccountNumber('');
      setBankName('');

      // Reload data
      await loadData();
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to process withdrawal request',
        variant: 'destructive',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-gradient-to-br from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5 text-green-600" />
                Available Balance
              </CardTitle>
              <CardDescription>Your current wallet balance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {currency} {balance?.toFixed(2) ?? '0.00'}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Use your wallet balance to pay for subscriptions or withdraw to your bank account.
              </p>
            </CardContent>
          </Card>

          {/* Withdrawal Form */}
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>Transfer your balance to your bank account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount ({currency})</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                  {balance && (
                    <p className="text-xs text-muted-foreground">
                      Available: {currency} {balance.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    placeholder="Your name"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Your account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="Your bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
              </div>

              <Button
                onClick={handleWithdraw}
                disabled={withdrawing || !balance || balance <= 0}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Request Withdrawal'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`p-2 rounded-lg ${
                            transaction.type === 'credit'
                              ? 'bg-green-100 dark:bg-green-900/20'
                              : 'bg-red-100 dark:bg-red-900/20'
                          }`}
                        >
                          {transaction.type === 'credit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-semibold text-sm ${
                          transaction.type === 'credit'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}
                        {transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
