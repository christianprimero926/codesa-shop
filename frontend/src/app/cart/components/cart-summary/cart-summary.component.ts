import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { CartStore } from '../../cart.store';
import { CouponFormComponent } from '../coupon-form/coupon-form.component';
import { FreeShippingProgressComponent } from '../free-shipping-progress/free-shipping-progress.component';

/** Resumen de totales. Solo lee el store: no calcula nada por su cuenta. */
@Component({
  selector: 'app-cart-summary',
  imports: [CopCurrencyPipe, CouponFormComponent, FreeShippingProgressComponent],
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummaryComponent {
  readonly idPrefix = input.required<string>();
  readonly showTitle = input(true);
  readonly showCoupon = input(true);
  readonly showShippingProgress = input(true);
  readonly showNote = input(true);

  protected readonly cart = inject(CartStore);
}
