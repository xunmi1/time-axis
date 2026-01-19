import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 10 seconds */
export class MarkLineSeconds10 extends MarkLine {
  readonly unit = 'second';
  readonly increment = 10;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY-MM-DD HH:mm') : date.format('HH:mm');
  }

  draw(x: number, current: PreciseDate): void {
    const spacing = this.spacing;
    const minute = current.get('minute');
    const second = current.get('second');
    if (second === 0 && minute % 5 === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (second === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (second === 0) {
      if ((spacing > 8 && minute % 5 === 0) || (spacing > 4 ? minute % 10 === 0 : minute % 20 === 0)) {
        this.fillText(current, x, 'primary');
      }
    }

    if (second === 0) {
      if (spacing > 8 || minute % 5 === 0) {
        this.fillText(current, x, 'secondary');
      }
    }
  }
}
