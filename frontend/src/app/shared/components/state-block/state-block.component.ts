import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StateBlockTone = 'neutral' | 'error' | 'success';

/** Bloque para estados vacíos, de error o de éxito: ícono, título, texto y acciones. */
@Component({
  selector: 'app-state-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.role]': "tone() === 'error' ? 'alert' : 'status'",
  },
  template: `
    <span class="state-block__icon" aria-hidden="true"><i [class]="'pi ' + icon()"></i></span>
    <h2 class="state-block__title" [attr.tabindex]="focusTitle() ? -1 : null">{{ title() }}</h2>
    @if (description()) {
      <p class="state-block__description">{{ description() }}</p>
    }
    <div class="state-block__actions">
      <ng-content />
    </div>
  `,
  styleUrl: './state-block.component.scss',
})
export class StateBlockComponent {
  readonly icon = input('pi-inbox');
  readonly title = input.required<string>();
  readonly description = input('');
  readonly tone = input<StateBlockTone>('neutral');
  readonly compact = input(false);
  readonly focusTitle = input(false);

  protected readonly hostClass = computed(
    () => `state-block state-block--${this.tone()}${this.compact() ? ' state-block--compact' : ''}`,
  );
}
