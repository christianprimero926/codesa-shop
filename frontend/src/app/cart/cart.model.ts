import { Coupon } from '../core/models/coupon.model';
import { OrderTotals } from '../core/models/order.model';

export interface CartLine {
  productId: number;
  name: string;
  brand: string;
  category: string;
  image: string;
  unitPrice: number;
  stock: number;
  quantity: number;
}

/** Línea lista para pintar: lo derivado ya viene calculado desde el store. */
export interface CartLineView extends CartLine {
  lineTotal: number;
  maxQuantity: number;
  alert: string | null;
}

export interface CartState {
  lines: CartLine[];
  coupon: Coupon | null;
}

export interface CouponStatus {
  code: string;
  active: boolean;
  minSubtotal: number;
  /** Lo que falta para que el cupón vuelva a aplicar cuando el subtotal bajó del mínimo. */
  missing: number;
}

export interface CartSummary extends OrderTotals {
  itemCount: number;
  freeShippingRemaining: number;
  freeShippingProgress: number;
  coupon: CouponStatus | null;
  /** true cuando los totales vienen de la respuesta del servidor. */
  confirmedByServer: boolean;
}
