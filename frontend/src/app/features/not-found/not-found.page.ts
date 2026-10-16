import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

import { StateBlockComponent } from '../../shared/components/state-block/state-block.component';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, ButtonModule, StateBlockComponent],
  template: `
    <div class="app-container app-page">
      <app-state-block
        icon="pi-map"
        title="Esta página no existe"
        description="Puede que el enlace esté mal escrito o que la página se haya movido."
        [focusTitle]="true"
      >
        <a pButton routerLink="/"
          ><i class="pi pi-arrow-left" pButtonIcon aria-hidden="true"></i
          ><span pButtonLabel>Volver al catálogo</span></a
        >
        <a pButton routerLink="/carrito" [outlined]="true" severity="secondary"
          ><span pButtonLabel>Ver mi carrito</span></a
        >
      </app-state-block>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {}
