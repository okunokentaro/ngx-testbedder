import * as pathModule from 'path'
import * as ts from 'typescript'

import { ImportDetector } from './import-detector'
import { ConstructorParameterDetector } from './constructor-parameter-detector'
import { InjectableDetector } from './injectable-detector'
import { ComponentDetector } from './component-detector';
import { TextRangeTuple } from './main';

const findRoot = require('find-root')

const isDTs = (fileName: string) => {
  return fileName.substr(-5) === '.d.ts'
}

const getFileDir = (pathWithFileName: string) => {
  return pathWithFileName.split(pathModule.basename(pathWithFileName))[0]
}

export class Facade {

  private sink = {
    injectable: [] as {path: string, ranges: TextRangeTuple[]}[],
    component:  [] as {path: string, ranges: TextRangeTuple[]}[],
  }

  constructor(private filePath: string, private tsconfig: any, private projectRoot: string) {
    console.log('filePath', filePath);
  }

  run() {
    const program = ts.createProgram([this.filePath], this.tsconfig)

    const thisSource = this.filterThisSource(program)
    this.detectInjectableAndComponent(thisSource)

    const path = this.getFullPath(thisSource.fileName)

    const mergedRanges = this.sink.injectable.concat(this.sink.component)
    const targetClassDetectedPositions = mergedRanges
      .filter(item => item.path === path)

    const classPositions = targetClassDetectedPositions.reduce((output, v) => {
      return output.concat(v.ranges)
    }, [] as TextRangeTuple[])

    const constructorParameterDetector = new ConstructorParameterDetector(
      thisSource,
      classPositions,
    )

    const params = constructorParameterDetector.detect()
    const importDetector = new ImportDetector(thisSource, params)
    const pathsOfAllFiles = importDetector.detect()

    if (0 < pathsOfAllFiles.length) {
      pathsOfAllFiles.forEach(_path => {
        if (!/^\./.test(_path)) {
          console.log('module!!', _path);
          return
        }
        const fileDir = getFileDir(this.filePath)
        const nextFilePath = `${pathModule.resolve(fileDir, _path)}.ts`
        const rootPath = findRoot(nextFilePath)
        const newFacade = new Facade(nextFilePath, this.tsconfig, rootPath)
        newFacade.run()
      })
    }
  }

  private filterThisSource(program: ts.Program): ts.SourceFile {
    return program.getSourceFiles()
      .filter(src => !isDTs(src.fileName))
      .filter(src => {
        const argPath    = this.getFullPath(this.filePath)
        const sourcePath = this.getFullPath(src.fileName)
        return sourcePath === argPath
      })[0]
  }

  private detectInjectableAndComponent(src: ts.SourceFile) {
    const injectableDetector = new InjectableDetector(src)
    const injectableRanges = injectableDetector.detect()
    this.sink.injectable.push({
      path: this.getFullPath(src.fileName),
      ranges: injectableRanges,
    })

    const componentDetector = new ComponentDetector(src)
    const componentRanges = componentDetector.detect()
    this.sink.component.push({
      path: this.getFullPath(src.fileName),
      ranges: componentRanges,
    })
  }

  private getFullPath(partialPath: string): string {
    return pathModule.resolve(this.projectRoot, partialPath)
  }

}