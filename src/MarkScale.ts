import { Vector2D } from './shapes';
import type { TimeAxis } from './TimeAxis';
import { bound } from './utils';

const shortUnitMap = new Map([
  ['millisecond', 'ms'],
  ['second', 's'],
  ['minute', 'min'],
  ['hour', 'hour'],
  ['day', 'day'],
  ['month', 'mo'],
  ['year', 'year'],
] as const);

/** 比例尺 */
export class MarkScale {
  timeAxis: TimeAxis;

  width = 72;
  bottom = 8;
  right = 2;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
    this.timeAxis.on('drawn', this.draw);
  }

  destroy() {
    this.timeAxis.off('drawn', this.draw);
  }

  get displayText() {
    const { unit, increment } = this.timeAxis.markLine!;
    const shortUnit = shortUnitMap.get(unit);
    if (shortUnit) return `${increment} ${shortUnit}`;
    return `${increment} ${unit}`;
  }

  @bound
  draw() {
    const timeAxis = this.timeAxis;
    if (!timeAxis.markLine) return;
    const width = this.width;
    const tickHeight = 6;
    const start = timeAxis.size.subtract(width + this.right, this.bottom + tickHeight);
    this.timeAxis.addShape({
      type: 'polyline',
      attrs: { points: [start, start.add(0, tickHeight), start.add(width, tickHeight), start.add(width, 0)] },
    });
    this.timeAxis.addShape({
      type: 'text',
      attrs: { start: start.add(width / 2, -2), text: this.displayText },
      style: { align: 'center' },
    });
  }
}
