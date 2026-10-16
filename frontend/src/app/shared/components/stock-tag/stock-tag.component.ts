import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

const LOW_STOCK = 3;

interface StockLabel {
  text: string;
  icon: string;
  severity: 'success' | 'warn' | 'danger';
}

/** Estado del stock con texto e ícono, nunca solo con color. */
@Component({
  selector: 'app-stock-tag',
  imports: [TagModule],
  template: `<p-tag [value]="label().text" [icon]="label().icon" [severity]="label().severity" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockTagComponent {
  readonly stock = input.required<number>();

  protected readonly label = computed<StockLabel>(() => {
    const stock = this.stock();
    if (stock === 0) {
      return { text: 'Agotado', icon: 'pi pi-times-circle', severity: 'danger' };
    }
    if (stock <= LOW_STOCK) {
      return {
        text: stock === 1 ? 'Última unidad' : `Últimas ${stock} unidades`,
        icon: 'pi pi-exclamation-circle',
        severity: 'warn',
      };
    }
    return { text: 'Disponible', icon: 'pi pi-check-circle', severity: 'success' };
  });
}
