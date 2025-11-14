/* Thin wrapper around generated WalletService to provide normalized frontend shapes */
import { WalletService } from './generated/services/WalletService';
import type { RequestWithdrawalCommand } from './generated/models/RequestWithdrawalCommand';
import type { WalletBalanceDto } from './generated/models/WalletBalanceDto';
import type { TransactionDto } from './generated/models/TransactionDto';
import type { WalletBalance, WalletTransaction } from './types/wallet';

export async function getWalletBalance(): Promise<WalletBalance> {
  try {
    const raw: WalletBalanceDto = await WalletService.getApiV1WalletBalance();
    const balance = Number(raw.balance ?? 0);
    const currency = raw.currency ?? 'INR';
    return {
      balance,
      currency,
      frozenAmount: raw.frozenAmount ? Number(raw.frozenAmount) : undefined,
      availableBalance: raw.availableBalance ? Number(raw.availableBalance) : balance,
      totalEarnings: raw.totalEarnings ? Number(raw.totalEarnings) : undefined,
      totalSpent: raw.totalSpent ? Number(raw.totalSpent) : undefined,
      raw: raw as any,
    };
  } catch (error: any) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
}

export async function getWalletTransactions(opts?: { pageNumber?: number; pageSize?: number }): Promise<WalletTransaction[]> {
  try {
    const pageNumber = opts?.pageNumber ?? 1;
    const pageSize = opts?.pageSize ?? 20;
    const res: TransactionDto[] = await WalletService.getApiV1WalletTransactions(pageNumber, pageSize);
    return (res || []).map((t) => ({
      id: t.id ?? '',
      title: t.description ?? (t.type ?? 'Transaction'),
      createdAt: t.createdAt ?? new Date().toISOString(),
      amount: Number(t.amount ?? 0),
      type: ((t.type ?? '').toLowerCase().includes('credit')) ? 'credit' : 'debit',
    }));
  } catch (error: any) {
    console.error('Error fetching wallet transactions:', error);
    throw error;
  }
}

export async function requestWithdrawal(command?: RequestWithdrawalCommand) {
  try {
    if (!command?.amount || command.amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }
    if (!command?.bankDetails?.accountNumber) {
      throw new Error('Bank details are required');
    }
    return WalletService.postApiV1WalletWithdraw(command);
  } catch (error: any) {
    console.error('Error requesting withdrawal:', error);
    throw error;
  }
}

export default {
  getWalletBalance,
  getWalletTransactions,
  requestWithdrawal,
};
