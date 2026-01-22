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
  markWidth = 74;
  markHeight = 6;

  zIndex = 5;

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
    const markWidth = this.markWidth;
    const markHeight = this.markHeight;
    const start = timeAxis.boundary.subtract(markWidth + this.right, markHeight + this.bottom);

    this.timeAxis.addNode({
      type: 'group',
      zIndex: this.zIndex,
      children: [
        {
          type: 'polyline',
          attrs: {
            points: [start, start.add(0, markHeight), start.add(markWidth, markHeight), start.add(markWidth, 0)],
          },
          style: { lineWidth: 1 },
        },
        {
          type: 'text',
          attrs: { start: start.add(markWidth / 2, markHeight - 4), text: this.displayText },
          style: { align: 'center', font: timeAxis.theme.font },
        },
      ],
    });
  }
}
