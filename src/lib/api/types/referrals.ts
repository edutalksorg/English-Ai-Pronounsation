// src/lib/api/referrals.ts
import apiClient from "./axiosClient"; // adapt path if needed
import type {
  ReferralCodeData,
  ReferralStatsData,
  ReferralHistoryItem,
} from "./types/referrals";

/**
 * GET /api/v1/referrals/my-code
 * Returns normalized ReferralCodeData (unwraps { data: ... })
 */
export const getMyReferralCode = async (): Promise<ReferralCodeData | null> => {
  const res = await apiClient.get("/api/v1/referrals/my-code");
  const payload = res.data;
  // API returns { messages, errors, succeeded, statusCode, data: { ... } }
  return payload?.data ?? null;
};

/**
 * GET /api/v1/referrals/stats
 */
export const getReferralStats = async (): Promise<ReferralStatsData | null> => {
  const res = await apiClient.get("/api/v1/referrals/stats");
  const payload = res.data;
  return payload?.data ?? null;
};

/**
 * GET /api/v1/referrals/history
 * Accepts pagination: page, pageSize
 */
export const getReferralHistory = async (params?: { page?: number; pageSize?: number; }):
  Promise<ReferralHistoryItem[]> => {
  const res = await apiClient.get("/api/v1/referrals/history", { params });
  const raw = res.data;
  // API returns array on success or wrapped in { data: [...] }
  const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
  return list.map((t: any) => ({
    id: t.id,
    refereeName: t.refereeName,
    refereeEmail: t.refereeEmail,
    status: t.status,
    source: t.source,
    rewardAmount: typeof t.rewardAmount === "number" ? t.rewardAmount : Number(t.rewardAmount ?? 0),
    createdAt: t.createdAt,
    qualifiedAt: t.qualifiedAt,
  }));
};

/**
 * GET /api/v1/referrals/validate/{code}
 * Public endpoint: returns { data: boolean } (true if code exists)
 */
export const validateReferralCode = async (code: string): Promise<boolean> => {
  const res = await apiClient.get(`/api/v1/referrals/validate/${encodeURIComponent(code)}`);
  const payload = res.data;
  return payload?.data === true;
};

/**
 * Helper: apply referral coupon.
 * Some systems keep coupon endpoints under /coupons — call that endpoint to apply coupon.
 * POST /api/v1/coupons/apply
 *
 * payload: { couponCode, originalAmount, itemType, itemId, orderId }
 */
export const applyReferralCoupon = async (payload: {
  couponCode: string;
  originalAmount: number;
  itemType?: string;
  itemId?: string;
  orderId?: string;
}) => {
  const res = await apiClient.post("/api/v1/coupons/apply", payload);
  // returns 201/400/422. We return raw response so caller can handle status.
  return res.data;
};
