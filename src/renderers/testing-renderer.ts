import { TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';

export class TestingRenderer extends AbstractRenderer {

  render(tree: TreeNode): string {
    const ff = (_built: any) => {
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
    return ff(tree)
  }

}