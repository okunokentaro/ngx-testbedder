import * as pathModule from 'path'
import * as ts from 'typescript'

import { ImportDetector } from './detectors/import-detector'
import { ConstructorParameterDetector } from './detectors/constructor-parameter-detector'
import { InjectableDetector } from './detectors/injectable-detector'
import { ComponentDetector } from './detectors/component-detector';
import { TextRangeTuple } from './detectors/abstract-detector';
import { EventEmitter } from 'events';
import { ClassLocation } from './class-location';

export interface Solved {
  path:  string,
  name:  string,
  level: number,
  dependencies: ClassLocation[],
}

const console = require('better-console')

const outputEventName = 'output'

export class Solver {

  outputEmitter = new EventEmitter()

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
    this.outputEmitter = !!emitter ? emitter : new EventEmitter()
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

    const params       = new ConstructorParameterDetector(thisSource, classPositions).detect()
    const classLocations = new ImportDetector(thisSource, params.injectNames).detect()

    const dependencies = classLocations.hoge(this.filePath)

    if (0 < dependencies.length) {
      this.outputEmitter.emit(outputEventName, {
        dependencies,
        path:  this.filePath,
        name:  params.includingClassName,
        level: this.level
      } as Solved)
    }
  }

  /**
   * @returns disposeFunction
   */
  addListenerOutput(callback: (v: Solved) => void): () => void {
    const disposer = this.outputEmitter.on(outputEventName, callback)
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
