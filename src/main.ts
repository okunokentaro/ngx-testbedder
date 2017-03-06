import * as yargs from 'yargs'

import { Facade } from './facade';

const console  = require('better-console')
const packpath = require('packpath')

const main = async (argv: any) => {
  const arg = argv._[0]
  if (!arg) {
    console.error('[ERROR] A file path is required!')
    return
  }
  const tsconfig = require('../../tsconfig.json')
  const facade   = new Facade(arg, tsconfig, packpath.self())

  const result = await facade.run()
  console.info(result)
}

main(yargs.argv)
