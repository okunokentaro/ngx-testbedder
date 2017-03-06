import { Output } from './facade'
const archy = require('archy')

export class TreeBuilder {

  outputs = [] as Array<Output>

  build() {
    const outputs = this.outputs

    const first = outputs.find(output => output.level === 1)

    const fn = (output: Output, currentLevel: number): any[] => {
      const nextLevel = currentLevel + 1
      return output.dependenciesPathsAndNames.map(pathAndName => {
        const nexts = outputs.filter(output => output.level === nextLevel)
        const next  = nexts.find(v => v.path === pathAndName.path)

        const nodes = !!next ? fn(next, nextLevel) : []

        return {
          // path: pathAndName.path,
          label: pathAndName.name,
          nodes,
        }
      })
    }

    const a = fn(first, 1)

    const tree = archy(a[0])
    console.log(tree);
  }

}