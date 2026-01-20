import type { PreciseDate } from './date';
import type { Shape } from './Shapes';
import type { TimeAxis } from './TimeAxis';
import { bound, clamp } from './utils';

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
    this.#drawLine();
    this.#drawTextBox();
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
    const offsetX = this.#offsetX;
    const bottom = this.timeAxis.height;
    const lineColor = this.theme.lineColor;
    this.timeAxis.addShape({
      type: 'triangle',
      attrs: { x1: offsetX - 4, y1: 0, x2: offsetX + 4, y2: 0, x3: offsetX, y3: 4 },
      style: { fill: lineColor },
    });
    this.timeAxis.addShape({
      type: 'triangle',
      attrs: { x1: offsetX - 4, y1: bottom, x2: offsetX + 4, y2: bottom, x3: offsetX, y3: bottom - 4 },
      style: { fill: lineColor },
    });
    this.timeAxis.addShape({
      type: 'line',
      attrs: { x1: offsetX, y1: 0, x2: offsetX, y2: bottom },
      style: { stroke: lineColor, lineWidth: 1 },
    });
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
    const offsetX = this.#offsetX;
    const bottom = this.timeAxis.baseline + this.textBoxTop;
    const text = this.displayText;
    const theme = this.theme;
    const shapeText: Shape = {
      type: 'text',
      attrs: { text, x: 0, y: bottom },
      style: { fill: theme.labelColor, align: 'start', font: theme.font },
    };
    const textMetrics = this.timeAxis.measure(shapeText)!;
    // 四周额外增加 8px 的边距
    const padding = 8;
    const boxWidth = textMetrics.width + padding * 2;
    const boxHeight = textMetrics.height + padding * 2;
    const boxPosX = clamp(offsetX - boxWidth / 2, 0, this.timeAxis.width - boxWidth);
    this.timeAxis.addShape({
      type: 'rect',
      attrs: { x: boxPosX, y: bottom - textMetrics.ascent - padding, width: boxWidth, height: boxHeight },
      style: { fill: theme.backgroundColor },
    });
    shapeText.attrs.x = boxPosX + padding;
    this.timeAxis.addShape(shapeText);
  }
}
