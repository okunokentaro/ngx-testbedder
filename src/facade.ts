import * as ts from 'typescript'
import * as pathModule from 'path'

import { Solver } from './solver';
import { TreeBuilder, DependencyNode } from './tree-builder';
import { AbstractRenderer } from './renderers/abstract-renderer';

const findRoot = require('find-root')

export class Facade {

  private filePath: string
  private program:  ts.Program
  private solver:   Solver
  private builder:  TreeBuilder

  private solved    = new Set<string>()
  private rootPaths = new Set<string>()

  constructor(
    filePath: string,
    private tsconfig: any,
    private projectRoot: string,
    private renderer: AbstractRenderer,
  ) {
    this.filePath = pathModule.resolve(this.projectRoot, filePath)
    this.program  = ts.createProgram([this.filePath], this.tsconfig)
    this.solver   = new Solver(this.filePath, this.program, projectRoot, 1)
    this.builder  = new TreeBuilder()
  }

  run(): string {

    const dispose = this.solver.addListenerOutput(obj => {
      this.dealWithSolved(obj)
    })
    this.solver.run()
    dispose()

    const built = this.builder.build()
    return this.renderer.render(built)
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

  private dealWithSolved(obj: DependencyNode) {
    this.builder.rawNodes.push(obj)

    obj.dependenciesPathsAndNames
      .map(pathAndName => {
        const nextFilePath = pathAndName.path
        const rootPath     = this.getRootPath(nextFilePath)
        this.rootPaths.add(rootPath)

        const nextLevel = obj.level + 1

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
  }

}
