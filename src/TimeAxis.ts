import { EventEmitter, type ListenerMap, type ListenerOptions } from './EventEmitter';
import { AnimationFrame } from './AnimationFrame';
import { MarkLine } from './MarkLine';
import { PreciseDate } from './PreciseDate';

import { defaultTheme, type Theme } from './theme';
import { withResolvers } from './utils';

const SPACING_MIN = 2;
const SPACING_MAX = 500;

interface Events extends ListenerMap {
  /** 当每帧渲染完成时 */
  drawn: () => void;
  animationStart: () => void;
  animationEnd: () => void;
  destroyed: () => void;
}

export class TimeAxis {
  context: CanvasRenderingContext2D;

  /** 刻度线间距 */
  spacing = 8;

  /** 基线位置 */
  baseline = 28;

  date: PreciseDate;

  markLineIndex = 0;

  theme = defaultTheme;

  #animationFrame = new AnimationFrame();

  #markLines: MarkLine[] = [];

  #emitter = new EventEmitter<Events>();

  #eventController = new AbortController();

  constructor(canvas: HTMLCanvasElement, options?: { theme?: Theme }) {
    this.context = canvas.getContext('2d')!;
    if (options?.theme) this.theme = options.theme;
    this.#setRect();
    this.onNative('wheel', this.#onWheel);
  }

  get playing() {
    return this.#animationFrame.isActive;
  }

  get height() {
    return this.transformPointInverse({ y: this.context.canvas.height }).y;
  }

  get width() {
    return this.transformPointInverse({ x: this.context.canvas.width }).x;
  }

  get markLine() {
    return this.#markLines[this.markLineIndex];
  }

  on<K extends keyof Events>(type: K, listener: Events[K], options?: ListenerOptions) {
    this.#emitter.on(type, listener, options);
  }

  off<K extends keyof Events>(type: K, listener: Events[K]) {
    this.#emitter.off(type, listener);
  }

  /** 绑定原生事件，销毁时会自动移除 */
  onNative<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (ev: HTMLElementEventMap[K]) => void,
    options?: { once?: boolean; passive?: boolean }
  ) {
    const signal = this.#eventController.signal;
    this.context.canvas.addEventListener(type, listener, { signal, ...options });
  }

  destroy() {
    this.clear();
    this.#animationFrame.pause();
    this.#markLines = [];
    this.#emitter.emit('destroyed');
    this.#emitter.clear();
    this.#eventController.abort();
  }

  clear() {
    const canvas = this.context.canvas;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.context.fillStyle = this.theme.backgroundColor;
    this.context.fillRect(0, 0, canvas.width, canvas.height);
  }

  use(Line: new (arg: this) => MarkLine) {
    this.#markLines.push(new Line(this));
    return this;
  }

  render() {
    if (!this.playing) this.#draw();
  }

  /** 位移 */
  move(delta: number) {
    this.date = this.getDateByPos(delta);
    this.#draw();
  }

  moveWithAnimation(delta: number, duration = 200) {
    if (!this.playing) this.#emitter.emit('animationStart');
    const { promise, resolve } = withResolvers<void>();
    const date = this.getDateByPos(delta);
    this.#animationFrame.resume((pause, gap) => {
      const step = Math.ceil(delta / (duration / Math.max(gap, 1)));
      this.move(step);
      if (delta > 0 ? this.date >= date : this.date <= date) {
        pause();
        resolve();
      }
    });

    return promise.finally(() => {
      if (!this.playing) this.#emitter.emit('animationEnd');
    });
  }

  /** 缩放 */
  scale(ratio: number, x: number) {
    if (!this.canScale(ratio)) return;
    const { spacing, index } = this.#calcScale(ratio);
    // 调整间隔和时间, 实现缩放
    this.date = this.getDateByPos(x - x / ratio);
    this.spacing = spacing;
    this.markLineIndex = index;
    this.#draw();
  }

  scaleWithAnimation(ratio: number, x: number, duration = 200) {
    const { promise, resolve } = withResolvers<void>();
    if (this.canScale(ratio)) {
      let total = 1;
      if (!this.playing) this.#emitter.emit('animationStart');
      this.#animationFrame.resume((pause, gap) => {
        const step = ratio ** (1 / (duration / Math.max(gap, 1)));
        this.scale(step, x);
        total *= step;
        if (!this.canScale(ratio) || (ratio > 1 ? total >= ratio : total <= ratio)) {
          pause();
          resolve();
        }
      });
    }

    return promise.finally(() => {
      if (!this.playing) this.#emitter.emit('animationEnd');
    });
  }

  getPosByDate(date: PreciseDate) {
    return ((date.valueOf() - this.date.valueOf()) / this.markLine.base) * this.spacing;
  }

  getDateByPos(x: number) {
    const amount = (x / this.spacing) * this.markLine.base;
    return new PreciseDate(this.date.valueOf() + amount);
  }

  resize() {
    this.#setRect();
    this.#draw();
  }

  /**
   * 根据时间范围, 自适应时间轴的渲染范围
   * @param start - 起始时间
   * @param end - 结束时间
   * @param ratio - 占比
   */
  adaptiveByDateRange(start: PreciseDate, end: PreciseDate, ratio = 1) {
    const difference = end.valueOf() - start.valueOf();
    if (difference <= 0) {
      this.spacing = 8;
      this.markLineIndex = 0;
      return;
    }

    const width = this.width;
    // 预设的间距
    const spacing = 8 / ratio;
    const index = this.#markLines.findLastIndex(markLine => {
      const duration = (width / spacing) * markLine.base;
      return difference <= duration;
    });
    this.markLineIndex = index < 0 ? 0 : index;
    this.spacing = Math.max(Math.floor(width * ratio) / (difference / this.markLine.base), SPACING_MIN);
  }

  transformPointInverse(origin: { x?: number; y?: number }) {
    const point = this.context.getTransform().inverse().transformPoint(origin);
    return { x: point.x, y: point.y };
  }

  canScale(ratio: number) {
    return (ratio < 1 && this.spacing >= SPACING_MIN) || (ratio > 1 && this.spacing <= SPACING_MAX);
  }

  #setRect() {
    const ratio = window.devicePixelRatio;
    const canvas = this.context.canvas;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    // 缩放转换后，外部坐标和内部坐标相同，仅尺寸不同
    this.context.scale(ratio, ratio);
  }

  #draw() {
    this.clear();
    if (this.date == null) return;
    const spacing = this.spacing;
    const context = this.context;
    const startDate = this.#getStartDate();
    const offset = this.getPosByDate(startDate);
    this.#setGlobalStyle();
    this.#drawAxisLine();

    context.save();
    const total = Math.ceil(this.width / spacing);
    for (let index = 0; index < total; index += 1) {
      const x = offset + index * spacing;
      const current = new PreciseDate(startDate.valueOf() + this.markLine.base * index);
      this.markLine.draw(x, current);
    }

    context.restore();
    this.#emitter.emit('drawn');
  }

  #onWheel = (event: WheelEvent) => {
    event.preventDefault();

    if (event.ctrlKey) this.scaleWithAnimation(event.deltaY > 0 ? 1.25 : 0.8, event.offsetX);
    else this.moveWithAnimation(event.deltaY);
  };

  #calcScale(ratio: number) {
    const spacing = this.spacing * ratio;
    const current = this.markLine;
    // 时间轴切换的基础阈值
    const threshold = 4;
    // 放大, 使用精度更高的时间轴
    if (ratio > 1) {
      const next = this.#markLines[this.markLineIndex + 1];
      const markLineRatio = next ? current.base / next.base : undefined;
      if (markLineRatio != null && spacing >= markLineRatio * threshold) {
        return {
          spacing: spacing / markLineRatio,
          index: this.markLineIndex + 1,
        };
      }
      return { spacing, index: this.markLineIndex };
    }
    // 缩小, 使用精度更低的时间轴
    const prev = this.#markLines[this.markLineIndex - 1];
    const markLineRatio = prev ? current.base / prev.base : undefined;
    if (markLineRatio != null && spacing < threshold) {
      return {
        spacing: spacing / markLineRatio,
        index: this.markLineIndex - 1,
      };
    }
    return { spacing, index: this.markLineIndex };
  }

  #getStartDate() {
    const base = this.markLine.base;
    // 需要规避时区的影响
    const offset = this.date.utcOffset();
    return new PreciseDate(Math.ceil((this.date.valueOf() + offset) / base) * base - offset);
  }

  #drawAxisLine() {
    const context = this.context;
    context.save();
    context.strokeStyle = this.theme.axis.lineColor;
    context.lineWidth = 1;
    context.beginPath();
    // 1px 线段会在路径两边各延伸 0.5px, 再非高分辨率屏下，其边缘不在像素边界位置，出现模糊
    context.moveTo(0, this.baseline + 0.5);
    context.lineTo(this.width, this.baseline + 0.5);
    context.stroke();
    context.restore();
  }

  #setGlobalStyle() {
    const context = this.context;
    context.textAlign = 'center';
    context.lineWidth = 1;
    context.font = this.theme.font;
  }
}
