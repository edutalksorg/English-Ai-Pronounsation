/* API Wrapper for Coupons - Uses generated CouponService */
import { CouponService } from './generated/services/CouponService';
import type { CouponDto } from './generated/models/CouponDto';

export interface CouponValidateResult {
  discountAmount: number;
  finalPrice: number;
  discountPercentage?: number;
  appliedCode?: string;
}

export interface ApplyCouponPayload {
  couponCode: string;
  originalAmount?: number;
  itemType?: string;
  itemId?: string;
  orderId?: string;
}

/**
 * Get all available coupons
 */
export async function getAllCoupons(pageNumber?: number, pageSize?: number): Promise<CouponDto[]> {
  try {
    const result = await CouponService.getApiV1Coupons(pageNumber ?? 1, pageSize ?? 50);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    console.error('Failed to fetch coupons:', err);
    return [];
  }
}

/**
 * Get a specific coupon by code
 */
export async function getCouponByCode(code: string): Promise<CouponDto | null> {
  try {
    const result = await CouponService.getApiV1Coupons1(code.toUpperCase());
    return result ?? null;
  } catch (err) {
    console.error(`Failed to fetch coupon ${code}:`, err);
    return null;
  }
}

/**
 * Apply a coupon code
 */
export async function applyCoupon(payload: ApplyCouponPayload): Promise<any> {
  try {
    const result = await CouponService.postApiV1CouponsApply({
      couponCode: payload.couponCode.toUpperCase(),
      originalAmount: payload.originalAmount ?? 0,
      itemType: payload.itemType ?? 'Subscription',
      itemId: payload.itemId,
      orderId: payload.orderId,
    });
    return result;
  } catch (err: any) {
    console.error('Failed to apply coupon:', err);
    throw err;
  }
}

/**
 * Validate a coupon code (check if it's valid without applying)
 */
export async function validateCoupon(
  code: string,
  amount: number,
  itemType?: string
): Promise<CouponValidateResult | null> {
  try {
    const coupon = await getCouponByCode(code);
    if (!coupon) return null;

    // Calculate discount based on coupon details
    let discountAmount = 0;
    let discountPercentage = 0;

    if (coupon.discountType === 'Percentage') {
      discountPercentage = coupon.discountValue ?? 0;
      discountAmount = (amount * discountPercentage) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      // Fixed amount
      discountAmount = coupon.discountValue ?? 0;
    }

    const finalPrice = Math.max(0, amount - discountAmount);

    return {
      discountAmount,
      finalPrice,
      discountPercentage,
      appliedCode: coupon.code ?? code,
    };
  } catch (err) {
    console.error('Failed to validate coupon:', err);
    return null;
  }
}

export default {
  getAllCoupons,
  getCouponByCode,
  applyCoupon,
  validateCoupon,
};
