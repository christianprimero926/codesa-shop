import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { API_URL } from '../http/api-url';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_URL)}/categories`;

  /** Las categorías no cambian durante la sesión: se piden una vez y se comparten. */
  readonly categories$: Observable<string[]> = this.http
    .get<string[]>(this.url)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));
}
