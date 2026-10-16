import { Coupon } from '../core/models/coupon.model';
import { CartLine, CartState } from './cart.model';
import { clampQuantity } from './cart.rules';

export const CART_STORAGE_KEY = 'codesa-shop.cart';
const STORAGE_VERSION = 1;

interface StoredCart {
  version: number;
  state: CartState;
}

export const EMPTY_CART: CartState = { lines: [], coupon: null };

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function readLine(raw: unknown): CartLine | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const line = raw as Record<string, unknown>;
  const { productId, name, brand, category, image, unitPrice, stock, quantity } = line;
  if (
    !isPositiveInteger(productId) ||
    !isText(name) ||
    !isText(brand) ||
    !isText(category) ||
    !isText(image) ||
    !isPositiveInteger(unitPrice) ||
    !isPositiveInteger(stock) ||
    typeof quantity !== 'number'
  ) {
    return null;
  }
  const safeQuantity = clampQuantity(quantity, stock);
  if (safeQuantity === 0) {
    return null;
  }
  return { productId, name, brand, category, image, unitPrice, stock, quantity: safeQuantity };
}

function readCoupon(raw: unknown): Coupon | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const coupon = raw as Record<string, unknown>;
  const { code, percent, minSubtotal, maxDiscount, expired } = coupon;
  if (
    !isText(code) ||
    !isPositiveInteger(percent) ||
    !isPositiveInteger(minSubtotal) ||
    !(maxDiscount === null || isPositiveInteger(maxDiscount)) ||
    expired !== false
  ) {
    return null;
  }
  return { code, percent, minSubtotal, maxDiscount, expired };
}

/** Convierte lo guardado en un estado válido; lo que no cuadra se descarta en vez de romper la app. */
export function parseStoredCart(serialized: string | null): CartState {
  if (!serialized) {
    return EMPTY_CART;
  }
  try {
    const stored = JSON.parse(serialized) as Partial<StoredCart> | null;
    if (!stored || stored.version !== STORAGE_VERSION || !stored.state) {
      return EMPTY_CART;
    }
    const rawLines: unknown = stored.state.lines;
    const lines = Array.isArray(rawLines)
      ? rawLines
          .map(readLine)
          .filter((line): line is CartLine => line !== null)
          .filter(
            (line, index, all) =>
              all.findIndex((other) => other.productId === line.productId) === index,
          )
      : [];
    return { lines, coupon: lines.length > 0 ? readCoupon(stored.state.coupon) : null };
  } catch {
    return EMPTY_CART;
  }
}

export function loadCart(): CartState {
  try {
    return parseStoredCart(localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return EMPTY_CART;
  }
}

export function saveCart(state: CartState): void {
  try {
    const stored: StoredCart = { version: STORAGE_VERSION, state };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Sin almacenamiento disponible (modo privado o cuota llena) el carrito sigue en memoria.
  }
}
