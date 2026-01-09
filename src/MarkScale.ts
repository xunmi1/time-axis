import type { TimeAxis } from './TimeAxis';
import { DAY, HOUR, MINUTE, SECOND } from './utils';

/** 比例尺 */
export class MarkScale {
  timeAxis: TimeAxis;

  width = 80;
  bottom = 8;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
    this.draw = this.draw.bind(this);
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

  draw() {
    const timeAxis = this.timeAxis;
    const context = this.timeAxis.context;
    const width = this.width;
    const bottom = this.bottom;
    context.save();
    context.beginPath();
    const tickHeight = 6;
    context.moveTo(timeAxis.width - width, timeAxis.height - bottom - tickHeight);
    context.lineTo(timeAxis.width - width, timeAxis.height - bottom);
    context.lineTo(timeAxis.width, timeAxis.height - bottom);
    context.lineTo(timeAxis.width, timeAxis.height - bottom - tickHeight);
    context.stroke();
    context.textAlign = 'center';
    context.font = this.timeAxis.theme.font;
    context.fillText(this.displayText, timeAxis.width - width / 2, timeAxis.height - bottom - tickHeight);
    context.restore();
  }
}
