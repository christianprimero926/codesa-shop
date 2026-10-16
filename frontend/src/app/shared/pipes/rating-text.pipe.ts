import { Pipe, PipeTransform } from '@angular/core';

const RATING_FORMAT = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

@Pipe({ name: 'ratingText' })
export class RatingTextPipe implements PipeTransform {
  transform(value: number): string {
    return RATING_FORMAT.format(value);
  }
}
