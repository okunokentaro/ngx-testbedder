const archy = require('archy')

export interface DependencyNode {
  path:  string,
  name:  string,
  level: number,
  dependenciesPathsAndNames: Array<{path: string, name: string}>,
}

export interface TreeNode {
  path : string
  label: string
  nodes: TreeNode[]
}

export class TreeBuilder {

  rawNodes = [] as Array<DependencyNode>
  private alreadyAddedPaths = new Set<string>()

  build(): TreeNode {
    const rootNode = this.rawNodes.find(node => node.level === 1)

    const buildTree = (node: DependencyNode, currentLevel: number): TreeNode[] => {
      const nextLevel = currentLevel + 1

      return node.dependenciesPathsAndNames.map(pathAndName => {
        const nexts = this.rawNodes.filter(node => node.level === nextLevel)

        const next  = nextLevel === 1
          ? nexts[0]
          : nexts.find(v => v.path === pathAndName.path)

        return this.createTreeNode(next, pathAndName, nextLevel, buildTree)
      })
    }

    return buildTree(rootNode, 0)[0] as TreeNode
  }

  private createTreeNode(
    next:        DependencyNode,
    pathAndName: {path: string, name: string},
    level:       number,
    circleFunction: (node: DependencyNode, currentLevel: number) => TreeNode[]
  ): TreeNode {
    const path = level === 1
      ? next.path
      : pathAndName.path

    if (this.alreadyAddedPaths.has(path)) {
      return
    }

    const name = level === 1
      ? next.name
      : pathAndName.name

    const childrenNodes = !!next
      ? circleFunction(next, level)
      : []

    this.alreadyAddedPaths.add(path)

    return {
      path:  path,
      label: name,
      nodes: childrenNodes,
    }
  }

}
