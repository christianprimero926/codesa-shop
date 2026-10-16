import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';

import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { CartActionsService } from '../../cart-actions.service';
import { CartLineView } from '../../cart.model';

const LOW_STOCK = 3;

@Component({
  selector: 'app-cart-line',
  imports: [
    FormsModule,
    RouterLink,
    ButtonModule,
    InputNumberModule,
    MessageModule,
    CopCurrencyPipe,
  ],
  templateUrl: './cart-line.component.html',
  styleUrl: './cart-line.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'cart-line',
    '[class.cart-line--compact]': 'compact()',
    '[class.cart-line--alert]': 'line().alert',
  },
})
export class CartLineComponent {
  readonly line = input.required<CartLineView>();
  readonly compact = input(false);

  protected readonly actions = inject(CartActionsService);
  protected readonly lowStock = LOW_STOCK;
}
