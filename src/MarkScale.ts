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
]);

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
    const context = this.timeAxis.context;
    const width = this.width;
    const right = this.right;
    const bottom = this.bottom;
    context.save();
    context.beginPath();
    const tickHeight = 6;
    const startX = timeAxis.width - width - right;
    const endX = timeAxis.width - right;
    const startY = timeAxis.height - bottom - tickHeight;
    const endY = timeAxis.height - bottom;
    context.moveTo(startX, startY);
    context.lineTo(startX, endY);
    context.lineTo(endX, endY);
    context.lineTo(endX, startY);
    context.stroke();
    context.textAlign = 'center';
    context.font = this.timeAxis.theme.font;
    context.fillText(this.displayText, startX + width / 2, startY);
    context.restore();
  }
}
