import * as yargs from 'yargs'
import { Facade } from './facade';

const packpath = require('packpath')

export type TextRangeTuple = [number, number]

declare const require: any

const main = (argv: any) => {
  const arg = argv._[0]
  if (!arg) {
    console.error('[ERROR] A file path is required!')
    return
  }
  const tsconfig = require('../sample/tsconfig.json')
  const facade   = new Facade(arg, tsconfig, packpath.self())

  const result = facade.run()
  console.log(result)
}

main(yargs.argv)
