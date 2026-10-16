import { inject, Injectable } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

import { Product } from '../core/models/product.model';
import { CartFeedbackService } from './cart-feedback.service';
import { CartLine, CartState } from './cart.model';
import { CartStore } from './cart.store';

/**
 * Acciones del usuario sobre el carrito. Combina el cambio de estado con su aviso,
 * para que el panel lateral y la página /carrito se comporten igual.
 */
@Injectable({ providedIn: 'root' })
export class CartActionsService {
  private readonly store = inject(CartStore);
  private readonly feedback = inject(CartFeedbackService);
  private readonly confirmation = inject(ConfirmationService);

  add(product: Product, quantity = 1): boolean {
    const result = this.store.add(product, quantity);
    this.feedback.added(product, result);
    return result.added > 0;
  }

  changeQuantity(line: CartLine, quantity: number | null): void {
    if (quantity === null || quantity === line.quantity) {
      return;
    }
    this.store.setQuantity(line.productId, quantity);
    this.feedback.quantityChanged(line, this.store.quantityOf(line.productId));
  }

  remove(line: CartLine): void {
    const snapshot = this.store.remove(line.productId);
    this.feedback.removed(line, snapshot);
  }

  confirmClear(): void {
    this.confirmation.confirm({
      header: '¿Vaciar el carrito?',
      message: `Vas a quitar ${this.itemsText()}. Podrás deshacerlo durante unos segundos.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, vaciar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      defaultFocus: 'reject',
      accept: () => this.feedback.cleared(this.store.clear()),
    });
  }

  undo(snapshot: CartState): void {
    this.store.restore(snapshot);
    this.feedback.restored();
  }

  removeCoupon(): void {
    const coupon = this.store.coupon();
    if (coupon) {
      this.store.removeCoupon();
      this.feedback.couponRemoved(coupon.code);
    }
  }

  private itemsText(): string {
    const count = this.store.itemCount();
    return count === 1 ? 'el único artículo' : `los ${count} artículos`;
  }
}
