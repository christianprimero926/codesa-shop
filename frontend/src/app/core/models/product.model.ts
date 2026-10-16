export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  image: string;
  description: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export type ProductSortField = 'price' | 'name' | 'rating';
export type SortDirection = 'asc' | 'desc';

export interface ProductQuery {
  q: string;
  category: string;
  sort: ProductSortField;
  order: SortDirection;
  page: number;
  size: number;
}
