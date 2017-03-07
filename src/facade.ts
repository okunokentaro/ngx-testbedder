import * as ts from 'typescript'
import * as pathModule from 'path'

import { Solver, Solved } from './solver';
import { TreeBuilder } from './tree-builder';
import { AbstractRenderer } from './renderers/abstract-renderer';
import { InquirerRenderer } from './renderers/inquirer-renderer';

const findRoot = require('find-root')

type Partial<T> = {
  [P in keyof T]?: T[P]
}

export interface OptionsNonNull {
  allowDuplicates:     boolean
  renderer:            AbstractRenderer
  mockPathPattern:     string
  mockPathReplacement: string
}

export interface Options extends Partial<OptionsNonNull> { }


const defaults = {
  allowDuplicates:     true,
  renderer:            new InquirerRenderer(),
  mockPathPattern:     '(.*)\.ts',
  mockPathReplacement: '$1.mock.ts',
} as Options

export class Facade {

  private options:  OptionsNonNull
  private filePath: string
  private program:  ts.Program
  private solver:   Solver
  private builder:  TreeBuilder
  private renderer: AbstractRenderer

  private solved    = new Set<string>()
  private rootPaths = new Set<string>()

  constructor(
    filePath: string,
    private tsconfig: any,
    private projectRoot: string,
    _options?: Options
  ) {
    this.options = this.formatPartialOptions(_options)

    this.filePath = pathModule.resolve(this.projectRoot, filePath)
    this.program  = ts.createProgram([this.filePath], this.tsconfig)
    this.solver   = new Solver(this.filePath, this.program, projectRoot, 1)
    this.renderer = this.options.renderer
    this.builder  = new TreeBuilder(this.options)
  }

  run(): Promise<string> {
    const dispose = this.solver.addListenerOutput(solved => {
      this.dealWithSolved(solved)
    })
    this.solver.run()
    dispose()

    try {
      const built = this.builder.build()
      return this.renderer.render(built, this.options)
    } catch(e) {
      console.info(e.message)
      return Promise.resolve('')
    }
  }

  private formatPartialOptions(options: Options): OptionsNonNull {
    Object.keys(options).forEach(key => {
      if (typeof (options as any)[key] === 'undefined') {
        delete (options as any)[key]
      }
    })
    return Object.assign({}, defaults, options) as OptionsNonNull
  }

  private dealWithSolved(solved: Solved) {
    this.builder.save(solved)

    solved.dependencies.toArray()
      .map(classLocation => {
        const nextFilePath = classLocation.path
        const rootPath     = this.getRootPath(nextFilePath)
        this.rootPaths.add(rootPath)

        const nextLevel = solved.level + 1

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
          this.solver.emitter
        )
        newSolver.run()

        this.solved.add(solverParams.nextFilePath)
      })
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
