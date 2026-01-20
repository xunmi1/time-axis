import type { TimeAxis } from './TimeAxis';
import { Indicator } from './Indicator';
import { bound } from './utils';

declare module './theme' {
  export interface Theme {
    pointerIndicator?: Theme['indicator'];
  }
}

/** 指针指示器 */
export class PointerIndicator extends Indicator {
  x: number | undefined;

  constructor(timeAxis: TimeAxis) {
    super(timeAxis);

    timeAxis.onNative('pointermove', this.#onMove, { passive: true });
    timeAxis.onNative('pointerleave', this.#onLeave, { passive: true });
    timeAxis.on('beforeDraw', this.#updateDate);
  }

  override get theme() {
    return this.timeAxis.theme.pointerIndicator ?? super.theme;
  }

  override destroy(): void {
    super.destroy();
    this.x = undefined;
    this.timeAxis.offNative('pointermove', this.#onLeave);
    this.timeAxis.offNative('pointerleave', this.#onLeave);
    this.timeAxis.off('beforeDraw', this.#updateDate);
  }

  @bound
  #updateDate() {
    this.date = this.x == null ? undefined : this.timeAxis.getDateByPos(this.x);
  }

  @bound
  #onMove(event: PointerEvent) {
    this.x = event.offsetX;
    this.render();
  }

  @bound
  #onLeave() {
    this.x = undefined;
    this.render();
  }
}
