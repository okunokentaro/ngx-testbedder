import * as pathModule from 'path'
import * as ts from 'typescript'

import { ImportDetector } from './import-detector'
import { ConstructorParameterDetector } from './constructor-parameter-detector'
import { InjectableDetector } from './injectable-detector'
import { ComponentDetector } from './component-detector';
import { TextRangeTuple } from './main';
import { EventEmitter } from 'events';

const isDTs = (fileName: string) => {
  return fileName.substr(-5) === '.d.ts'
}

export class Solver {

  outputEmitter = new EventEmitter()

  private sink = {
    injectable: [] as Array<{path: string, ranges: TextRangeTuple[]}>,
    component:  [] as Array<{path: string, ranges: TextRangeTuple[]}>,
  }

  constructor(
    private filePath: string,
    private program: ts.Program,
    private projectRoot: string,
    emitter?: EventEmitter,
  ) {
    if (!emitter) {
      this.outputEmitter = new EventEmitter()
    }
    this.outputEmitter = !!emitter ? emitter : new EventEmitter()
  }

  run() {
    const thisSource = this.program.getSourceFile(this.filePath)
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
      this.outputEmitter.emit('output', {
        pathsOfAllFiles,
        filePath: this.filePath
      })
    }
  }

  /**
   * @returns disposeFunction
   */
  addListenerOutput(callback: (v: {pathsOfAllFiles: string[], filePath: string}) => void): () => void {
    const disposer = this.outputEmitter.on('output', callback)
    return () => disposer.removeListener('output', callback)
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
