import * as yargs from 'yargs'
import { Facade } from './facade';

export type TextRangeTuple = [number, number]

declare const require: any

const main = (argv: any) => {
  const arg = argv._[0]
  if (!arg) {
    console.error('[ERROR] A file path is required!')
    return
  }
  const tsconfig = require('../sample/tsconfig.json')
  const facade   = new Facade([arg], tsconfig)

  facade.run()
}

main(yargs.argv)
