import { TreeNode } from '../tree-builder';
import { Solved } from '../solver';

export abstract class AbstractRenderer {

  abstract render(tree: {treeNode: TreeNode, solveds: Solved[]}): string

}