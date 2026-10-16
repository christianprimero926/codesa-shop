import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';

import { CartStore } from '../../cart/cart.store';
import { asAppError, stockDetails, totalsDetails } from '../../core/http/app-error';
import { Customer, Order, OrderRequest, PaymentMethod } from '../../core/models/order.model';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { formatCop } from '../../shared/pipes/cop-currency.pipe';

export interface CheckoutNotice {
  severity: 'error' | 'warn';
  title: string;
  detail: string;
  /** La misma llamada puede repetirse tal cual (red caída o error del servidor). */
  retryable: boolean;
  /** El problema está en los datos de entrega. */
  reviewCustomer: boolean;
}

/** Arma el pedido desde el carrito y traduce cada rechazo del backend en un ajuste del carrito y un aviso. */
@Injectable({ providedIn: 'root' })
export class OrderSubmissionService {
  private readonly cart = inject(CartStore);
  private readonly orders = inject(OrderService);
  private readonly products = inject(ProductService);

  submit(customer: Customer, paymentMethod: PaymentMethod): Observable<Order> {
    const summary = this.cart.summary();
    const request: OrderRequest = {
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city.trim(),
      },
      paymentMethod,
      couponCode: summary.coupon?.active ? summary.coupon.code : null,
      items: this.cart
        .lines()
        .map((line) => ({ productId: line.productId, quantity: line.quantity })),
      total: summary.total,
    };
    return this.orders.create(request).pipe(tap(() => this.cart.completeOrder()));
  }

  handleFailure(failure: unknown): Observable<CheckoutNotice> {
    const error = asAppError(failure);

    const stock = stockDetails(error);
    if (stock) {
      const line = this.cart.lines().find((item) => item.productId === stock.productId);
      const name = line?.name ?? 'Un producto';
      const result = this.cart.adjustToStock(stock.productId, stock.available);
      return of(
        this.notice(
          'warn',
          'Cambió la disponibilidad',
          result === 'removed'
            ? `${name} se agotó y lo quitamos de tu pedido. Revisa el resumen y confirma de nuevo.`
            : `De ${name} solo quedan ${stock.available}. Ajustamos la cantidad; revisa el resumen y confirma de nuevo.`,
        ),
      );
    }

    const totals = totalsDetails(error);
    if (totals) {
      return this.refreshPrices().pipe(
        tap(() => this.cart.showServerTotals(totals)),
        map(() =>
          this.notice(
            'warn',
            'Los precios se actualizaron',
            `El total correcto es ${formatCop(totals.total)}. Ya lo ves en el resumen; confirma de nuevo para continuar.`,
          ),
        ),
      );
    }

    switch (error.code) {
      case 'CUPON_VENCIDO':
      case 'CUPON_INVALIDO': {
        const code = this.cart.coupon()?.code ?? '';
        this.cart.removeCoupon();
        return of(
          this.notice(
            'warn',
            'Quitamos el cupón',
            `${code} ya no es válido. Revisa el nuevo total y confirma de nuevo.`,
          ),
        );
      }
      case 'CUPON_MONTO_MINIMO':
        return of(this.notice('warn', 'El cupón no aplica', error.message));
      case 'CLIENTE_INCOMPLETO':
        return of({
          ...this.notice('error', 'Revisa tus datos', error.message),
          reviewCustomer: true,
        });
      case 'SIN_CONEXION':
      case 'ERROR_INTERNO':
      case 'ERROR_DESCONOCIDO':
        return of({
          ...this.notice('error', 'No pudimos confirmar tu pedido', error.message),
          retryable: true,
        });
      default:
        return of(this.notice('error', 'No pudimos confirmar tu pedido', error.message));
    }
  }

  /** Trae precio y stock actuales de los productos del carrito. */
  private refreshPrices(): Observable<void> {
    const requests = this.cart
      .lines()
      .map((line) => this.products.getProduct(line.productId).pipe(catchError(() => of(null))));
    return forkJoin(requests).pipe(
      map((products) => this.cart.refreshProducts(products.filter((product) => product !== null))),
    );
  }

  private notice(
    severity: CheckoutNotice['severity'],
    title: string,
    detail: string,
  ): CheckoutNotice {
    return { severity, title, detail, retryable: false, reviewCustomer: false };
  }
}
