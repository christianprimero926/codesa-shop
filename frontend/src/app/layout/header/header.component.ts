import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Popover } from 'primeng/popover';
import { filter } from 'rxjs';

import { CartDrawerService } from '../../cart/cart-drawer.service';
import { CartFeedbackService } from '../../cart/cart-feedback.service';
import { CartStore } from '../../cart/cart.store';
import { MiniCartComponent } from '../../cart/components/mini-cart/mini-cart.component';

const MINI_CART_AUTO_CLOSE_MS = 4500;
const BUMP_DURATION_MS = 600;

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    OverlayBadgeModule,
    Popover,
    MiniCartComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  protected readonly cart = inject(CartStore);
  private readonly drawer = inject(CartDrawerService);
  private readonly feedback = inject(CartFeedbackService);
  private readonly router = inject(Router);

  private readonly cartButton = viewChild.required<ElementRef<HTMLElement>>('cartButton');
  // El mini-carrito se carga en diferido, por eso puede no existir todavía.
  private readonly miniCart = viewChild<Popover>('miniCart');

  protected readonly searchTerm = signal('');
  protected readonly bumping = signal(false);

  private autoCloseTimer: ReturnType<typeof setTimeout> | undefined;
  private bumpTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const tree = this.router.parseUrl(this.router.url);
        const isCatalog = tree.root.children['primary'] === undefined;
        this.searchTerm.set(isCatalog ? (tree.queryParamMap.get('q') ?? '') : '');
        this.miniCart()?.hide();
      });

    effect(() => {
      if (this.feedback.lastAdded()) {
        this.celebrateAdd();
      }
    });

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.autoCloseTimer);
      clearTimeout(this.bumpTimer);
    });
  }

  protected search(event?: Event): void {
    event?.preventDefault();
    const term = this.searchTerm().trim();
    void this.router.navigate(['/'], {
      queryParams: { q: term || null, pagina: null },
      queryParamsHandling: 'merge',
    });
  }

  protected clearSearch(): void {
    this.searchTerm.set('');
    this.search();
  }

  protected openCart(): void {
    this.miniCart()?.hide();
    this.drawer.open();
  }

  protected keepMiniCartOpen(): void {
    clearTimeout(this.autoCloseTimer);
  }

  private celebrateAdd(): void {
    this.bumping.set(false);
    clearTimeout(this.bumpTimer);
    requestAnimationFrame(() => this.bumping.set(true));
    this.bumpTimer = setTimeout(() => this.bumping.set(false), BUMP_DURATION_MS);

    // En pantallas pequeñas basta el toast; el mini-carrito taparía el contenido.
    if (this.drawer.visible() || !matchMedia('(min-width: 900px)').matches) {
      return;
    }
    const miniCart = this.miniCart();
    if (!miniCart) {
      return;
    }
    miniCart.show(null, this.cartButton().nativeElement);
    clearTimeout(this.autoCloseTimer);
    this.autoCloseTimer = setTimeout(() => miniCart.hide(), MINI_CART_AUTO_CLOSE_MS);
  }
}
