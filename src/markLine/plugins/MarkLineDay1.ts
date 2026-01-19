import type { PreciseDate } from '../../date';
import { MarkLine } from '../MarkLine';

/** 1 day */
export class MarkLineDay1 extends MarkLine {
  readonly unit = 'day';
  readonly increment = 1;

  formatter(date: PreciseDate, level: 'primary' | 'secondary'): string {
    return level === 'primary' ? date.format('YYYY-MM') : date.format('DD');
  }

  draw(x: number, current: PreciseDate): void {
    // day 是从 1 开始
    const day = current.get('date');
    if (day === 1) {
      this.drawMarkLine(x, -4, MarkLine.LARGE);
    } else if (day % 5 === 1) {
      this.drawMarkLine(x, 0, MarkLine.MIDDLE);
    } else {
      this.drawMarkLine(x, 0, MarkLine.SMALL);
    }

    if (day === 1) {
      if (this.spacing > 6 || current.get('month') % 3 === 0) {
        this.fillText(current, x, 'primary');
      }
    } else if (this.spacing > 16 && (day === 11 || day === 21)) {
      this.fillText(current, x, 'primary');
    }
    const spacing = this.spacing;

    if (
      (spacing > 24 && (day === 1 || day % 5 === 1)) ||
      (spacing > 6 ? day === 1 || day === 11 || day === 21 : day === 1)
    ) {
      this.fillText(current, x, 'secondary');
    }
  }
}
