import { Pipe, PipeTransform } from '@angular/core';

const COP_FORMAT = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCop(value: number): string {
  return COP_FORMAT.format(value);
}

/** Pesos colombianos sin decimales: $ 1.299.000 */
@Pipe({ name: 'cop' })
export class CopCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value === null || value === undefined ? '' : formatCop(value);
  }
}
