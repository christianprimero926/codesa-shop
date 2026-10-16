import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../http/api-url';
import { Page, Product, ProductQuery } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_URL)}/products`;

  getProducts(query: ProductQuery): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('sort', query.sort)
      .set('order', query.order)
      .set('page', query.page)
      .set('size', query.size);
    if (query.q) {
      params = params.set('q', query.q);
    }
    if (query.category) {
      params = params.set('category', query.category);
    }
    return this.http.get<Page<Product>>(this.baseUrl, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }
}
