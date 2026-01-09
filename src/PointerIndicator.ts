import type { TimeAxis } from './TimeAxis';
import { Indicator } from './Indicator';

declare module './theme' {
  export interface Theme {
    pointerIndicator?: {
      font?: string;
      backgroundColor: string;
      lineColor: string;
      labelColor: string;
    };
  }
}

/** 指针指示器 */
export class PointerIndicator extends Indicator {
  constructor(timeAxis: TimeAxis) {
    super(timeAxis);
    this.timeAxis.onNative('pointermove', this.#onMove, { passive: true });
    this.timeAxis.onNative('pointerleave', this.#onLeave, { passive: true });
  }

  override get theme() {
    return this.timeAxis.theme.pointerIndicator ?? super.theme;
  }

  #onMove = (event: PointerEvent) => {
    this.date = this.timeAxis.getDateByPos(event.offsetX);
    this.render();
  };

  #onLeave = () => {
    this.date = undefined;
    this.render();
  };
}
