import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../http/api-url';
import { Order, OrderRequest } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_URL)}/orders`;

  create(request: OrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request);
  }

  getByNumber(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${encodeURIComponent(orderNumber)}`);
  }
}
