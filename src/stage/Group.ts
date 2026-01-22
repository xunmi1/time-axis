import { Node, type NodeOptions } from './Node';
import type { NodeState } from './NodeState';
import type { Context } from './utils';

interface GroupOptions extends NodeOptions {}

export class Group extends Node {
  constructor(options: GroupOptions) {
    super(options);
  }

  render(ctx: Context, state: NodeState) {
    this.children?.forEach(child => {
      child.render(ctx, state);
    });
  }
}
