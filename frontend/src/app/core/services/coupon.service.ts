import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from '../http/api-url';
import { Coupon } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_URL)}/coupons`;

  validate(code: string, subtotal: number): Observable<Coupon> {
    const params = new HttpParams().set('subtotal', subtotal);
    return this.http.get<Coupon>(`${this.baseUrl}/${encodeURIComponent(code)}`, { params });
  }
}
