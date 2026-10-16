import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RatingModule } from 'primeng/rating';

import { AddToCartButtonComponent } from '../../../cart/components/add-to-cart-button/add-to-cart-button.component';
import { Product } from '../../../core/models/product.model';
import { StockTagComponent } from '../../../shared/components/stock-tag/stock-tag.component';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';
import { RatingTextPipe } from '../../../shared/pipes/rating-text.pipe';

@Component({
  selector: 'app-product-card',
  imports: [
    NgOptimizedImage,
    FormsModule,
    RouterLink,
    RatingModule,
    AddToCartButtonComponent,
    StockTagComponent,
    CopCurrencyPipe,
    RatingTextPipe,
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  /** Las primeras tarjetas cargan su imagen de inmediato porque se ven sin hacer scroll. */
  readonly priority = input(false);
}
