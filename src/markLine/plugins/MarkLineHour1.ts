import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 1 hour */
export class MarkLineHour1 extends MarkLine {
  readonly unit = 'hour';
  readonly increment = 1;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY-MM-DD') : date.format('HH:mm');
  }

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const hour = current.get('hour');

    if (hour === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (hour % 4 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }
    const day = current.get('date');

    if (
      (spacing > 16 && hour % 12 === 0) ||
      (spacing > 8 && hour === 0) ||
      (spacing > 4 ? hour === 0 && day % 2 === 1 && day !== 31 : hour === 0 && day % 4 === 1)
    ) {
      this.fillText(current, x, 'primary');
    }

    if (
      (spacing > 16 && hour % 4 === 0) ||
      (spacing > 8 && hour % 12 === 0) ||
      (spacing > 3 ? hour === 0 : hour === 0 && day % 2 === 1 && day !== 31)
    ) {
      this.fillText(current, x, 'secondary');
    }
  }
}
