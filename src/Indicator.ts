import type { PreciseDate } from './date';
import { Vector2D } from './shapes';
import type { TimeAxis } from './TimeAxis';
import { bound } from './utils';

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
    const lineColor = this.theme.lineColor;
    const start = new Vector2D(this.#offsetX, 0);
    const end = new Vector2D(this.#offsetX, this.timeAxis.height);
    this.timeAxis.addShape({
      type: 'line',
      attrs: { start, end },
      style: { color: lineColor, width: 1 },
    });
    const polygonStyle = { fillColor: lineColor };
    this.timeAxis.addShape({
      type: 'polygon',
      attrs: { points: [start.subtract(4, 0), start.add(4, 0), start.add(0, 4)] },
      style: polygonStyle,
    });
    this.timeAxis.addShape({
      type: 'polygon',
      attrs: { points: [end.subtract(4, 0), end.add(4, 0), end.subtract(0, 4)] },
      style: polygonStyle,
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
    const theme = this.theme;

    const textShape = this.timeAxis.createShape({
      type: 'text',
      attrs: { text: this.displayText, start: new Vector2D(0, 0) },
      style: { align: 'start', font: theme.font, color: theme.labelColor },
    });

    // 四周额外增加 8px 的边距
    const padding = 8;
    const boundStart = new Vector2D(0, 0);
    const boundEnd = this.timeAxis.boundary;

    const rect = this.timeAxis.measure(textShape)!;
    const boxWidth = Math.ceil(rect.width) + padding * 2;
    const boxHeight = Math.ceil(rect.height) + padding * 2;
    const boxStart = new Vector2D(offsetX, bottom)
      .subtract(boxWidth / 2, padding + rect.top)
      .clamp(boundStart, boundEnd.subtract(boxWidth, 0));

    textShape.attrs.start = new Vector2D(padding, padding + rect.top);

    this.timeAxis.addShape({
      type: 'rect',
      attrs: { start: boxStart, end: boxStart.add(boxWidth, boxHeight) },
      style: { fillColor: theme.backgroundColor },
      children: [textShape],
    });
  }
}
