import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, retry, throwError, timer } from 'rxjs';

import { toAppError } from './app-error';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 600;
const RETRYABLE_STATUS = new Set([0, 502, 503, 504]);

/**
 * Reintenta las lecturas cuando el backend no responde (espera progresiva)
 * y traduce cualquier falla HTTP a un AppError con mensaje en español.
 */
export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const canRetry = request.method === 'GET';

  return next(request).pipe(
    retry({
      count: canRetry ? MAX_RETRIES : 0,
      delay: (error: unknown, attempt: number) => {
        if (error instanceof HttpErrorResponse && RETRYABLE_STATUS.has(error.status)) {
          return timer(BASE_DELAY_MS * 2 ** (attempt - 1));
        }
        return throwError(() => error);
      },
    }),
    catchError((error: unknown) =>
      throwError(() => (error instanceof HttpErrorResponse ? toAppError(error) : error)),
    ),
  );
};
