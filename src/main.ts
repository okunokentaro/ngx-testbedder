import * as yargs from 'yargs'
import { Facade } from './facade';
import { ArchyRenderer } from './archy-renderer';

const packpath = require('packpath')

export type TextRangeTuple = [number, number]

declare const require: any

const main = (argv: any) => {
  const arg = argv._[0]
  if (!arg) {
    console.error('[ERROR] A file path is required!')
    return
  }
  const tsconfig = require('../../tsconfig.json')
  const renderer = new ArchyRenderer()
  const facade   = new Facade(arg, tsconfig, packpath.self(), renderer)

  const result = facade.run()
  console.log(result)
}

main(yargs.argv)
