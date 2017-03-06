const archy = require('archy')

export interface DependencyNode {
  path:  string,
  name:  string,
  level: number,
  dependenciesPathsAndNames: Array<{path: string, name: string}>,
}

export interface TreeNode {
  label: string
  nodes: TreeNode[]
}

export class TreeBuilder {

  rawNodes = [] as Array<DependencyNode>

  build(): TreeNode {
    const rootNode = this.rawNodes.find(node => node.level === 1)

    const buildTree = (node: DependencyNode, currentLevel: number): any[] => {
      const nextLevel = currentLevel + 1

      return node.dependenciesPathsAndNames.map(pathAndName => {
        const nexts = this.rawNodes.filter(node => node.level === nextLevel)

        const next  = nextLevel === 1
          ? nexts[0]
          : nexts.find(v => v.path === pathAndName.path)

        const childrenNodes = !!next
          ? buildTree(next, nextLevel)
          : []

        const path = nextLevel === 1
          ? next.path
          : pathAndName.path

        const name = nextLevel === 1
          ? next.name
          : pathAndName.name

        return {
          // path: pathAndName.path,
          label: name,
          nodes: childrenNodes,
        }
      })
    }

    return buildTree(rootNode, 0)[0] as TreeNode
  }

}
