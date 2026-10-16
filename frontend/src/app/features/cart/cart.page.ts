import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { CartActionsService } from '../../cart/cart-actions.service';
import { CartStore } from '../../cart/cart.store';
import { CartEmptyComponent } from '../../cart/components/cart-empty/cart-empty.component';
import { CartLineComponent } from '../../cart/components/cart-line/cart-line.component';
import { CartSummaryComponent } from '../../cart/components/cart-summary/cart-summary.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CartSuggestionsComponent } from './cart-suggestions/cart-suggestions.component';

@Component({
  selector: 'app-cart-page',
  imports: [
    RouterLink,
    ButtonModule,
    CartEmptyComponent,
    CartLineComponent,
    CartSummaryComponent,
    CartSuggestionsComponent,
    CopCurrencyPipe,
  ],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  protected readonly cart = inject(CartStore);
  protected readonly actions = inject(CartActionsService);
}
