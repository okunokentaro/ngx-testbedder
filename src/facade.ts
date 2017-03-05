import * as pathModule from 'path'
import * as ts from 'typescript'

import { Solver } from './solver';

const findRoot = require('find-root')

const typeScriptExtension = 'ts'
const extensionSeparator = '.'

const getFileDir = (pathWithFileName: string) => {
  return pathWithFileName.split(pathModule.basename(pathWithFileName))[0]
}

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
    this.solver = new Solver(filePath, this.program, projectRoot)
  }

  run() {
    const dispose = this.solver.addListenerOutput(obj => {
      obj.pathsOfAllFiles.forEach(_path => {
        if (!/^\./.test(_path)) {
          return
        }

        const fileDir      = getFileDir(obj.filePath)
        const nextFilePath = [
          pathModule.resolve(fileDir, _path),
          typeScriptExtension
        ].join(extensionSeparator)
        const rootPath = (() => {
          if (!Array.from(this.rootPaths).some(_rootPath => nextFilePath.includes(_rootPath))) {
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

        console.log(nextFilePath);
        const newSolver = new Solver(
          nextFilePath,
          this.program,
          rootPath,
          this.solver.outputEmitter
        )
        newSolver.run()

        this.solved.add(nextFilePath)
      })
    })
    this.solver.run()
    dispose()
  }

}
