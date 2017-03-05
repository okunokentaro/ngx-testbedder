import * as ts from 'typescript'

import { InjectableDetector } from './injectable-detector';
import { ConstructorParameterDetector } from './constructor-parameter-detector';

export type TextRangeTuple = [number, number]

declare const require: any

const isDTs = (fileName: string) => {
  return fileName.substr(-5) === '.d.ts'
}

class Facade {

  constructor(files: string[], tsconfig: any) {
    const program = ts.createProgram(files, tsconfig)

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

    program.getSourceFiles()
      .forEach(sourceFile => {
        if (isDTs(sourceFile.fileName)) {
          return
        }
        classPositionsOfAllFiles.forEach(classPositions => {
          if (classPositions.fileName !== sourceFile.fileName) {
            return
          }
          const constructorParameterDetector = new ConstructorParameterDetector(
            sourceFile,
            classPositions.detected
          )
          const result = constructorParameterDetector.detect()
          console.log(result);
        })
      })
  }



}

const main = () => {
  const files    = ['sample/sample01.ts', 'sample/sample02.ts']
  const tsconfig = require('../sample/tsconfig.json')
  return new Facade(files, tsconfig)
}

main()
