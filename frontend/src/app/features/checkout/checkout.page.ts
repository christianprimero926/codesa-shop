import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepperModule } from 'primeng/stepper';
import { debounceTime, finalize } from 'rxjs';

import { CART_TOAST_KEY } from '../../cart/cart-feedback.service';
import { CartStore } from '../../cart/cart.store';
import { CartSummaryComponent } from '../../cart/components/cart-summary/cart-summary.component';
import { Customer, PaymentMethod } from '../../core/models/order.model';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CheckoutDraftService, CheckoutStep } from './checkout-draft.service';
import { CheckoutNotice, OrderSubmissionService } from './order-submission.service';

type CustomerField = keyof Customer;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\d{7,10}$/;
const DELIVERY_FIELDS: readonly CustomerField[] = ['fullName', 'email', 'phone', 'address', 'city'];

const FIELD_ERRORS: Record<CustomerField, Record<string, string>> = {
  fullName: {
    required: 'Escribe tu nombre completo.',
    minlength: 'Escribe nombre y apellido.',
  },
  email: {
    required: 'Escribe tu correo.',
    pattern: 'Revisa el correo, por ejemplo nombre@correo.com.',
  },
  phone: {
    required: 'Escribe tu teléfono.',
    pattern: 'El teléfono debe tener entre 7 y 10 dígitos, sin espacios ni signos.',
  },
  address: {
    required: 'Escribe la dirección de entrega.',
    minlength: 'La dirección parece incompleta.',
  },
  city: {
    required: 'Escribe la ciudad.',
    minlength: 'Escribe el nombre completo de la ciudad.',
  },
};

export interface PaymentOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}

export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  {
    value: 'CARD',
    label: 'Tarjeta débito o crédito',
    description: 'Pagas al recibir la confirmación del pedido.',
    icon: 'pi pi-credit-card',
  },
  {
    value: 'CASH',
    label: 'Efectivo contra entrega',
    description: 'Pagas en efectivo cuando recibes tu pedido.',
    icon: 'pi pi-wallet',
  },
];

@Component({
  selector: 'app-checkout-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    RadioButtonModule,
    StepperModule,
    CartSummaryComponent,
    CopCurrencyPipe,
  ],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  protected readonly cart = inject(CartStore);
  private readonly drafts = inject(CheckoutDraftService);
  private readonly submission = inject(OrderSubmissionService);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly paymentOptions = [...PAYMENT_OPTIONS];

  protected readonly form = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(PHONE_PATTERN)],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5)],
    }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    paymentMethod: new FormControl<PaymentMethod | null>(null, Validators.required),
  });

  protected readonly step = signal<CheckoutStep>(1);
  protected readonly submitting = signal(false);
  protected readonly notice = signal<CheckoutNotice | null>(null);
  protected readonly draftRestored = signal(false);
  private orderPlaced = false;

  constructor() {
    this.restoreDraft();

    this.form.valueChanges
      .pipe(debounceTime(250), takeUntilDestroyed())
      .subscribe(() => this.saveDraft());

    // Si el carrito se vacía desde el panel lateral, no hay nada que pagar.
    effect(() => {
      if (this.cart.isEmpty() && !this.orderPlaced) {
        this.messages.add({
          key: CART_TOAST_KEY,
          severity: 'info',
          summary: 'Tu carrito está vacío',
          detail: 'Agrega al menos un producto para continuar con la compra.',
          life: 4000,
        });
        void this.router.navigate(['/carrito']);
      }
    });
  }

  protected fieldError(field: CustomerField): string | null {
    const control = this.form.controls[field];
    if (!control.invalid || !control.touched) {
      return null;
    }
    const firstError = Object.keys(control.errors ?? {})[0];
    return FIELD_ERRORS[field][firstError] ?? 'Revisa este campo.';
  }

  protected paymentLabel(method: PaymentMethod | null): string {
    return PAYMENT_OPTIONS.find((option) => option.value === method)?.label ?? '';
  }

  protected goToPayment(): void {
    const invalid = DELIVERY_FIELDS.filter((field) => this.form.controls[field].invalid);
    if (invalid.length > 0) {
      invalid.forEach((field) => this.form.controls[field].markAsTouched());
      this.focusField(invalid[0]);
      return;
    }
    this.changeStep(2);
  }

  protected changeStep(step: CheckoutStep): void {
    this.step.set(step);
    this.saveDraft();
    requestAnimationFrame(() =>
      this.host.nativeElement.querySelector<HTMLElement>(`#checkout-step-${step}-title`)?.focus(),
    );
  }

  protected discardDraft(): void {
    this.drafts.clear();
    this.form.reset();
    this.draftRestored.set(false);
    this.changeStep(1);
  }

  protected confirm(): void {
    if (this.submitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const firstInvalid = DELIVERY_FIELDS.find((field) => this.form.controls[field].invalid);
      if (firstInvalid) {
        this.changeStep(1);
        requestAnimationFrame(() => this.focusField(firstInvalid));
      }
      return;
    }

    const { paymentMethod, ...customer } = this.form.getRawValue();
    if (!paymentMethod) {
      return;
    }
    this.submitting.set(true);
    this.notice.set(null);
    this.draftRestored.set(false);

    this.submission
      .submit(customer, paymentMethod)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (order) => {
          this.orderPlaced = true;
          this.drafts.clear();
          void this.router.navigate(['/pedido', order.number], { state: { order } });
        },
        error: (failure: unknown) => this.showFailure(failure),
      });
  }

  private showFailure(failure: unknown): void {
    this.submitting.set(true);
    this.submission
      .handleFailure(failure)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((notice) => {
        this.notice.set(notice);
        if (notice.reviewCustomer) {
          this.form.markAllAsTouched();
          this.changeStep(1);
        }
        requestAnimationFrame(() =>
          this.host.nativeElement.querySelector<HTMLElement>('#checkout-notice')?.focus(),
        );
      });
  }

  private restoreDraft(): void {
    const draft = this.drafts.load();
    if (!draft) {
      return;
    }
    this.form.setValue({ ...draft.customer, paymentMethod: draft.paymentMethod });
    const hasData = DELIVERY_FIELDS.some((field) => draft.customer[field].trim() !== '');
    this.draftRestored.set(hasData);
    // Solo se vuelve al paso de pago si los datos de entrega siguen siendo válidos.
    const deliveryValid = DELIVERY_FIELDS.every((field) => this.form.controls[field].valid);
    this.step.set(draft.step === 2 && deliveryValid ? 2 : 1);
    if (hasData) {
      DELIVERY_FIELDS.filter((field) => draft.customer[field] !== '').forEach((field) =>
        this.form.controls[field].markAsTouched(),
      );
    }
  }

  private saveDraft(): void {
    const { paymentMethod, ...customer } = this.form.getRawValue();
    this.drafts.save({ customer, paymentMethod, step: this.step() });
  }

  private focusField(field: CustomerField): void {
    this.host.nativeElement.querySelector<HTMLElement>(`#checkout-${field}`)?.focus();
  }
}
