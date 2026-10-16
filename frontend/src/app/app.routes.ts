import { Routes } from '@angular/router';

import { cartNotEmptyGuard } from './features/checkout/cart-not-empty.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Catálogo',
    loadComponent: () => import('./features/catalog/catalog.page').then((page) => page.CatalogPage),
  },
  {
    path: 'producto/:id',
    title: 'Producto',
    loadComponent: () =>
      import('./features/product-detail/product-detail.page').then(
        (page) => page.ProductDetailPage,
      ),
  },
  {
    path: 'carrito',
    title: 'Tu carrito',
    loadComponent: () => import('./features/cart/cart.page').then((page) => page.CartPage),
  },
  {
    path: 'checkout',
    title: 'Finalizar compra',
    canActivate: [cartNotEmptyGuard],
    loadComponent: () =>
      import('./features/checkout/checkout.page').then((page) => page.CheckoutPage),
  },
  {
    path: 'pedido/:numero',
    title: 'Pedido confirmado',
    loadComponent: () =>
      import('./features/order-confirmation/order-confirmation.page').then(
        (page) => page.OrderConfirmationPage,
      ),
  },
  {
    path: '**',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./features/not-found/not-found.page').then((page) => page.NotFoundPage),
  },
];
