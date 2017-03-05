import * as ts from 'typescript'

import { InjectableDetector } from './injectable-detector';
import { ConstructorParameterDetector } from './constructor-parameter-detector';
import { ImportDetector } from './import-detector';

export type TextRangeTuple = [number, number]

declare const require: any

const isDTs = (fileName: string) => {
  return fileName.substr(-5) === '.d.ts'
}

class Facade {

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
        const detector = new InjectableDetector(sourceFile)
        const result = detector.detect();
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
          classPositions.detected
        )
        const params = constructorParameterDetector.detect()
        const importDetector = new ImportDetector(sourceFile, params)
        return importDetector.detect()
      })
      .filter(item => !!item)
      .filter(item => 0 < item.length)

    console.log(pathsOfAllFiles);
  }

}

const main = (files: string[]) => {
  const tsconfig = require('../sample/tsconfig.json')
  const facade   = new Facade(files, tsconfig)

  facade.run()
}

main(['sample/sample01.ts', 'sample/sample02.ts'])
