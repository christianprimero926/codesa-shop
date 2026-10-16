import { Injectable, signal } from '@angular/core';

/** Estado del panel lateral, compartido entre la cabecera y el layout. */
@Injectable({ providedIn: 'root' })
export class CartDrawerService {
  private readonly opened = signal(false);
  private returnFocusTo: HTMLElement | null = null;

  readonly visible = this.opened.asReadonly();

  open(): void {
    this.returnFocusTo =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.opened.set(true);
  }

  close(): void {
    this.opened.set(false);
  }

  /** Al cerrar, el foco vuelve a donde estaba el usuario. */
  restoreFocus(): void {
    const target = this.returnFocusTo;
    this.returnFocusTo = null;
    if (target?.isConnected) {
      target.focus();
    }
  }
}
