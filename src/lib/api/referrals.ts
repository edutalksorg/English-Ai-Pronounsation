/* API Wrapper for Referrals - Uses ReferralsService */
import { ReferralsService } from './generated/services/ReferralsService';
import type { ReferralCodeDto } from './generated/models/ReferralCodeDto';
import type { ReferralStatsDto } from './generated/models/ReferralStatsDto';
import type { ReferralHistoryDto } from './generated/models/ReferralHistoryDto';

export interface ReferralCodeData {
  code?: string;
  shareableUrl?: string;
  usageCount?: number;
  createdAt?: string;
}

export interface ReferralStatsData {
  totalReferrals?: number;
  successfulReferrals?: number;
  pendingReferrals?: number;
  totalEarnings?: number;
  earningsThisMonth?: number;
  pendingRewards?: number;
}

export interface ReferralHistoryItem {
  id: string;
  refereeName?: string;
  refereeEmail?: string;
  status?: string;
  source?: string;
  rewardAmount: number;
  createdAt?: string;
  qualifiedAt?: string;
}

/**
 * Get user's referral code
 */
export async function getMyReferralCode(): Promise<ReferralCodeData | null> {
  try {
    const result = await ReferralsService.getApiV1ReferralsMyCode();
    const data = result?.data;
    if (!data) return null;

    return {
      code: data.code ?? undefined,
      shareableUrl: data.shareableUrl ?? undefined,
      usageCount: data.usageCount,
      createdAt: data.createdAt ?? undefined,
    };
  } catch (err) {
    console.error('Failed to fetch referral code:', err);
    return null;
  }
}

/**
 * Get referral statistics
 */
export async function getReferralStats(): Promise<ReferralStatsData | null> {
  try {
    const result = await ReferralsService.getApiV1ReferralsStats();
    const data = result?.data;
    if (!data) return null;

    return {
      totalReferrals: data.totalReferrals,
      successfulReferrals: data.successfulReferrals,
      pendingReferrals: data.pendingReferrals,
      totalEarnings: data.totalEarnings,
      earningsThisMonth: data.earningsThisMonth,
      pendingRewards: data.pendingRewards,
    };
  } catch (err) {
    console.error('Failed to fetch referral stats:', err);
    return null;
  }
}

/**
 * Get referral history with pagination
 */
export async function getReferralHistory(
  pageNumber?: number,
  pageSize?: number
): Promise<ReferralHistoryItem[]> {
  try {
    const result = await ReferralsService.getApiV1ReferralsHistory(pageNumber ?? 1, pageSize ?? 20);
    if (!Array.isArray(result)) return [];

    return result.map((item: any) => ({
      id: item.id ?? '',
      refereeName: item.refereeName,
      refereeEmail: item.refereeEmail,
      status: item.status,
      source: item.source,
      rewardAmount: typeof item.rewardAmount === 'number' ? item.rewardAmount : Number(item.rewardAmount ?? 0),
      createdAt: item.createdAt,
      qualifiedAt: item.qualifiedAt,
    }));
  } catch (err) {
    console.error('Failed to fetch referral history:', err);
    return [];
  }
}

/**
 * Validate a referral code (public endpoint)
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  try {
    const result = await ReferralsService.getApiV1ReferralsValidate(code);
    return result?.data === true;
  } catch (err) {
    console.error('Failed to validate referral code:', err);
    return false;
  }
}

export default {
  getMyReferralCode,
  getReferralStats,
  getReferralHistory,
  validateReferralCode,
};
