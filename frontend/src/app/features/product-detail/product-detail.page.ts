import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { SkeletonModule } from 'primeng/skeleton';
import { combineLatest, of, startWith, Subject, switchMap } from 'rxjs';

import { AddToCartButtonComponent } from '../../cart/components/add-to-cart-button/add-to-cart-button.component';
import { maxQuantityFor } from '../../cart/cart.rules';
import { CartStore } from '../../cart/cart.store';
import { Product } from '../../core/models/product.model';
import { pageTitle } from '../../core/routing/page-title.strategy';
import { ProductService } from '../../core/services/product.service';
import { StateBlockComponent } from '../../shared/components/state-block/state-block.component';
import { StockTagComponent } from '../../shared/components/stock-tag/stock-tag.component';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { RatingTextPipe } from '../../shared/pipes/rating-text.pipe';
import { LoadState, LOADING, toLoadState } from '../../shared/utils/load-state';

@Component({
  selector: 'app-product-detail-page',
  imports: [
    NgOptimizedImage,
    FormsModule,
    RouterLink,
    BreadcrumbModule,
    ButtonModule,
    InputNumberModule,
    RatingModule,
    SkeletonModule,
    AddToCartButtonComponent,
    StateBlockComponent,
    StockTagComponent,
    CopCurrencyPipe,
    RatingTextPipe,
  ],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage {
  /** Viene del parámetro :id de la ruta. */
  readonly id = input.required<string>();

  private readonly products = inject(ProductService);
  private readonly cart = inject(CartStore);
  private readonly title = inject(Title);
  private readonly retry$ = new Subject<void>();

  protected readonly quantity = signal(1);

  protected readonly state = toSignal(
    combineLatest([toObservable(this.id), this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([id]) => {
        const productId = Number(id);
        if (!Number.isInteger(productId) || productId <= 0) {
          return of<LoadState<Product>>({
            status: 'error',
            error: { code: 'RECURSO_NO_ENCONTRADO', status: 404, message: '' },
          });
        }
        return this.products.getProduct(productId).pipe(toLoadState());
      }),
    ),
    { initialValue: LOADING as LoadState<Product> },
  );

  protected readonly product = computed(() => {
    const state = this.state();
    return state.status === 'success' ? state.data : null;
  });

  protected readonly inCart = computed(() => {
    const product = this.product();
    return product ? this.cart.quantityOf(product.id) : 0;
  });

  /** Cuántas unidades más se pueden agregar sin pasar el límite por línea ni el stock. */
  protected readonly addable = computed(() => {
    const product = this.product();
    return product ? Math.max(0, maxQuantityFor(product.stock) - this.inCart()) : 0;
  });

  protected readonly breadcrumb = computed<MenuItem[]>(() => {
    const product = this.product();
    if (!product) {
      return [];
    }
    return [
      { label: product.category, routerLink: '/', queryParams: { categoria: product.category } },
      { label: product.name },
    ];
  });

  protected readonly home: MenuItem = { label: 'Catálogo', routerLink: '/' };

  constructor() {
    effect(() => {
      const product = this.product();
      if (product) {
        this.title.setTitle(pageTitle(product.name));
      }
    });

    // Otro producto empieza en 1; si cambia lo que hay en el carrito, la cantidad se mantiene válida.
    effect(() => {
      this.id();
      this.quantity.set(1);
    });
    effect(() => {
      const addable = this.addable();
      this.quantity.update((current) => Math.min(Math.max(current, 1), Math.max(addable, 1)));
    });
  }

  protected changeQuantity(value: number | null): void {
    if (value !== null) {
      this.quantity.set(value);
    }
  }

  protected retry(): void {
    this.retry$.next();
  }
}
