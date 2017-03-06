const archy = require('archy')

export interface DependencyNode {
  path:  string,
  name:  string,
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

    const built = buildTree(rootNode, 0)[0] as any

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

    console.log(ff(built));

    return archy(built)
  }

}
