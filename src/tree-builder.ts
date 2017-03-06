import { Solved } from './solver';

const archy = require('archy')

export interface TreeNode {
  path : string
  label: string
  nodes: TreeNode[]
}

export class TreeBuilder {

  rawNodes = [] as Solved[]
  private alreadyAddedPaths = new Set<string>()

  build(): TreeNode {
    const rootNode = this.rawNodes.find(node => node.level === 1)

    const buildTree = (solved: Solved, currentLevel: number): TreeNode[] => {
      const nextLevel = currentLevel + 1

      return solved.dependenciesPathsAndNames.map(pathAndName => {
        const nexts = this.rawNodes.filter(node => node.level === nextLevel)

        const next  = nextLevel === 1
          ? nexts[0]
          : nexts.find(v => v.path === pathAndName.path)

        return this.createTreeNode(next, pathAndName, nextLevel, buildTree)
      }).filter(v => !!v)
    }

    return buildTree(rootNode, 0)[0] as TreeNode
  }

  private createTreeNode(
    solved:      Solved,
    pathAndName: {path: string, name: string},
    level:       number,
    circleFunction: (node: Solved, currentLevel: number) => TreeNode[]
  ): TreeNode {
    const path = level === 1
      ? solved.path
      : pathAndName.path

    if (this.alreadyAddedPaths.has(path)) {
      return
    }

    const name = level === 1
      ? solved.name
      : pathAndName.name

    const childrenNodes = !!solved
      ? circleFunction(solved, level)
      : []

    this.alreadyAddedPaths.add(path)

    return {
      path:  path,
      label: name,
      nodes: childrenNodes,
    }
  }

}
