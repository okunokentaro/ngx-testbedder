import { Solved } from './solver';

const archy = require('archy')

export interface TreeNode {
  path : string
  label: string
  nodes: TreeNode[]
}

export class TreeBuilder {

  solvedPool = [] as Solved[]
  private alreadyAddedPaths = new Set<string>()

  build(): TreeNode {
    const root = this.solvedPool.find(node => node.level === 1)

    const buildTree = (solved: Solved, level: number): TreeNode[] => {
      const nextLevel = level + 1

      const nexts = this.solvedPool.filter(node => node.level === nextLevel)
      if (nextLevel === 1) {
        const next = nexts[0]
        const path = next.path
        const name = next.name

        const childrenNodes = !!next
          ? buildTree(next, nextLevel)
          : []

        this.alreadyAddedPaths.add(path)

        return [{
          path:  path,
          label: name,
          nodes: childrenNodes,
        }]
      }

      return solved.dependencies.toArray().map(classLocation => {
        const next = nexts.find(v => v.path === classLocation.path)
        const path = classLocation.path
        const name = classLocation.name

        if (this.alreadyAddedPaths.has(path)) {
          return
        }

        const childrenNodes = !!next
          ? buildTree(next, nextLevel)
          : []

        this.alreadyAddedPaths.add(path)

        return {
          path:  path,
          label: name,
          nodes: childrenNodes,
        }
      }).filter(v => !!v)
    }

    return buildTree(root, 0)[0] as TreeNode
  }

}
