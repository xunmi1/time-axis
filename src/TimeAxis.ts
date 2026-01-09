import { EventEmitter, type ListenerMap, type ListenerOptions } from './EventEmitter';
import { AnimationFrame } from './AnimationFrame';
import { MarkLineController } from './markLine';
import { PreciseDate } from './PreciseDate';

import { defaultTheme, type Theme } from './theme';
import { withResolvers } from './utils';

interface Events extends ListenerMap {
  /** 当每帧渲染前 */
  beforeDraw: () => void;
  /** 当每帧渲染完成时 */
  drawn: () => void;
  animationStart: () => void;
  animationEnd: () => void;
  destroyed: () => void;
}

export class TimeAxis {
  context: CanvasRenderingContext2D;

  /** 基线位置 */
  baseline = 28;

  date: PreciseDate;

  theme = defaultTheme;

  #animationFrame = new AnimationFrame();

  #markLineController: MarkLineController;

  #emitter = new EventEmitter<Events>();

  #eventController = new AbortController();

  constructor(canvas: HTMLCanvasElement, options?: { theme?: Theme }) {
    this.context = canvas.getContext('2d')!;
    if (options?.theme) this.theme = options.theme;
    this.#setRect();
    this.onNative('wheel', this.#onWheel, { passive: false });
    this.#markLineController = new MarkLineController(this);
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
    return this.#markLineController.markLine;
  }

  get spacing() {
    return this.#markLineController.spacing;
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
    this.#markLineController.destroy();
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
    // 调整间隔和时间, 实现缩放
    this.date = this.getDateByPos(x - x / ratio);
    this.#markLineController.updateByScale(ratio);
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
    return ((date.valueOf() - this.date.valueOf()) / this.markLine!.base) * this.spacing;
  }

  getDateByPos(x: number) {
    const amount = (x / this.spacing) * this.markLine!.base;
    return new PreciseDate(this.date.valueOf() + amount);
  }

  resize() {
    this.#setRect();
    this.#draw();
  }

  use(...args: Parameters<MarkLineController['use']>) {
    this.#markLineController.use(...args);
  }

  /**
   * 根据时间范围, 自适应时间轴的渲染范围
   * @param start - 起始时间
   * @param end - 结束时间
   * @param ratio - 占比
   */
  adaptiveByDateRange(start: PreciseDate, end: PreciseDate, ratio: number) {
    this.date = start;
    this.#markLineController.adaptiveByDateRange(start, end, ratio);
  }

  canScale(ratio: number) {
    return this.#markLineController.canScale(ratio);
  }

  transformPointInverse(origin: { x?: number; y?: number }) {
    const point = this.context.getTransform().inverse().transformPoint(origin);
    return { x: point.x, y: point.y };
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
    this.#setGlobalStyle();
    this.#emitter.emit('beforeDraw');
    this.#drawAxisLine();
    this.#markLineController.draw();
    this.#emitter.emit('drawn');
  }

  #onWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (event.ctrlKey) this.scaleWithAnimation(event.deltaY < 0 ? 1.25 : 0.8, event.offsetX);
    else this.moveWithAnimation(event.deltaY);
  };

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
    context.fillStyle = this.theme.textColor;
    context.strokeStyle = this.theme.textColor;
  }
}
