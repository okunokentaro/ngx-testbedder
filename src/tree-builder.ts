import { Output } from './facade'
const archy = require('archy')

export class TreeBuilder {

  build(outputs: Output[]) {
    const maxLevel = outputs.reduce((level, output) => {
      return level < output.level ? output.level : level
    }, 0)


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