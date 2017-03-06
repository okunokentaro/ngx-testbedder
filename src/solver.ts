import * as pathModule from 'path'
import * as ts from 'typescript'

import { ImportDetector } from './import-detector'
import { ConstructorParameterDetector } from './constructor-parameter-detector'
import { InjectableDetector } from './injectable-detector'
import { ComponentDetector } from './component-detector';
import { TextRangeTuple } from './main';
import { EventEmitter } from 'events';
import { DependencyNode } from './tree-builder';

const typeScriptExtension = 'ts'
const extensionSeparator  = '.'

const outputEventName = 'output'

const getFileDir = (pathWithFileName: string) => {
  return pathWithFileName.split(pathModule.basename(pathWithFileName))[0]
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
    private level: number,
    emitter?: EventEmitter,
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
    const detector     = new ImportDetector(thisSource, params)
    const pathAndNames = detector.detect()

    const pathsExcludeNodeModules = Array.from(pathAndNames.keys()).filter(_path => {
      return /^\./.test(_path)
    })

    const dependenciesPathsAndNames = pathsExcludeNodeModules.map(_path => {
      const fileDir = getFileDir(this.filePath)
      const absolutePath = [pathModule.resolve(fileDir, _path), typeScriptExtension]
        .join(extensionSeparator)
      return {
        path: absolutePath,
        name: pathAndNames.get(_path),
      }
    })

    if (0 < dependenciesPathsAndNames.length) {
      this.outputEmitter.emit(outputEventName, {
        dependenciesPathsAndNames,
        path:  this.filePath,
        level: this.level
      } as DependencyNode)
    }
  }

  /**
   * @returns disposeFunction
   */
  addListenerOutput(callback: (v: DependencyNode) => void): () => void {
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
