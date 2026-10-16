import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { combineLatest, of, startWith, Subject, switchMap } from 'rxjs';

import { Order, PaymentMethod } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { StateBlockComponent } from '../../shared/components/state-block/state-block.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { LoadState, LOADING, toLoadState } from '../../shared/utils/load-state';

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CARD: 'Tarjeta débito o crédito',
  CASH: 'Efectivo contra entrega',
};

@Component({
  selector: 'app-order-confirmation-page',
  imports: [
    DatePipe,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    StateBlockComponent,
    CopCurrencyPipe,
  ],
  templateUrl: './order-confirmation.page.html',
  styleUrl: './order-confirmation.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationPage {
  /** Viene del parámetro :numero de la ruta. */
  readonly numero = input.required<string>();

  private readonly orders = inject(OrderService);
  private readonly retry$ = new Subject<void>();

  /** El pedido recién creado llega en el estado de la navegación; tras un F5 se consulta al backend. */
  private readonly createdOrder = inject(Router).getCurrentNavigation()?.extras.state?.['order'] as
    Order | undefined;

  protected readonly state = toSignal(
    combineLatest([toObservable(this.numero), this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([orderNumber]) =>
        this.createdOrder?.number === orderNumber
          ? of<LoadState<Order>>({ status: 'success', data: this.createdOrder })
          : this.orders.getByNumber(orderNumber).pipe(toLoadState()),
      ),
    ),
    { initialValue: LOADING as LoadState<Order> },
  );

  protected readonly firstName = computed(() => {
    const state = this.state();
    return state.status === 'success' ? state.data.customer.fullName.trim().split(/\s+/)[0] : '';
  });

  protected readonly justCreated = this.createdOrder !== undefined;

  protected paymentLabel(method: PaymentMethod): string {
    return PAYMENT_LABELS[method];
  }

  protected retry(): void {
    this.retry$.next();
  }
}
