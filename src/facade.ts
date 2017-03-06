import * as ts from 'typescript'

import { Solver } from './solver';
import { TreeBuilder } from './tree-builder';

const findRoot = require('find-root')
const console = require('better-console')

export class Facade {

  private program: ts.Program;

  private solver: Solver
  private solved    = new Set<string>()
  private rootPaths = new Set<string>()

  constructor(
    private filePath: string,
    private tsconfig: any,
    private projectRoot: string,
  ) {
    this.program = ts.createProgram([this.filePath], this.tsconfig)
    this.solver = new Solver(filePath, this.program, projectRoot, 1)
  }

  run() {
    const builder = new TreeBuilder()

    const dispose = this.solver.addListenerOutput(obj => {
      builder.rawNodes.push({
        path:                      obj.filePath,
        level:                     obj.currentLevel,
        dependenciesPathsAndNames: obj.absoluteFilePathsAndNames,
      })

      obj.absoluteFilePathsAndNames
        .map(filePathAndName => {
          const nextFilePath = filePathAndName.path
          const rootPath     = this.getRootPath(nextFilePath)
          this.rootPaths.add(rootPath)

          const nextLevel = obj.currentLevel + 1

          return {
            nextFilePath,
            rootPath,
            nextLevel
          }
        })
        .filter((v) => !Array.from(this.solved).includes(v.nextFilePath))
        .forEach(solverParams => {
          const newSolver = new Solver(
            solverParams.nextFilePath,
            this.program,
            solverParams.rootPath,
            solverParams.nextLevel,
            this.solver.outputEmitter
          )
          newSolver.run()

          this.solved.add(solverParams.nextFilePath)
        })
    })
    this.solver.run()
    dispose()

    builder.build()
  }

  private getRootPath(filePath: string) {
    const rootPathIsChecked = Array.from(this.rootPaths)
      .some(_rootPath => filePath.includes(_rootPath))
    if (!rootPathIsChecked) {
      return findRoot(filePath)
    }

    return Array.from(this.rootPaths)
      .map(v => filePath.match(v))
      .filter(v => !!v)[0][0]
  }

}
