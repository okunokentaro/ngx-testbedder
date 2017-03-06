import { Solved } from './solver';
import { OptionsNonNull } from './facade';

const console = require('better-console')

export interface TreeNode {
  label: string
  nodes: TreeNode[]
}

export interface TreeWithMap {
  treeNode: TreeNode
  levelMap: Map<string, number>
  pathMap:  Map<string, string>
}

export class TreeBuilder {

  solvedPool = [] as Solved[]

  private alreadyAddedPaths = new Set<string>()
  private allowDuplicates   = true

  constructor(options: OptionsNonNull) {
    this.allowDuplicates = options.allowDuplicates
  }

  build(): TreeWithMap {
    const buildChildren = (prevLevel: number, solved: Solved): TreeNode[] => {
      if (!solved) {
        return []
      }

      const currentLevel = prevLevel + 1
      const currentLevelDependencies = this.solvedPool
        .filter(solved => solved.level === currentLevel)

      return solved.dependencies.toArray()
        .map(loc => {
          if (!this.allowDuplicates) {
            if (this.alreadyAddedPaths.has(loc.path)) {
              return
            }
            this.alreadyAddedPaths.add(loc.path)
          }

          const nodes = buildChildren(
            currentLevel,
            currentLevelDependencies.find(solved => solved.path === loc.path),
          )

          return {
            label: loc.name,
            nodes,
          }
        })
        .filter(treeNode => !!treeNode)
    }

    if (this.solvedPool.length === 0) {
      throw new Error('There is no dependency on the selected file')
    }

    const root = this.solvedPool.find(node => node.level === 1)

    const levelMap = new Map<string, number>()
    const pathMap  = new Map<string, string>()
    this.solvedPool.forEach(v => {
      levelMap.set(v.name, v.level)
      pathMap.set(v.name, v.path)
    })

    return {
      treeNode: {
        label: root.name,
        nodes: buildChildren(1, root),
      },
      levelMap,
      pathMap
    }
  }

}
