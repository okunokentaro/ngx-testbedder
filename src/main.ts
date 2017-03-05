import { Facade } from './facade';

export type TextRangeTuple = [number, number]

declare const require: any

const main = (files: string[]) => {
  const tsconfig = require('../sample/tsconfig.json')
  const facade   = new Facade(files, tsconfig)

  facade.run()
}

main(['sample/sample01.ts', 'sample/sample02.ts'])
