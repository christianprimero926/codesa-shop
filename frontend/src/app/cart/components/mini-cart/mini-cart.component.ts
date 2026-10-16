import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { CartStore } from '../../cart.store';

/** Vista breve del carrito que aparece en la cabecera al agregar un producto. */
@Component({
  selector: 'app-mini-cart',
  imports: [RouterLink, ButtonModule, CopCurrencyPipe],
  templateUrl: './mini-cart.component.html',
  styleUrl: './mini-cart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniCartComponent {
  protected readonly cart = inject(CartStore);

  readonly navigate = output();
  readonly openDrawer = output();
}
