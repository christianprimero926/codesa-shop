import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { Product } from '../../../core/models/product.model';
import { CartActionsService } from '../../cart-actions.service';
import { maxQuantityFor } from '../../cart.rules';
import { CartStore } from '../../cart.store';

const CONFIRMATION_MS = 1600;

/** Botón de agregar con su confirmación: cambia a "Agregado" un momento y el contador de la cabecera salta. */
@Component({
  selector: 'app-add-to-cart-button',
  imports: [ButtonModule],
  template: `
    <p-button
      [label]="label()"
      [icon]="confirmed() ? 'pi pi-check' : 'pi pi-cart-plus'"
      [disabled]="unavailable()"
      [severity]="confirmed() ? 'success' : soldOut() ? 'secondary' : 'primary'"
      [size]="size()"
      [fluid]="fluid()"
      [ariaLabel]="ariaLabel()"
      styleClass="add-to-cart"
      (onClick)="add()"
    />
  `,
  styles: `
    :host {
      display: block;
    }

    :host ::ng-deep .add-to-cart .p-button-icon {
      transition: transform 0.2s;
    }

    :host ::ng-deep .p-button-success .p-button-icon {
      animation: pop 0.35s ease-out;
    }

    @keyframes pop {
      0% {
        transform: scale(0.4);
      }
      70% {
        transform: scale(1.25);
      }
      100% {
        transform: scale(1);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddToCartButtonComponent {
  readonly product = input.required<Product>();
  readonly quantity = input(1);
  readonly size = input<'small' | 'large' | undefined>(undefined);
  readonly fluid = input(false);
  readonly compactLabel = input(false);

  private readonly cart = inject(CartStore);
  private readonly actions = inject(CartActionsService);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly confirmed = signal(false);

  protected readonly soldOut = computed(() => this.product().stock === 0);
  private readonly full = computed(
    () => this.cart.quantityOf(this.product().id) >= maxQuantityFor(this.product().stock),
  );

  protected readonly unavailable = computed(
    () => this.soldOut() || (this.full() && !this.confirmed()),
  );

  protected readonly label = computed(() => {
    if (this.soldOut()) {
      return 'Agotado';
    }
    if (this.confirmed()) {
      return 'Agregado';
    }
    if (this.full()) {
      return 'Máximo en carrito';
    }
    return this.compactLabel() ? 'Agregar' : 'Agregar al carrito';
  });

  protected readonly ariaLabel = computed(() => {
    const name = this.product().name;
    if (this.soldOut()) {
      return `${name} está agotado`;
    }
    if (this.full() && !this.confirmed()) {
      return `Ya tienes el máximo disponible de ${name} en el carrito`;
    }
    return `Agregar ${name} al carrito`;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected add(): void {
    if (this.confirmed()) {
      return;
    }
    if (this.actions.add(this.product(), this.quantity())) {
      this.confirmed.set(true);
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.confirmed.set(false), CONFIRMATION_MS);
    }
  }
}
