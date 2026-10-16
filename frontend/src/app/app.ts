import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { distinctUntilChanged, filter, map, skip } from 'rxjs';

import { CartActionsService } from './cart/cart-actions.service';
import { CartDrawerService } from './cart/cart-drawer.service';
import { CART_TOAST_KEY, CartToastData } from './cart/cart-feedback.service';
import { CartDrawerComponent } from './cart/components/cart-drawer/cart-drawer.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ButtonModule,
    ConfirmDialog,
    ToastModule,
    HeaderComponent,
    FooterComponent,
    CartDrawerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly drawer = inject(CartDrawerService);
  private readonly actions = inject(CartActionsService);
  private readonly messages = inject(MessageService);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected readonly toastKey = CART_TOAST_KEY;

  constructor() {
    // Al cambiar de pantalla el foco pasa al contenido, como en una carga de página.
    // Los cambios de filtros (solo query params) no mueven el foco.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects.split(/[?#]/)[0]),
        distinctUntilChanged(),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.main().nativeElement.focus({ preventScroll: true }));
  }

  protected toastData(data: unknown): CartToastData {
    return (data ?? {}) as CartToastData;
  }

  protected undo(data: CartToastData): void {
    if (data.undo) {
      this.actions.undo(data.undo);
    }
  }

  protected viewCart(): void {
    this.messages.clear(CART_TOAST_KEY);
    this.drawer.open();
  }
}
