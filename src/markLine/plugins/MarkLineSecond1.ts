import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 1 second */
export class MarkLineSecond1 extends MarkLine {
  readonly unit = 'second';
  readonly increment = 1;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY-MM-DD HH:mm') : date.format('ss');
  }

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const second = current.get('second');
    const minute = current.get('minute');
    if (second === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (second % 10 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (
      (spacing > 16 && second % 10 === 0) ||
      (spacing > 8 && second % 30 === 0) ||
      (spacing > 4 ? second === 0 : second === 0 && minute % 2 === 0)
    ) {
      this.fillText(current, x, 'primary');
    }

    if (spacing > 6 ? second % 10 === 0 : second % 30 === 0) {
      this.fillText(current, x, 'secondary');
    }
  }
}
