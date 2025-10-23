export interface TechNode {
  name: string;
  value?: number;
  children?: TechNode[];
}

export const isLeafNode = (node: TechNode): node is Required<TechNode> & { children: undefined } =>
  typeof node.value === 'number' && !node.children;

export const isCategoryNode = (node: TechNode): node is Required<TechNode> & { children: TechNode[] } =>
  Array.isArray(node.children);

export type TechColorKey = 'light' | 'medium' | 'dark-border';

export type TechColorPalette = Record<TechColorKey, string>;
