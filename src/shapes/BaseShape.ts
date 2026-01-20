import type { Context } from './utils';

export abstract class BaseShape<Attrs = {}, Style = {}> {
  attrs: Attrs;
  style: Style;
  abstract draw(ctx: Context): void;

  constructor(options: { attrs: Attrs; style?: Style }) {
    this.attrs = options.attrs;
    this.style = options.style ?? ({} as Style);
  }

  measure?(ctx: Context): { width: number; height: number; left: number; right: number; top: number; bottom: number };
}
