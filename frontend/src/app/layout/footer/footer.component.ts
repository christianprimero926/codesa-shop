import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { FREE_SHIPPING_THRESHOLD } from '../../cart/cart.rules';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, CopCurrencyPipe],
  template: `
    <footer class="footer">
      <div class="app-container footer__content">
        <div class="footer__brand">
          <a routerLink="/" class="footer__logo">Codesa<strong>Shop</strong></a>
          <p>Tecnología para trabajar, jugar y estar conectado.</p>
        </div>
        <ul class="footer__perks">
          <li>
            <i class="pi pi-truck" aria-hidden="true"></i>
            Envío gratis desde {{ freeShippingFrom | cop }}
          </li>
          <li><i class="pi pi-tag" aria-hidden="true"></i> Precios con IVA incluido</li>
          <li><i class="pi pi-shield" aria-hidden="true"></i> Pago contra entrega o con tarjeta</li>
        </ul>
      </div>
      <div class="app-container footer__legal">
        <small>© {{ year }} Codesa Shop · Proyecto de demostración</small>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
  protected readonly freeShippingFrom = FREE_SHIPPING_THRESHOLD;
}
