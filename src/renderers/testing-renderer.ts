import { TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';
import { Solved } from '../solver';

export class TestingRenderer extends AbstractRenderer {

  render(tree: {treeNode: TreeNode, solveds: Solved[]}): string {
    const ff = (_built: TreeNode) => {
      const result = [] as string[]
      const f = (nodes: any, level: number) => {
        if (!nodes) {
          return
        }
        const nextLevel = level + 1
        nodes.forEach((n: any) => {
          result.push(`${nextLevel} ${n.label}`);
          f(n.nodes, nextLevel)
        })
      }

      result.push(`${1} ${_built.label}`);
      f(_built.nodes, 1)

      return result.join('\n')
    }
    return ff(tree.treeNode)
  }

}