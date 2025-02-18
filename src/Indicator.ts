import type { TimeAxis } from './TimeAxis';
import { MILLISECOND, SECOND } from './utils';

/** 指示器 */
export class Indicator {
  timeAxis: TimeAxis;

  #offsetX = 0;
  #enabled = false;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
    this.timeAxis.addEventListener('mousemove', this.#onMove);
    this.timeAxis.addEventListener('mouseleave', this.#onLeave);
    this.timeAxis.onDrawn(() => this.draw());
  }

  destroy() {
    this.#enabled = false;
  }

  #onMove = (event: MouseEvent) => {
    this.#enabled = true;
    this.#offsetX = event.offsetX;
    // 执行渲染，间接调用 this.draw()
    this.timeAxis.render();
  };

  #onLeave = () => {
    this.#enabled = false;
    this.timeAxis.render();
  };

  draw() {
    if (!this.#enabled) return;
    const context = this.timeAxis.context;

    context.save();
    this.#drawLine();
    context.restore();

    context.save();
    this.#drawTextBox();
    context.restore();
  }

  #drawLine() {
    const context = this.timeAxis.context;
    const offsetX = this.#offsetX;

    const bottom = this.timeAxis.height;
    context.strokeStyle = '#1077f5';
    context.fillStyle = '#1077f5';
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
    const bottom = this.timeAxis.baseline + 48;
    const boundStart = 0;
    const boundEnd = this.timeAxis.width;

    const current = this.timeAxis.getDateByPos(this.#offsetX);
    let text: string;
    if (this.timeAxis.markLine.base > SECOND) {
      text = current.format('YYYY-MM-DD HH:mm:ss');
    } else if (this.timeAxis.markLine.base > MILLISECOND * 10) {
      text = current.format('YYYY-MM-DD HH:mm:ss.SSS');
    } else {
      text = current.format('YYYY-MM-DD HH:mm:ss.SSSSSS');
    }
    // 需先设置字体，才能准确计算出文字尺寸
    context.font = '12px system-ui';
    const textMetrics = context.measureText(text);
    // 四周额外增加 4px 的边距
    const padding = 4;
    const boxWidth = textMetrics.width + padding * 2;
    const boxHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent + padding * 2;
    const boxPosX = Math.min(Math.max(offsetX - boxWidth / 2, boundStart), boundEnd - boxWidth);
    context.fillStyle = '#1077f5';
    context.fillRect(boxPosX, bottom - textMetrics.fontBoundingBoxAscent - padding, boxWidth, boxHeight);

    context.fillStyle = '#fff';
    context.textAlign = 'left';
    context.fillText(text, boxPosX + padding, bottom);
  }
}
