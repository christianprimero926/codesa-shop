import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { CART_TOAST_KEY } from '../../cart/cart-feedback.service';
import { CartStore } from '../../cart/cart.store';

export const cartNotEmptyGuard: CanActivateFn = () => {
  if (!inject(CartStore).isEmpty()) {
    return true;
  }
  inject(MessageService).add({
    key: CART_TOAST_KEY,
    severity: 'info',
    summary: 'Tu carrito está vacío',
    detail: 'Agrega al menos un producto para continuar con la compra.',
    life: 4000,
  });
  return inject(Router).createUrlTree(['/carrito']);
};
