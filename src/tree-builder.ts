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
    const buildChildren = (prevLevel: number, solved: Solved): TreeNode[] => {
      if (!solved) {
        return []
      }

      const currentLevel = prevLevel + 1
      const currentLevelDependencies = this.solvedPool
        .filter(solved => solved.level === currentLevel)

      return solved.dependencies.toArray().map(loc => {
        if (this.alreadyAddedPaths.has(loc.path)) {
          return
        }
        this.alreadyAddedPaths.add(loc.path)

        const nodes = buildChildren(
          currentLevel,
          currentLevelDependencies.find(solved => solved.path === loc.path),
        )

        return {
          path:  loc.path,
          label: loc.name,
          nodes,
        }
      }).filter(v => !!v)
    }

    const root = this.solvedPool.find(node => node.level === 1)
    return {
      path:  root.path,
      label: root.name,
      nodes: buildChildren(1, root),
    }
  }

}
