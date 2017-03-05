import * as ts from 'typescript'

import { InjectableDetector } from './injectable-detector';

declare const require: any

class Facade {

  constructor(files: string[], tsconfig: any) {
    const program        = ts.createProgram(files, tsconfig)
    const classPositions = program.getSourceFiles().map(sourceFile => {
      if (sourceFile.fileName.substr(-5) === '.d.ts') {
        return
      }
      const detector = new InjectableDetector(sourceFile)
      return detector.detect()
    }).filter(i => !!i)

    console.log('constructor', JSON.stringify(classPositions))
  }

}

const main = () => {
  const files    = ['sample/sample01.ts', 'sample/sample02.ts']
  const tsconfig = require('../sample/tsconfig.json')
  return new Facade(files, tsconfig)
}

main()
