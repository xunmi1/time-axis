import { MarkLine, unitTypes } from './MarkLine';
import type { TimeAxis } from '../TimeAxis';
import { clamp, inRange } from '../utils';

const SPACING_MIN = 2;
const SPACING_MAX = 500;

type MaybeArray<T> = T | T[];

export class MarkLineController {
  timeAxis: TimeAxis;

  /** 刻度线间距 */
  spacing = 8;

  #markLines: MarkLine[] = [];
  markLine: MarkLine | undefined;

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
    this.#markLines = this.#markLines.concat(instances).toSorted((a, b) => {
      if (b.unit === a.unit) return b.increment - a.increment;
      return unitTypes.indexOf(a.unit) - unitTypes.indexOf(b.unit);
    });
    return this;
  }

  get pixelDuration() {
    return this.markLine!.base / this.spacing;
  }

  /**
   * 根据平均每像素代表的时长，自适应渲染
   * @param pixelDuration 平均每像素代表的时长
   */
  fitByPixelDuration(pixelDuration: number) {
    const candidates = this.#markLines.map(v => v.base / pixelDuration);
    const index = candidates.findLastIndex(v => inRange(v, SPACING_MIN, SPACING_MAX));
    if (index < 0) {
      // 找不到合适的时, 寻找最接近 `SPACING_MIN` 和 `SPACING_MAX` 的 `spacing`
      const minIndex = closestIndexToBoundary(candidates, SPACING_MIN, SPACING_MAX);
      this.markLine = this.#markLines.at(minIndex)!;
      this.spacing = clamp(candidates.at(minIndex)!, SPACING_MIN, SPACING_MAX);
      console.warn(`Unable to fit to the appropriate size.`);
    } else {
      this.markLine = this.#markLines.at(index);
      this.spacing = candidates.at(index)!;
    }
  }

  draw() {
    const markLine = this.markLine;
    if (!markLine) return;
    const context = this.timeAxis.context;
    context.save();
    const width = this.timeAxis.width;
    // 起始刻度的时间
    let current = this.timeAxis.date.endOf(markLine.increment, markLine.unit);
    let x = this.timeAxis.getPosByDate(current);
    while (x < width) {
      markLine.draw(x, current);
      current = current.add(markLine.increment, markLine.unit);
      x = this.timeAxis.getPosByDate(current);
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

  canScale(ratio: number) {
    return (ratio < 1 && this.spacing >= SPACING_MIN) || (ratio > 1 && this.spacing <= SPACING_MAX);
  }
}

function closestIndexToBoundary(values: number[], min: number, max: number) {
  const distances = values.map(v => Math.min(Math.abs(v - min), Math.abs(v - max)));
  return distances.indexOf(Math.min(...distances));
}
