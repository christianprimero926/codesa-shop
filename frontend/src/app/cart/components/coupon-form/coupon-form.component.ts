import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { finalize, Subscription } from 'rxjs';

import { asAppError, minimumAmountDetails } from '../../../core/http/app-error';
import { CouponService } from '../../../core/services/coupon.service';
import { CopCurrencyPipe, formatCop } from '../../../shared/pipes/cop-currency.pipe';
import { CartActionsService } from '../../cart-actions.service';
import { CartFeedbackService } from '../../cart-feedback.service';
import { CartStore } from '../../cart.store';

@Component({
  selector: 'app-coupon-form',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, MessageModule, CopCurrencyPipe],
  templateUrl: './coupon-form.component.html',
  styleUrl: './coupon-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CouponFormComponent {
  /** Distingue los ids cuando el panel y la página muestran el formulario a la vez. */
  readonly idPrefix = input.required<string>();

  protected readonly cart = inject(CartStore);
  protected readonly actions = inject(CartActionsService);
  private readonly coupons = inject(CouponService);
  private readonly feedback = inject(CartFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly codeControl = new FormControl('', { nonNullable: true });
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  private request: Subscription | null = null;

  protected apply(event: Event): void {
    event.preventDefault();
    const code = this.codeControl.value.trim().toUpperCase();
    if (!code) {
      this.error.set('Escribe el código del cupón.');
      return;
    }
    this.request?.unsubscribe();
    this.loading.set(true);
    this.error.set(null);

    this.request = this.coupons
      .validate(code, this.cart.summary().subtotal)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (coupon) => {
          this.cart.applyCoupon(coupon);
          this.feedback.couponApplied(coupon.code);
          this.codeControl.setValue('');
        },
        error: (failure: unknown) => this.error.set(this.describe(failure)),
      });
  }

  protected clearError(): void {
    if (this.error()) {
      this.error.set(null);
    }
  }

  private describe(failure: unknown): string {
    const error = asAppError(failure);
    const minimum = minimumAmountDetails(error);
    if (minimum) {
      return `Este cupón aplica para compras desde ${formatCop(minimum.minSubtotal)}. Te faltan ${formatCop(minimum.missing)}.`;
    }
    if (error.code === 'CUPON_VENCIDO') {
      return 'Este cupón ya venció y no se puede usar. Si tienes otro código, pruébalo aquí.';
    }
    return error.message;
  }
}
