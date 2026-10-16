import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

/**
 * Esqueleto con la misma estructura y estilos de la tarjeta real:
 * cuando llegan los productos la cuadrícula no cambia de alto.
 */
@Component({
  selector: 'app-product-card-skeleton',
  imports: [SkeletonModule],
  template: `
    <div class="card card--skeleton" aria-hidden="true">
      <div class="card__media">
        <p-skeleton width="100%" height="100%" borderRadius="0" />
      </div>
      <div class="card__body">
        <div class="card__meta">
          <p-skeleton width="35%" height="0.75rem" />
          <p-skeleton width="5.5rem" height="1.5rem" borderRadius="6px" />
        </div>
        <div class="card__name">
          <p-skeleton width="95%" height="1rem" />
          <p-skeleton width="60%" height="1rem" />
        </div>
        <div class="card__brand"><p-skeleton width="30%" height="0.875rem" /></div>
        <div class="card__rating"><p-skeleton width="45%" height="0.9rem" /></div>
        <div class="card__footer">
          <div class="card__price"><p-skeleton width="5.5rem" height="1.4rem" /></div>
          <span class="card__skeleton-button">
            <p-skeleton width="100%" height="100%" borderRadius="10px" />
          </span>
        </div>
      </div>
    </div>
  `,
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardSkeletonComponent {}
