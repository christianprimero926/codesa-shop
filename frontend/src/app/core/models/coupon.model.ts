export interface Coupon {
  code: string;
  percent: number;
  minSubtotal: number;
  maxDiscount: number | null;
  expired: boolean;
}
