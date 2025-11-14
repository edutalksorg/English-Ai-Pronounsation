// src/lib/api/types/wallet.ts
/** Raw server shapes (as returned by backend OpenAPI) */
export type WalletBalanceRaw = {
  balance: number | string;
  currency: string;
  frozenAmount?: number;
  availableBalance?: number;
  totalEarnings?: number;
  totalSpent?: number;
  pendingTransactions?: {
    id: string;
    amount: number;
    type: string;
    description?: string;
    createdAt: string;
  }[];
};

/** Normalized shape used by the frontend */
export type WalletBalance = {
  balance: number;          // ALWAYS number (normalized)
  currency: string;
  frozenAmount?: number;
  availableBalance?: number;
  totalEarnings?: number;
  totalSpent?: number;
  raw?: WalletBalanceRaw;   // keep raw for debugging if needed
};

/** Single transaction normalized for UI */
export type WalletTransaction = {
  id: string;
  title: string;           // user-friendly title/description
  createdAt: string;       // ISO datetime string
  amount: number;
  type: "credit" | "debit";
};
