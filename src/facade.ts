import * as pathModule from 'path'

import { Solver } from './solver';

const findRoot = require('find-root')

const typeScriptExtension = 'ts'
const extensionSeparator = '.'

const getFileDir = (pathWithFileName: string) => {
  return pathWithFileName.split(pathModule.basename(pathWithFileName))[0]
}

export class Facade {

  private solver: Solver
  private solved = [] as string[]

  constructor(
    private filePath: string,
    private tsconfig: any,
    private projectRoot: string,
  ) {
    this.solver = new Solver(filePath, tsconfig, projectRoot)
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
        const rootPath     = findRoot(nextFilePath)

        if (this.solved.includes(nextFilePath)) {
          return
        }

        console.log(nextFilePath);
        const newSolver = new Solver(nextFilePath, this.tsconfig, rootPath, this.solver.outputEmitter)
        newSolver.run()
        this.solved.push(nextFilePath)
      })
    })
    this.solver.run()
    dispose()
  }

}
