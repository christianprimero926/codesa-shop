import { LiveAnnouncer } from '@angular/cdk/a11y';
import { inject, Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';

import { Product } from '../core/models/product.model';
import { formatCop } from '../shared/pipes/cop-currency.pipe';
import { CartLine, CartState } from './cart.model';
import { AddToCartResult, CartStore } from './cart.store';

export const CART_TOAST_KEY = 'cart';

export interface CartToastData {
  undo?: CartState;
  viewCart?: boolean;
}

export interface AddedEvent {
  productId: number;
  sequence: number;
}

/**
 * Avisos de cada acción del carrito: toast visible, mensaje para lector de pantalla
 * y la opción de deshacer cuando aplica.
 */
@Injectable({ providedIn: 'root' })
export class CartFeedbackService {
  private readonly messages = inject(MessageService);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly store = inject(CartStore);
  private readonly lastAddedEvent = signal<AddedEvent | null>(null);
  private sequence = 0;

  readonly lastAdded = this.lastAddedEvent.asReadonly();

  added(product: Product, result: AddToCartResult): void {
    if (result.added === 0) {
      this.show(
        'warn',
        'No agregamos más unidades',
        `Ya tienes el máximo disponible de ${product.name} (${result.quantityInCart}).`,
      );
      return;
    }
    this.lastAddedEvent.set({ productId: product.id, sequence: ++this.sequence });
    const units = result.added === 1 ? '1 unidad' : `${result.added} unidades`;
    const detail = result.limitReached
      ? `Agregamos ${units} de ${product.name}: es el máximo disponible.`
      : `${units} de ${product.name}.`;
    this.show('success', 'Agregado al carrito', detail, { viewCart: true });
  }

  quantityChanged(line: CartLine, quantity: number): void {
    this.announce(
      `${line.name}: ${quantity} ${quantity === 1 ? 'unidad' : 'unidades'}. ${this.totalsText()}`,
    );
  }

  removed(line: CartLine, snapshot: CartState): void {
    this.show('info', 'Producto quitado', `Quitaste ${line.name} del carrito.`, { undo: snapshot });
  }

  cleared(snapshot: CartState): void {
    this.show('info', 'Carrito vacío', 'Quitaste todos los productos.', { undo: snapshot });
  }

  restored(): void {
    this.messages.clear(CART_TOAST_KEY);
    this.show('success', 'Cambio deshecho', 'Tu carrito quedó como estaba.');
  }

  couponApplied(code: string): void {
    this.show('success', 'Cupón aplicado', `${code} ya se refleja en tu resumen.`);
  }

  couponRemoved(code: string): void {
    this.show('info', 'Cupón retirado', `Quitaste el cupón ${code}.`);
  }

  private totalsText(): string {
    const summary = this.store.summary();
    return `Total ${formatCop(summary.total)}, ${summary.itemCount} artículos en el carrito.`;
  }

  private show(
    severity: 'success' | 'info' | 'warn',
    summary: string,
    detail: string,
    data: CartToastData = {},
  ): void {
    // El toast ya se anuncia por sí mismo (role="alert"), no se repite en el LiveAnnouncer.
    const life = data.undo ? 7000 : 3500;
    this.messages.add({ key: CART_TOAST_KEY, severity, summary, detail, life, data });
  }

  private announce(message: string): void {
    void this.announcer.announce(message, 'polite');
  }
}
