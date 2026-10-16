import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { catchError, combineLatest, map, of, startWith, Subject, switchMap } from 'rxjs';

import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { StateBlockComponent } from '../../shared/components/state-block/state-block.component';
import { LoadState, LOADING, toLoadState } from '../../shared/utils/load-state';
import { Page, Product } from '../../core/models/product.model';
import {
  CatalogFilters,
  hasActiveFilters,
  PAGE_SIZE,
  readFilters,
  SORT_OPTIONS,
  SortOption,
  toProductQuery,
  toQueryParams,
} from './catalog-query';
import { ProductCardSkeletonComponent } from './product-card/product-card-skeleton.component';
import { ProductCardComponent } from './product-card/product-card.component';

const ALL_CATEGORIES = '';
const PRIORITY_CARDS = 4;

@Component({
  selector: 'app-catalog-page',
  imports: [
    FormsModule,
    ButtonModule,
    PaginatorModule,
    SelectModule,
    StateBlockComponent,
    ProductCardComponent,
    ProductCardSkeletonComponent,
  ],
  templateUrl: './catalog.page.html',
  styleUrl: './catalog.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly products = inject(ProductService);
  private readonly retry$ = new Subject<void>();

  protected readonly sortOptions = [...SORT_OPTIONS];
  protected readonly pageSize = PAGE_SIZE;
  protected readonly priorityCards = PRIORITY_CARDS;
  protected readonly skeletons = Array.from({ length: PAGE_SIZE }, (_, index) => index);

  private readonly filters$ = this.route.queryParamMap.pipe(map(readFilters));

  protected readonly filters = toSignal(this.filters$, { requireSync: true });

  protected readonly state = toSignal(
    combineLatest([this.filters$, this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([filters]) =>
        this.products.getProducts(toProductQuery(filters)).pipe(toLoadState()),
      ),
    ),
    { initialValue: LOADING as LoadState<Page<Product>> },
  );

  protected readonly categoryOptions = toSignal(
    inject(CategoryService).categories$.pipe(
      map((categories) => [
        { label: 'Todas las categorías', value: ALL_CATEGORIES },
        ...categories.map((category) => ({ label: category, value: category })),
      ]),
      catchError(() => of([{ label: 'Todas las categorías', value: ALL_CATEGORIES }])),
    ),
    { initialValue: [{ label: 'Todas las categorías', value: ALL_CATEGORIES }] },
  );

  protected readonly hasFilters = computed(() => hasActiveFilters(this.filters()));

  protected readonly heading = computed(() => {
    const { q, category } = this.filters();
    if (q) {
      return `Resultados para “${q}”`;
    }
    return category || 'Todo el catálogo';
  });

  protected onCategoryChange(category: string | null): void {
    this.navigate({ category: category ?? ALL_CATEGORIES, page: 1 });
  }

  protected onSortChange(sort: SortOption): void {
    this.navigate({ sort, page: 1 });
  }

  protected onPageChange(event: PaginatorState): void {
    this.navigate({ page: (event.page ?? 0) + 1 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected clearFilters(): void {
    this.navigate({ q: '', category: '', page: 1 });
  }

  protected goToFirstPage(): void {
    this.navigate({ page: 1 });
  }

  protected retry(): void {
    this.retry$.next();
  }

  private navigate(changes: Partial<CatalogFilters>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: toQueryParams(changes),
      queryParamsHandling: 'merge',
    });
  }
}
