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

      return solved.dependencies.toArray().map(classLocation => {
        const nexts = this.solvedPool.filter(node => node.level === nextLevel)

        const next  = nextLevel === 1
          ? nexts[0]
          : nexts.find(v => v.path === classLocation.path)

        const path = nextLevel === 1
          ? next.path
          : classLocation.path

        if (this.alreadyAddedPaths.has(path)) {
          return
        }

        const name = nextLevel === 1
          ? next.name
          : classLocation.name

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
