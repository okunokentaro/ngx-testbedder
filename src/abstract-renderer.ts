import { TreeNode } from './tree-builder';

export abstract class AbstractRenderer {

  abstract render(tree: TreeNode): string

}