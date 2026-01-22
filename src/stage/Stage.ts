import type { SortedArray } from './SortedArray';
import { createChildren } from './Node';
import { Group } from './Group';
import { Shape } from './Shape';
import { LineShape } from './LineShape';
import { PolylineShape } from './PolylineShape';
import { RectShape } from './RectShape';
import { PolygonShape } from './PolygonShape';
import { TextShape } from './TextShape';
import { NodeState } from './NodeState';
import type { Context } from './utils';

/** exportable all node type */
export interface RegistryNodeMap {
  line: typeof LineShape;
  polyline: typeof PolylineShape;
  rect: typeof RectShape;
  polygon: typeof PolygonShape;
  text: typeof TextShape;
  group: typeof Group;
}

type BaseNode = Group | Shape;
export type RegistryNodeType = keyof RegistryNodeMap;

type RegistryNode<T = RegistryNodeType> = T extends RegistryNodeType ? InstanceType<RegistryNodeMap[T]> : never;
type DefaultNodeType = RegistryNodeType | BaseNode;
export type Child = RegistryNode | BaseNode;

export type Node<T = DefaultNodeType> = RegistryNode<T> | (T extends BaseNode ? T : never);

type NodeConstructor<T = DefaultNodeType> = {
  new (...arg: any): Node<T>;
};

type RegistryNodeParams<T extends RegistryNodeType> = ConstructorParameters<RegistryNodeMap[T]>[0];

type CreateRegistryNode<T = RegistryNodeType> = T extends RegistryNodeType
  ? Omit<RegistryNodeParams<T>, 'children'> & { type: T; children?: MaybeNode[] }
  : never;

export type MaybeNode<T = DefaultNodeType> = Node<T> | CreateRegistryNode<T>;

const builtInNodes = {
  group: Group,
  line: LineShape,
  polyline: PolylineShape,
  rect: RectShape,
  polygon: PolygonShape,
  text: TextShape,
} as const;

export class Stage {
  #nodeMap: Map<RegistryNodeType, NodeConstructor>;
  #nodes: SortedArray<Node>;
  #context: Context;
  #state: NodeState;

  constructor(context: Context) {
    this.#context = context;
    this.#nodes = createChildren();
    this.#nodeMap = new Map(Object.entries(builtInNodes) as [RegistryNodeType, NodeConstructor][]);
    this.#state = new NodeState(context);
  }

  static isNode(value: unknown): value is BaseNode {
    return value instanceof Group || value instanceof Shape;
  }

  use<T extends RegistryNodeType>(type: T, Ctor: NodeConstructor) {
    this.#nodeMap.set(type, Ctor);
    return this;
  }

  draw() {
    this.#nodes.forEach(node => node.render(this.#context, this.#state));
  }

  create<T>(params: MaybeNode<T>) {
    if (Stage.isNode(params)) return params;
    const { type, ...node } = params;
    const Ctor = this.#nodeMap.get(type) as NodeConstructor<T> | undefined;
    if (!Ctor) throw new Error(`Unsupported node type: ${type}`);
    if (node.children) {
      const children: BaseNode[] = node.children.map(child => this.create<BaseNode>(child));
      return new Ctor({ ...node, children });
    }
    return new Ctor(node);
  }

  add<T>(nodeOrParams: MaybeNode<T>) {
    const node = this.create(nodeOrParams);
    this.#nodes.add(node);
    return node;
  }

  remove(node: Node) {
    this.#nodes.remove(node);
  }

  clear() {
    this.#nodes.clear();
  }

  collectState() {
    this.#state.collect();
  }
}
