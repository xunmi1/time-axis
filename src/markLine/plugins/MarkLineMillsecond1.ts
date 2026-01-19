import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 1 millisecond */
export class MarkLineMillsecond1 extends MarkLine {
  readonly unit = 'millisecond';
  readonly increment = 1;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY-MM-DD HH:mm:ss') : date.format('SSS');
  }

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const millisecond = current.get('millisecond');

    if (millisecond % 10 === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (millisecond % 5 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if ((spacing > 16 && millisecond % 10 === 0) || (spacing > 4 ? millisecond % 50 === 0 : millisecond % 100 === 0)) {
      this.fillText(current, x, 'primary');
    }

    if (
      spacing > 60 ||
      (spacing > 12 && millisecond % 5 === 0) ||
      (spacing > 6 ? millisecond % 10 === 0 : millisecond % 50 === 0)
    ) {
      this.fillText(current, x, 'secondary');
    }
  }
}
