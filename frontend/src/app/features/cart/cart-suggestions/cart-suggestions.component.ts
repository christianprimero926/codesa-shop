import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, switchMap } from 'rxjs';

import { AddToCartButtonComponent } from '../../../cart/components/add-to-cart-button/add-to-cart-button.component';
import { CartStore } from '../../../cart/cart.store';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { CopCurrencyPipe } from '../../../shared/pipes/cop-currency.pipe';

const SUGGESTION_COUNT = 3;
const FETCH_SIZE = 8;

/** "Complementa tu compra": productos de la categoría que más pesa en el carrito, con el mismo endpoint del catálogo. */
@Component({
  selector: 'app-cart-suggestions',
  imports: [RouterLink, AddToCartButtonComponent, CopCurrencyPipe],
  templateUrl: './cart-suggestions.component.html',
  styleUrl: './cart-suggestions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSuggestionsComponent {
  private readonly cart = inject(CartStore);
  private readonly products = inject(ProductService);

  private readonly mainCategory = computed(() => {
    const units = new Map<string, number>();
    for (const line of this.cart.lines()) {
      units.set(line.category, (units.get(line.category) ?? 0) + line.quantity);
    }
    return [...units.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] ?? null;
  });

  private readonly candidates = toSignal(
    toObservable(this.mainCategory).pipe(
      distinctUntilChanged(),
      switchMap((category) =>
        category
          ? this.products
              .getProducts({
                q: '',
                category,
                sort: 'rating',
                order: 'desc',
                page: 0,
                size: FETCH_SIZE,
              })
              .pipe(
                map((page) => page.items),
                catchError(() => of<Product[]>([])),
              )
          : of<Product[]>([]),
      ),
    ),
    { initialValue: [] as Product[] },
  );

  protected readonly category = this.mainCategory;

  protected readonly suggestions = computed(() => {
    const inCart = new Set(this.cart.lines().map((line) => line.productId));
    return this.candidates()
      .filter((product) => product.stock > 0 && !inCart.has(product.id))
      .slice(0, SUGGESTION_COUNT);
  });
}
