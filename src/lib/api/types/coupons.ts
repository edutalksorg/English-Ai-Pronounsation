// src/lib/api/types/coupons.ts
import { CouponService } from '../generated/services/CouponService';
import type { CouponDto } from '../generated/models/CouponDto';
import type { CreateCouponCommand } from '../generated/models/CreateCouponCommand';
import type { UpdateCouponCommand } from '../generated/models/UpdateCouponCommand';
import type { ValidateCouponQuery } from '../generated/models/ValidateCouponQuery';

export type CouponCreatePayload = {
  code: string;
  description?: string;
  discountType?: "Percentage" | "Fixed";
  discountValue: number;
  maxDiscountAmount?: number;
  minimumPurchaseAmount?: number;
  applicableTo?: "Both" | "Quizzes" | "Plans";
  specificQuizIds?: string[];
  specificPlanIds?: string[];
  maxTotalUsage?: number;
  maxUsagePerUser?: number;
  startDate?: string;
  expiryDate?: string;
};

export type CouponItem = {
  id: string;
  code: string;
  description?: string;
  discountType?: "Percentage" | "Fixed";
  discountValue: number;
  maxDiscountAmount?: number;
  minimumPurchaseAmount?: number;
  applicableTo?: string;
  specificQuizIds?: string[];
  specificPlanIds?: string[];
  maxTotalUsage?: number;
  maxUsagePerUser?: number;
  currentUsageCount?: number;
  startDate?: string;
  expiryDate?: string;
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  remainingUsage?: number;
};

export type CouponValidateRequest = {
  couponCode: string;
  amount: number;
  itemType?: string;
  itemId?: string;
};

export type CouponValidateResponse = {
  discountAmount: number;
  finalPrice: number;
  discountPercentage?: number;
};

// CouponsAPI wrapper for the Coupons.tsx page
export const CouponsAPI = {
  /**
   * List all coupons with pagination and search
   */
  async list({ page = 1, pageSize = 10, searchTerm = '' }) {
    try {
      const result = await CouponService.getApiV1Coupons(
        page,
        pageSize,
        undefined,
        undefined,
        undefined,
        undefined,
        searchTerm
      );
      return result || [];
    } catch (error) {
      console.error('Failed to list coupons:', error);
      throw error;
    }
  },

  /**
   * Create a new coupon
   */
  async create(payload: CreateCouponCommand) {
    try {
      const result = await CouponService.postApiV1Coupons(payload);
      return result;
    } catch (error) {
      console.error('Failed to create coupon:', error);
      throw error;
    }
  },

  /**
   * Update an existing coupon
   */
  async update(id: string, payload: UpdateCouponCommand) {
    try {
      const result = await CouponService.putApiV1Coupons(id, payload);
      return result;
    } catch (error) {
      console.error('Failed to update coupon:', error);
      throw error;
    }
  },

  /**
   * Delete a coupon
   */
  async delete(id: string) {
    try {
      const result = await CouponService.deleteApiV1Coupons(id);
      return result;
    } catch (error) {
      console.error('Failed to delete coupon:', error);
      throw error;
    }
  },

  /**
   * Validate a coupon
   */
  async validate(payload: ValidateCouponQuery) {
    try {
      const result = await CouponService.postApiV1CouponsValidate(payload);
      return result;
    } catch (error) {
      console.error('Failed to validate coupon:', error);
      throw error;
    }
  },
};
