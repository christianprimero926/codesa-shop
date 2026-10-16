import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';

import { Coupon } from '../core/models/coupon.model';
import { OrderTotals } from '../core/models/order.model';
import { Product } from '../core/models/product.model';
import { CART_STORAGE_KEY, EMPTY_CART, loadCart, parseStoredCart, saveCart } from './cart-storage';
import { CartLine, CartLineView, CartState, CartSummary, CouponStatus } from './cart.model';
import {
  clampQuantity,
  couponApplies,
  discountFor,
  FREE_SHIPPING_THRESHOLD,
  freeShippingRemaining,
  maxQuantityFor,
  shippingFor,
} from './cart.rules';

export interface AddToCartResult {
  added: number;
  quantityInCart: number;
  limitReached: boolean;
}

export type StockAdjustment = 'adjusted' | 'removed';

const MINI_CART_LINES = 3;

/**
 * Única fuente de verdad del carrito. Los componentes leen señales derivadas
 * y modifican el estado solo a través de estos métodos.
 */
@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly state = signal<CartState>(loadCart());
  private readonly serverTotals = signal<OrderTotals | null>(null);
  private readonly alerts = signal<ReadonlyMap<number, string>>(new Map());

  readonly lines = computed(() => this.state().lines);
  readonly coupon = computed(() => this.state().coupon);
  readonly isEmpty = computed(() => this.state().lines.length === 0);
  readonly itemCount = computed(() =>
    this.state().lines.reduce((count, line) => count + line.quantity, 0),
  );
  readonly lineViews = computed<CartLineView[]>(() => {
    const alerts = this.alerts();
    return this.state().lines.map((line) => ({
      ...line,
      lineTotal: line.unitPrice * line.quantity,
      maxQuantity: maxQuantityFor(line.stock),
      alert: alerts.get(line.productId) ?? null,
    }));
  });
  readonly previewLines = computed(() => this.lineViews().slice(0, MINI_CART_LINES));
  readonly hiddenLineCount = computed(() =>
    Math.max(0, this.state().lines.length - MINI_CART_LINES),
  );

  readonly summary = computed<CartSummary>(() => {
    const { lines, coupon } = this.state();
    const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const confirmed = this.serverTotals();
    const discount = confirmed?.discount ?? discountFor(coupon, subtotal);
    const shipping = confirmed?.shipping ?? shippingFor(subtotal);
    const remaining = freeShippingRemaining(subtotal);

    return {
      subtotal: confirmed?.subtotal ?? subtotal,
      discount,
      shipping,
      total: confirmed?.total ?? subtotal - discount + shipping,
      itemCount: this.itemCount(),
      freeShippingRemaining: remaining,
      freeShippingProgress: Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)),
      coupon: coupon ? this.couponStatus(coupon, subtotal) : null,
      confirmedByServer: confirmed !== null,
    };
  });

  constructor() {
    effect(() => saveCart(this.state()));
    this.syncAcrossTabs();
  }

  quantityOf(productId: number): number {
    return this.state().lines.find((line) => line.productId === productId)?.quantity ?? 0;
  }

  add(product: Product, quantity: number): AddToCartResult {
    const current = this.quantityOf(product.id);
    const target = clampQuantity(current + quantity, product.stock);
    const added = Math.max(0, target - current);
    if (added > 0) {
      this.update((state) => {
        const exists = state.lines.some((line) => line.productId === product.id);
        const lines = exists
          ? state.lines.map((line) =>
              line.productId === product.id
                ? { ...this.fromProduct(product), quantity: target }
                : line,
            )
          : [...state.lines, { ...this.fromProduct(product), quantity: target }];
        return { ...state, lines };
      });
    }
    return {
      added,
      quantityInCart: Math.max(current, target),
      limitReached: current + quantity > maxQuantityFor(product.stock),
    };
  }

  setQuantity(productId: number, quantity: number): void {
    this.update((state) => ({
      ...state,
      lines: state.lines.map((line) =>
        line.productId === productId
          ? { ...line, quantity: clampQuantity(quantity, line.stock) }
          : line,
      ),
    }));
    this.clearAlert(productId);
  }

  /** Devuelve el estado previo para poder deshacer. */
  remove(productId: number): CartState {
    const previous = this.state();
    this.update((state) =>
      this.withLines(
        state,
        state.lines.filter((line) => line.productId !== productId),
      ),
    );
    this.clearAlert(productId);
    return previous;
  }

  clear(): CartState {
    const previous = this.state();
    this.update(() => EMPTY_CART);
    this.alerts.set(new Map());
    return previous;
  }

  restore(snapshot: CartState): void {
    this.update(() => snapshot);
  }

  applyCoupon(coupon: Coupon): void {
    this.update((state) => ({ ...state, coupon }));
  }

  removeCoupon(): void {
    this.update((state) => ({ ...state, coupon: null }));
  }

  /** Ajusta una línea al stock real que informó el servidor. */
  adjustToStock(productId: number, available: number): StockAdjustment {
    const max = maxQuantityFor(available);
    if (max === 0) {
      this.update((state) =>
        this.withLines(
          state,
          state.lines.filter((line) => line.productId !== productId),
        ),
      );
      this.clearAlert(productId);
      return 'removed';
    }
    this.update((state) => ({
      ...state,
      lines: state.lines.map((line) =>
        line.productId === productId ? { ...line, stock: available, quantity: max } : line,
      ),
    }));
    this.alerts.update((current) =>
      new Map(current).set(
        productId,
        `Ajustamos la cantidad a ${max}: es lo que queda disponible.`,
      ),
    );
    return 'adjusted';
  }

  /** Actualiza precio y stock de las líneas con lo que devuelve el catálogo. */
  refreshProducts(products: Product[]): void {
    this.update((state) => ({
      ...state,
      lines: state.lines.map((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product
          ? { ...this.fromProduct(product), quantity: clampQuantity(line.quantity, product.stock) }
          : line;
      }),
    }));
  }

  /** Muestra los totales del servidor hasta que el carrito vuelva a cambiar. */
  showServerTotals(totals: OrderTotals): void {
    this.serverTotals.set(totals);
  }

  /** El pedido quedó creado: el carrito se vacía sin opción de deshacer. */
  completeOrder(): void {
    this.update(() => EMPTY_CART);
    this.alerts.set(new Map());
  }

  private update(change: (state: CartState) => CartState): void {
    this.state.update(change);
    this.serverTotals.set(null);
  }

  private withLines(state: CartState, lines: CartLine[]): CartState {
    return { lines, coupon: lines.length > 0 ? state.coupon : null };
  }

  private couponStatus(coupon: Coupon, subtotal: number): CouponStatus {
    const active = couponApplies(coupon, subtotal);
    return {
      code: coupon.code,
      active,
      minSubtotal: coupon.minSubtotal,
      missing: active ? 0 : Math.max(0, coupon.minSubtotal - subtotal),
    };
  }

  private fromProduct(product: Product): Omit<CartLine, 'quantity'> {
    return {
      productId: product.id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      image: product.image,
      unitPrice: product.price,
      stock: product.stock,
    };
  }

  private clearAlert(productId: number): void {
    if (this.alerts().has(productId)) {
      this.alerts.update((current) => {
        const next = new Map(current);
        next.delete(productId);
        return next;
      });
    }
  }

  private syncAcrossTabs(): void {
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        this.state.set(parseStoredCart(event.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorage));
  }
}
