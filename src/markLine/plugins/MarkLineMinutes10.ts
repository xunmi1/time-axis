import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 10 minutes */
export class MarkLineMinutes10 extends MarkLine {
  readonly unit = 'minute';
  readonly increment = 10;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY-MM-DD') : date.format('HH:mm');
  }

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const hour = current.get('hour');
    const minute = current.get('minute');
    if (hour % 6 === 0 && minute === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (minute === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (minute === 0) {
      if (
        (spacing > 12 && hour % 3 === 0) ||
        (spacing > 6 && hour % 6 === 0) ||
        (spacing > 4 ? hour % 12 === 0 : hour % 24 === 0)
      ) {
        this.fillText(current, x, 'primary');
      }
    }

    if (minute === 0) {
      if (spacing > 16 || (spacing > 8 && hour % 1 === 0) || (spacing > 4 ? hour % 3 === 0 : hour % 6 === 0)) {
        this.fillText(current, x, 'secondary');
      }
    }
  }
}
