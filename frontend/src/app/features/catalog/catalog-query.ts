import { ParamMap, Params } from '@angular/router';

import { ProductQuery, ProductSortField, SortDirection } from '../../core/models/product.model';

export const PAGE_SIZE = 8;

export interface SortOption {
  value: string;
  label: string;
  sort: ProductSortField;
  order: SortDirection;
}

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'nombre', label: 'Nombre: A a Z', sort: 'name', order: 'asc' },
  { value: 'precio-asc', label: 'Precio: menor a mayor', sort: 'price', order: 'asc' },
  { value: 'precio-desc', label: 'Precio: mayor a menor', sort: 'price', order: 'desc' },
  { value: 'valoracion', label: 'Mejor valorados', sort: 'rating', order: 'desc' },
  { value: 'nombre-desc', label: 'Nombre: Z a A', sort: 'name', order: 'desc' },
];

export const DEFAULT_SORT = SORT_OPTIONS[0];

/** Filtros tal como viajan en la URL (en español y con página desde 1). */
export interface CatalogFilters {
  q: string;
  category: string;
  sort: SortOption;
  page: number;
}

export function readFilters(params: ParamMap): CatalogFilters {
  const sort = SORT_OPTIONS.find((option) => option.value === params.get('orden')) ?? DEFAULT_SORT;
  const page = Number.parseInt(params.get('pagina') ?? '1', 10);
  return {
    q: (params.get('q') ?? '').trim(),
    category: (params.get('categoria') ?? '').trim(),
    sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function toProductQuery(filters: CatalogFilters): ProductQuery {
  return {
    q: filters.q,
    category: filters.category,
    sort: filters.sort.sort,
    order: filters.sort.order,
    page: filters.page - 1,
    size: PAGE_SIZE,
  };
}

/** Params para el router: lo que está en su valor por defecto no se escribe en la URL. */
export function toQueryParams(changes: Partial<CatalogFilters>): Params {
  const params: Params = {};
  if ('q' in changes) {
    params['q'] = changes.q || null;
  }
  if ('category' in changes) {
    params['categoria'] = changes.category || null;
  }
  if ('sort' in changes) {
    params['orden'] = changes.sort && changes.sort !== DEFAULT_SORT ? changes.sort.value : null;
  }
  if ('page' in changes) {
    params['pagina'] = changes.page && changes.page > 1 ? changes.page : null;
  }
  return params;
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return filters.q !== '' || filters.category !== '';
}
