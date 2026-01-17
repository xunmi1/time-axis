import type { PreciseDate } from './date';
import type { TimeAxis } from './TimeAxis';
import { bound, clamp, measureText } from './utils';

declare module './theme' {
  export interface Theme {
    indicator: {
      font?: string;
      backgroundColor: string;
      lineColor: string;
      labelColor: string;
    };
  }
}

/** 指示器 */
export class Indicator {
  timeAxis: TimeAxis;

  date: PreciseDate | undefined;

  #offsetX = 0;

  textBoxTop = 48;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
    this.timeAxis.on('drawn', this.draw);
    this.timeAxis.on('destroyed', this.destroy);
  }

  get theme() {
    return this.timeAxis.theme.indicator;
  }

  @bound
  draw() {
    if (this.date == null) return;
    this.#offsetX = this.timeAxis.getPosByDate(this.date);
    const context = this.timeAxis.context;
    context.save();
    this.#drawLine();
    context.restore();

    context.save();
    this.#drawTextBox();
    context.restore();
  }

  @bound
  destroy() {
    this.date = undefined;
    this.timeAxis.off('drawn', this.draw);
  }

  render() {
    // 执行渲染，间接调用 this.draw()
    this.timeAxis.render();
  }

  #drawLine() {
    const context = this.timeAxis.context;
    const offsetX = this.#offsetX;

    const bottom = this.timeAxis.height;
    const lineColor = this.theme.lineColor;
    context.strokeStyle = lineColor;
    context.fillStyle = lineColor;
    context.lineWidth = 1;

    context.beginPath();
    context.moveTo(offsetX - 4, 0);
    context.lineTo(offsetX + 4, 0);
    context.lineTo(offsetX, 4);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(offsetX - 4, bottom);
    context.lineTo(offsetX + 4, bottom);
    context.lineTo(offsetX, bottom - 4);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(offsetX, 0);
    context.lineTo(offsetX, bottom);
    context.stroke();
  }

  get displayText() {
    const current = this.timeAxis.getDateByPos(this.#offsetX);
    const unit = this.timeAxis.markLine!.unit;
    switch (unit) {
      case 'year':
      case 'month':
        return current.format('YYYY-MM-DD');
      case 'day':
        return current.format('YYYY-MM-DD HH:mm');
      case 'hour':
      case 'minute':
        return current.format('YYYY-MM-DD HH:mm:ss');
      case 'second':
        return current.format('YYYY-MM-DD HH:mm:ss:SSS');
      default:
        return current.format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    }
  }

  #drawTextBox() {
    const context = this.timeAxis.context;
    const offsetX = this.#offsetX;
    const bottom = this.timeAxis.baseline + this.textBoxTop;
    const text = this.displayText;
    // 需先设置字体，才能准确计算出文字尺寸
    context.font = this.theme.font ?? this.timeAxis.theme.font;
    const textMetrics = measureText(context, text);
    // 四周额外增加 8px 的边距
    const padding = 8;
    const boxWidth = textMetrics.width + padding * 2;
    const boxHeight = textMetrics.height + padding * 2;
    const boundStart = 0;
    const boundEnd = this.timeAxis.width - boxWidth;
    const boxPosX = clamp(offsetX - boxWidth / 2, boundStart, boundEnd);
    context.fillStyle = this.theme.backgroundColor;
    context.fillRect(boxPosX, bottom - textMetrics.ascent - padding, boxWidth, boxHeight);

    context.fillStyle = this.theme.labelColor;
    context.textAlign = 'left';
    context.fillText(text, boxPosX + padding, bottom);
  }
}
