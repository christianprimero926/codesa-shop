import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { StateBlockComponent } from '../../../shared/components/state-block/state-block.component';

@Component({
  selector: 'app-cart-empty',
  imports: [RouterLink, ButtonModule, StateBlockComponent],
  template: `
    <app-state-block
      icon="pi-shopping-cart"
      title="Tu carrito está vacío"
      description="Explora el catálogo y agrega lo que te guste. Desde $ 200.000 el envío es gratis."
      [compact]="compact()"
    >
      <a pButton routerLink="/" (click)="navigate.emit()"
        ><span pButtonLabel>Ver catálogo</span
        ><i class="pi pi-arrow-right" pButtonIcon aria-hidden="true"></i
      ></a>
    </app-state-block>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartEmptyComponent {
  readonly compact = input(false);
  readonly navigate = output();
}
