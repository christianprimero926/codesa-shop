import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';

import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { FREE_SHIPPING_NEAR_AMOUNT, FREE_SHIPPING_THRESHOLD } from '../../cart.rules';
import { CartStore } from '../../cart.store';

@Component({
  selector: 'app-free-shipping-progress',
  imports: [ProgressBarModule, CopCurrencyPipe],
  template: `
    @let summary = cart.summary();
    <div
      class="free-shipping"
      [class.free-shipping--near]="isNear()"
      [class.free-shipping--done]="summary.freeShippingRemaining === 0"
    >
      <p class="free-shipping__text">
        <i class="pi pi-truck" aria-hidden="true"></i>
        @if (summary.freeShippingRemaining === 0) {
          <span><strong>¡Tienes envío gratis!</strong></span>
        } @else {
          <span>
            @if (isNear()) {
              <strong>¡Ya casi!</strong>
            }
            Te faltan
            <strong class="app-money">{{ summary.freeShippingRemaining | cop }}</strong> para el
            envío gratis.
          </span>
        }
      </p>
      <p-progressbar
        [value]="summary.freeShippingProgress"
        [showValue]="false"
        styleClass="free-shipping__bar"
        [attr.aria-label]="'Progreso hacia el envío gratis desde ' + (threshold | cop)"
      />
    </div>
  `,
  styleUrl: './free-shipping-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FreeShippingProgressComponent {
  protected readonly cart = inject(CartStore);
  protected readonly threshold = FREE_SHIPPING_THRESHOLD;

  protected readonly isNear = computed(() => {
    const remaining = this.cart.summary().freeShippingRemaining;
    return remaining > 0 && remaining <= FREE_SHIPPING_NEAR_AMOUNT;
  });
}
