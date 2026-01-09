import { MarkLine, type MarkLinePlugin } from './MarkLine';
import { PreciseDate } from '../PreciseDate';
import type { TimeAxis } from '../TimeAxis';

const SPACING_MIN = 2;
const SPACING_MAX = 500;

type MaybeArray<T> = T | T[];

export class MarkLineController {
  timeAxis: TimeAxis;

  /** 刻度线间距 */
  spacing = 8;

  #markLines: MarkLinePlugin[] = [];
  markLine: MarkLinePlugin | undefined;

  constructor(timeAxis: TimeAxis) {
    this.timeAxis = timeAxis;
  }

  destroy() {
    this.#markLines = [];
    this.markLine = undefined;
  }

  use(Plugin: MaybeArray<new (arg: TimeAxis) => MarkLine>) {
    const Plugins = Array.isArray(Plugin) ? Plugin : [Plugin];
    this.#markLines.push(...Plugins.map(Ctor => new Ctor(this.timeAxis)));
    return this;
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
      this.markLine = this.#markLines[0];
      return;
    }

    const width = this.timeAxis.width;
    // 预设的间距
    const spacing = 8 / ratio;
    this.markLine = this.#markLines.findLast((markLine, i) => {
      const duration = (width / spacing) * markLine.base;
      return difference <= duration || i === 0;
    });
    this.spacing = Math.max(Math.floor(width * ratio) / (difference / this.markLine!.base), SPACING_MIN);
  }

  canScale(ratio: number) {
    return (ratio < 1 && this.spacing >= SPACING_MIN) || (ratio > 1 && this.spacing <= SPACING_MAX);
  }

  draw() {
    const markLine = this.markLine;
    if (!markLine) return;
    const spacing = this.spacing;
    const context = this.timeAxis.context;
    const startDate = this.#getStartDate();
    const offset = this.timeAxis.getPosByDate(startDate);

    context.save();
    const total = Math.ceil(this.timeAxis.width / spacing);
    for (let index = 0; index < total; index += 1) {
      const x = offset + index * spacing;
      const current = new PreciseDate(startDate.valueOf() + markLine.base * index);
      markLine.draw(x, current);
    }

    context.restore();
  }

  updateByScale(ratio: number) {
    const spacing = this.spacing * ratio;
    const current = this.markLine!;
    const index = this.#markLines.indexOf(current!);
    // 时间轴切换的基础阈值
    const threshold = 4;
    // 放大, 使用精度更高的时间轴
    if (ratio > 1) {
      const next = this.#markLines[index + 1];
      const markLineRatio = next ? current.base / next.base : undefined;
      if (markLineRatio != null && spacing >= markLineRatio * threshold) {
        this.spacing = spacing / markLineRatio;
        this.markLine = next;
      } else {
        this.spacing = spacing;
      }
    } else {
      // 缩小, 使用精度更低的时间轴
      const prev = this.#markLines[index - 1];
      const markLineRatio = prev ? current.base / prev.base : undefined;
      if (markLineRatio != null && spacing < threshold) {
        this.spacing = spacing * markLineRatio;
        this.markLine = prev;
      } else {
        this.spacing = spacing;
      }
    }
  }

  /** 起始刻度的时间 */
  #getStartDate() {
    const date = this.timeAxis.date;
    const base = this.markLine!.base;
    // 需要规避时区的影响
    const offset = date.utcOffset();
    return new PreciseDate(Math.ceil((date.valueOf() + offset) / base) * base - offset);
  }
}
