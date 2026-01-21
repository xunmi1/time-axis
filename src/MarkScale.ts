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
    const tickHeight = 6;
    const textShape = timeAxis.createShape({
      type: 'text',
      attrs: { start: new Vector2D(0, 0), text: this.displayText },
      style: { align: 'center', font: timeAxis.theme.font },
    });
    const rect = timeAxis.measure(textShape)!;
    const width = Math.max(Math.trunc(rect.width) + 16, 74);
    const start = timeAxis.boundary.subtract(width + this.right, this.bottom + tickHeight);
    textShape.attrs.start = start.add(width / 2, -2);
    this.timeAxis.addShape(textShape);

    this.timeAxis.addShape({
      type: 'polyline',
      attrs: { points: [start, start.add(0, tickHeight), start.add(width, tickHeight), start.add(width, 0)] },
    });
  }
}
