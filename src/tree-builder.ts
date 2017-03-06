const archy = require('archy')

export interface DependencyNode {
  path:  string,
  level: number,
  dependenciesPathsAndNames: Array<{path: string, name: string}>,
}

export class TreeBuilder {

  rawNodes = [] as Array<DependencyNode>

  build(): string {
    const rootNode = this.rawNodes.find(node => node.level === 1)

    const buildTree = (node: DependencyNode, currentLevel: number): any[] => {
      const nextLevel = currentLevel + 1

      return node.dependenciesPathsAndNames.map(pathAndName => {
        const nexts = this.rawNodes.filter(node => node.level === nextLevel)
        const next  = nexts.find(v => v.path === pathAndName.path)

        const childrenNodes = !!next
          ? buildTree(next, nextLevel)
          : []

        return {
          // path: pathAndName.path,
          label: pathAndName.name,
          nodes: childrenNodes,
        }
      })
    }

    const built      = buildTree(rootNode, 1)[0]
    return archy(built)
  }

}
