import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 1 minute */
export class MarkLineMinute1 extends MarkLine {
  readonly unit = 'minute';
  readonly increment = 1;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY-MM-DD HH') : date.format('HH:mm');
  }

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const minute = current.get('minute');
    const hour = current.get('hour');

    if (minute === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (minute % 10 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if ((spacing > 8 && minute % 30 === 0) || (spacing > 4 ? minute === 0 : minute === 0 && hour % 2 === 0)) {
      this.fillText(current, x, 'primary');
    }

    if (spacing > 6 ? minute % 10 === 0 : minute % 30 === 0) {
      this.fillText(current, x, 'secondary');
    }
  }
}
