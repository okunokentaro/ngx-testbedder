import * as ts from 'typescript'

import { ImportDetector } from './import-detector'
import { ConstructorParameterDetector } from './constructor-parameter-detector'
import { InjectableDetector } from './injectable-detector'
import { ComponentDetector } from './component-detector';

const isDTs = (fileName: string) => {
  return fileName.substr(-5) === '.d.ts'
}

export class Facade {

  constructor(private files: string[], private tsconfig: any) {
    //
  }

  run() {
    const program = ts.createProgram(this.files, this.tsconfig)

    const classPositionsOfAllFiles = program.getSourceFiles()
      .map(sourceFile => {
        if (isDTs(sourceFile.fileName)) {
          return
        }
        if (sourceFile.fileName !== this.files[0]) {
          return
        }

        const detector = new InjectableDetector(sourceFile)
        const result = detector.detect()
        return {
          fileName: sourceFile.fileName,
          detected: result,
        }
      })
      .filter(item => !!item)
      .filter(item => Array.isArray(item.detected) && 0 < item.detected.length)

    const componentClassPositionsOfAllFiles = program.getSourceFiles()
      .map(sourceFile => {
        if (isDTs(sourceFile.fileName)) {
          return
        }
        if (sourceFile.fileName !== this.files[0]) {
          return
        }

        const detector = new ComponentDetector(sourceFile)
        const result = detector.detect()
        return {
          fileName: sourceFile.fileName,
          detected: result,
        }
      })
      .filter(item => !!item)
      .filter(item => Array.isArray(item.detected) && 0 < item.detected.length)

    const pathsOfAllFiles = program.getSourceFiles()
      .map(sourceFile => {
        if (isDTs(sourceFile.fileName)) {
          return
        }

        const classPositions = classPositionsOfAllFiles
          .find(_classPositions => _classPositions.fileName === sourceFile.fileName)
        if (!classPositions) {
          return
        }

        if (classPositions.fileName !== sourceFile.fileName) {
          return
        }
        const constructorParameterDetector = new ConstructorParameterDetector(
          sourceFile,
          classPositions.detected,
        )
        const params = constructorParameterDetector.detect()
        const importDetector = new ImportDetector(sourceFile, params)
        return importDetector.detect()
      })
      .filter(item => !!item)
      .filter(item => 0 < item.length)

    const pathsOfAllFiles2 = program.getSourceFiles()
      .map(sourceFile => {
        if (isDTs(sourceFile.fileName)) {
          return
        }

        const classPositions = componentClassPositionsOfAllFiles
          .find(_classPositions => _classPositions.fileName === sourceFile.fileName)
        if (!classPositions) {
          return
        }

        if (classPositions.fileName !== sourceFile.fileName) {
          return
        }
        const constructorParameterDetector = new ConstructorParameterDetector(
          sourceFile,
          classPositions.detected,
        )
        const params = constructorParameterDetector.detect()
        const importDetector = new ImportDetector(sourceFile, params)
        return importDetector.detect()
      })
      .filter(item => !!item)
      .filter(item => 0 < item.length)

    console.info(pathsOfAllFiles)
    console.info(pathsOfAllFiles2)
  }

}