import { TreeLevelMap, TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';

export class TestingRenderer extends AbstractRenderer {

  render(treeLevelMap: TreeLevelMap): Promise<string> {
    return Promise.resolve(this.renderImpl(treeLevelMap.treeNode))
  }

  private renderImpl(node: TreeNode): string {
    const result = [] as string[]

    const traverse = (node: TreeNode, level: number) => {
      result.push(this.format(level, node.label))

      const nodes = node.nodes
      if (!nodes) {
        return
      }

      const nextLevel = level + 1
      nodes.forEach(n => traverse(n, nextLevel))
    }

    traverse(node, 1)
    return result.join('\n')
  }

  private format(level: number, label: string) {
    return [level, label].join(' ')
  }

}