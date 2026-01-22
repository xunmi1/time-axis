import type { NodeState } from './NodeState';
import { SortedArray } from './SortedArray';
import type { Child } from './Stage';
import type { Context } from './utils';

function compareByZIndex<T extends { zIndex: number }>(a: T, b: T) {
  return a.zIndex - b.zIndex;
}

export function createChildren<T extends { zIndex: number }>(children?: T[]) {
  return new SortedArray<T>(compareByZIndex, children);
}

export interface NodeOptions {
  children?: Child[];
  zIndex?: number;
}

export abstract class Node {
  #children: SortedArray<Child> | undefined;
  #zIndex: number;
  #parent: Child | undefined;

  constructor(options: NodeOptions) {
    this.#zIndex = options.zIndex ?? 0;
    if (options.children) {
      this.#children = createChildren(options.children);
      this.#children.forEach(child => (child.#parent = this));
    }
  }

  get parent() {
    return this.#parent;
  }

  set parent(parent: Child | undefined) {
    this.parent?.remove(this);
    this.#parent = parent;
  }

  get zIndex() {
    return this.#zIndex;
  }

  set zIndex(zIndex: number) {
    this.#zIndex = zIndex;
    if (!this.parent) return;
    this.parent.#children?.reindex(this);
  }

  get children() {
    return this.#children;
  }

  add<T extends Child>(node: T) {
    node.parent = this;
    this.#children ??= createChildren();
    this.#children.add(node);
    return node;
  }

  remove(node: Child) {
    this.#children?.remove(node);
    node.#parent = undefined;
  }

  abstract render(ctx: Context, state: NodeState): void;
}
