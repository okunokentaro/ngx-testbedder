import * as ts from 'typescript'

import { Solver } from './solver';
import { TreeBuilder } from './tree-builder';

const findRoot = require('find-root')

export interface Output {
  path: string,
  level: number,
  dependenciesPathsAndNames: Array<{path: string, name: string}>,
}

export class Facade {

  private program: ts.Program;

  private solver: Solver
  private solved    = new Set<string>()
  private rootPaths = new Set<string>()
  private outputs = [] as Array<Output>

  constructor(
    private filePath: string,
    private tsconfig: any,
    private projectRoot: string,
  ) {
    this.program = ts.createProgram([this.filePath], this.tsconfig)
    this.solver = new Solver(filePath, this.program, projectRoot, 1)
  }

  run() {
    const dispose = this.solver.addListenerOutput(obj => {
      this.outputs.push({
        path:         obj.filePath,
        level:        obj.currentLevel,
        dependenciesPathsAndNames: obj.absoluteFilePathsAndNames,
      })

      obj.absoluteFilePathsAndNames.forEach(filePathAndName => {
        const nextFilePath = filePathAndName.path
        const rootPath = (() => {
          const rootPathIsChecked = Array.from(this.rootPaths)
            .some(_rootPath => nextFilePath.includes(_rootPath))
          if (!rootPathIsChecked) {
            return findRoot(nextFilePath)
          }

          return Array.from(this.rootPaths)
            .map(v => nextFilePath.match(v))
            .filter(v => !!v)[0][0]
        })()

        this.rootPaths.add(rootPath)

        if (Array.from(this.solved).includes(nextFilePath)) {
          return
        }

        const nextLevel = obj.currentLevel + 1
        const newSolver = new Solver(
          nextFilePath,
          this.program,
          rootPath,
          nextLevel,
          this.solver.outputEmitter
        )
        newSolver.run()

        this.solved.add(nextFilePath)
      })
    })
    this.solver.run()
    dispose()

    const builder = new TreeBuilder()
    builder.build(this.outputs)
  }

}
