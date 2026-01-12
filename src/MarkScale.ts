import type { TimeAxis } from './TimeAxis';
import { DAY, HOUR, MINUTE, SECOND, bound } from './utils';

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

  get base() {
    return this.timeAxis.markLine!.base;
  }

  get displayText() {
    const unit = this.base;
    if (unit >= DAY) return `${unit / DAY} day`;
    if (unit >= HOUR) return `${unit / HOUR} hour`;
    if (unit >= MINUTE) return `${unit / MINUTE} min`;
    if (unit >= SECOND) return `${unit / SECOND} s`;
    return `${unit} ms`;
  }

  @bound
  draw() {
    const timeAxis = this.timeAxis;
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
