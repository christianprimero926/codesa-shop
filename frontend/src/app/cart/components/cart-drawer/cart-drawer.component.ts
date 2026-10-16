import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

import { CartActionsService } from '../../cart-actions.service';
import { CartDrawerService } from '../../cart-drawer.service';
import { CartStore } from '../../cart.store';
import { CartEmptyComponent } from '../cart-empty/cart-empty.component';
import { CartLineComponent } from '../cart-line/cart-line.component';
import { CartSummaryComponent } from '../cart-summary/cart-summary.component';
import { CouponFormComponent } from '../coupon-form/coupon-form.component';
import { FreeShippingProgressComponent } from '../free-shipping-progress/free-shipping-progress.component';

@Component({
  selector: 'app-cart-drawer',
  imports: [
    RouterLink,
    ButtonModule,
    DrawerModule,
    CartEmptyComponent,
    CartLineComponent,
    CartSummaryComponent,
    CouponFormComponent,
    FreeShippingProgressComponent,
  ],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawerComponent {
  protected readonly cart = inject(CartStore);
  protected readonly drawer = inject(CartDrawerService);
  protected readonly actions = inject(CartActionsService);

  protected onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.drawer.close();
    }
  }
}
