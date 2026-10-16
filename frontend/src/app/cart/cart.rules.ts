import { Coupon } from '../core/models/coupon.model';

/**
 * Reglas de negocio del carrito. Es el único lugar del front donde viven;
 * el backend las vuelve a aplicar al recibir el pedido.
 */
export const MAX_UNITS_PER_LINE = 10;
export const SHIPPING_COST = 12_900;
export const FREE_SHIPPING_THRESHOLD = 200_000;

/** Desde cuánto faltante se resalta el aviso de envío gratis. */
export const FREE_SHIPPING_NEAR_AMOUNT = 60_000;

export function maxQuantityFor(stock: number): number {
  return Math.max(0, Math.min(stock, MAX_UNITS_PER_LINE));
}

export function clampQuantity(quantity: number, stock: number): number {
  const max = maxQuantityFor(stock);
  if (!Number.isFinite(quantity)) {
    return Math.min(1, max);
  }
  return Math.min(Math.max(Math.trunc(quantity), Math.min(1, max)), max);
}

export function shippingFor(subtotal: number): number {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

export function freeShippingRemaining(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

export function couponApplies(coupon: Coupon, subtotal: number): boolean {
  return !coupon.expired && subtotal >= coupon.minSubtotal;
}

export function discountFor(coupon: Coupon | null, subtotal: number): number {
  if (!coupon || !couponApplies(coupon, subtotal)) {
    return 0;
  }
  const discount = Math.round((subtotal * coupon.percent) / 100);
  return coupon.maxDiscount === null ? discount : Math.min(discount, coupon.maxDiscount);
}
