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
    const instances = Plugins.map(Ctor => new Ctor(this.timeAxis));
    this.#markLines = this.#markLines.concat(instances).toSorted((a, b) => b.base - a.base);
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
    this.spacing = Math.floor(width * ratio) / (difference / this.markLine!.base);
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

  scale(ratio: number) {
    const current = this.markLine!;
    const spacing = this.spacing * ratio;
    // 时间轴切换的基础阈值
    const threshold = 2;
    const unit = (current.base * threshold) / spacing;
    const next = this.#markLines.findLast(v => v.base >= unit);
    this.markLine = next ?? current;
    this.spacing = spacing / (current.base / this.markLine.base);
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
