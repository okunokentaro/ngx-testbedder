import * as pathModule from 'path'
import * as ts from 'typescript'

import { ImportDetector } from './detectors/import-detector'
import { ConstructorParameterDetector } from './detectors/constructor-parameter-detector'
import { InjectableDetector } from './detectors/injectable-detector'
import { ComponentDetector } from './detectors/component-detector';
import { TextRangeTuple } from './detectors/abstract-detector';
import { EventEmitter } from 'events';
import { ClassLocations } from './class-locations';

export interface Solved {
  path:  string,
  name:  string,
  level: number,
  dependencies: ClassLocations,
}

const console = require('better-console')

const outputEventName = 'output'

const getFileDir = (pathWithFileName: string): string => {
  return pathWithFileName.split(pathModule.basename(pathWithFileName))[0]
}

export class Solver {

  emitter = new EventEmitter()

  private sink = {
    injectable: [] as Array<{path: string, ranges: TextRangeTuple[]}>,
    component:  [] as Array<{path: string, ranges: TextRangeTuple[]}>,
  }

  constructor(
    private filePath:    string,
    private program:     ts.Program,
    private projectRoot: string,
    private level:       number,
    emitter?:            EventEmitter,
  ) {
    this.emitter = !!emitter ? emitter : new EventEmitter()
  }

  run() {
    const thisSource = this.program.getSourceFile(this.filePath)
    this.detectInjectableAndComponent(thisSource)

    const mergedRanges = this.sink.injectable.concat(this.sink.component)
    const path         = this.getFullPath(thisSource.fileName)

    const targetClassDetectedPositions = mergedRanges
      .filter(item => item.path === path)

    const classPositions = targetClassDetectedPositions.reduce((output, v) => {
      return output.concat(v.ranges)
    }, [] as TextRangeTuple[])

    const classInfo      = new ConstructorParameterDetector(thisSource, classPositions).detect()
    const fileDir = getFileDir(this.filePath)
    const classLocations = new ImportDetector(thisSource, classInfo.injectNames, fileDir).detect()

    if (classLocations.exists()) {
      this.emitter.emit(outputEventName, {
        dependencies: classLocations,
        path:         this.filePath,
        name:         classInfo.includingClassName,
        level:        this.level
      } as Solved)
    }
  }

  /**
   * @returns disposeFunction
   */
  addListenerOutput(callback: (v: Solved) => void): () => void {
    const disposer = this.emitter.on(outputEventName, callback)
    return () => disposer.removeListener(outputEventName, callback)
  }

  private detectInjectableAndComponent(src: ts.SourceFile) {
    {
      const detector = new InjectableDetector(src)
      const path     = this.getFullPath(src.fileName)
      const ranges   = detector.detect()
      this.sink.injectable.push({path, ranges})
    }

    {
      const detector = new ComponentDetector(src)
      const path     = this.getFullPath(src.fileName)
      const ranges   = detector.detect()
      this.sink.component.push({path, ranges})
    }
  }

  private getFullPath(partialPath: string): string {
    return pathModule.resolve(this.projectRoot, partialPath)
  }

}
