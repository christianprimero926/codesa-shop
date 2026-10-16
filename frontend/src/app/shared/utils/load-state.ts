import { catchError, map, Observable, of, OperatorFunction, startWith } from 'rxjs';

import { asAppError } from '../../core/http/app-error';
import { AppError } from '../../core/models/api-error.model';

export type LoadState<T> =
  { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: AppError };

export const LOADING: LoadState<never> = { status: 'loading' };

/** Convierte una petición en los tres estados que pinta la pantalla. */
export function toLoadState<T>(): OperatorFunction<T, LoadState<T>> {
  return (source: Observable<T>) =>
    source.pipe(
      map((data): LoadState<T> => ({ status: 'success', data })),
      catchError((error: unknown) =>
        of<LoadState<T>>({ status: 'error', error: asAppError(error) }),
      ),
      startWith<LoadState<T>>(LOADING),
    );
}
