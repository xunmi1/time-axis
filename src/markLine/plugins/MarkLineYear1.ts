import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 1 year */
export class MarkLineYear1 extends MarkLine {
  readonly unit = 'year';
  readonly increment = 1;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY') : date.format('YY');
  }

  draw(x: number, current: PreciseDate): void {
    const year = current.get('year');
    if (year % 10 === 0) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (year % 5 === 0) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }
    const spacing = this.spacing;
    if ((spacing > 10 && year % 10 === 0) || (spacing > 4 ? year % 50 === 0 : year % 100 === 0)) {
      this.fillText(current, x, 'primary');
    }

    if ((spacing > 12 && year % 5 === 0) || (spacing > 6 ? year % 10 === 0 : year % 20 === 0)) {
      this.fillText(current, x, 'secondary');
    }
  }
}
