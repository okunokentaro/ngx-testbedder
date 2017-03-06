import * as yargs from 'yargs'
import { Facade } from './facade';
import { InquirerRenderer } from './renderers/inquirer-renderer';

const packpath = require('packpath')
const console  = require('better-console')

declare const require: any

const main = (argv: any) => {
  const arg = argv._[0]
  if (!arg) {
    console.error('[ERROR] A file path is required!')
    return
  }
  const tsconfig = require('../../tsconfig.json')
  const renderer = new InquirerRenderer()
  const facade   = new Facade(arg, tsconfig, packpath.self(), renderer)

  facade.run().then(res => {
    console.info(res)
  })
}

main(yargs.argv)
