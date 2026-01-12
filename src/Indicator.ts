import type { PreciseDate } from './PreciseDate';
import type { TimeAxis } from './TimeAxis';
import { bound, MILLISECOND, SECOND } from './utils';

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

  #drawTextBox() {
    const context = this.timeAxis.context;
    const offsetX = this.#offsetX;
    const bottom = this.timeAxis.baseline + this.textBoxTop;
    const boundStart = 0;
    const boundEnd = this.timeAxis.width;

    const current = this.timeAxis.getDateByPos(this.#offsetX);
    let text: string;
    if (this.timeAxis.markLine!.base > SECOND) {
      text = current.format('YYYY-MM-DD HH:mm:ss');
    } else if (this.timeAxis.markLine!.base > MILLISECOND * 10) {
      text = current.format('YYYY-MM-DD HH:mm:ss.SSS');
    } else {
      text = current.format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    }
    // 需先设置字体，才能准确计算出文字尺寸
    context.font = this.theme.font ?? this.timeAxis.theme.font;
    const textMetrics = context.measureText(text);
    // 四周额外增加 4px 的边距
    const padding = 4;
    const theme = this.theme;
    const boxWidth = textMetrics.width + padding * 2;
    const boxHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent + padding * 2;
    const boxPosX = Math.min(Math.max(offsetX - boxWidth / 2, boundStart), boundEnd - boxWidth);
    context.fillStyle = theme.backgroundColor;
    context.fillRect(boxPosX, bottom - textMetrics.fontBoundingBoxAscent - padding, boxWidth, boxHeight);

    context.fillStyle = theme.labelColor;
    context.textAlign = 'left';
    context.fillText(text, boxPosX + padding, bottom);
  }
}
