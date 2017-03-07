import * as yargs from 'yargs'

import { Facade } from './facade';
import { setVerboseLevel } from './logger';

const console  = require('better-console')
const packpath = require('packpath')

const main = async (argv: any) => {
  const arg = argv._[0]
  if (!arg) {
    console.error('[ERROR] A file path is required!')
    return
  }
  const tsconfig = require('../../tsconfig.json')
  const facade = new Facade(arg, tsconfig, packpath.self(), {
    mockPathPattern:     argv.pattern,
    mockPathReplacement: argv.replacement,
  })

  const result = await facade.run()
  console.info(result)
}

const argv = yargs
  .option('pattern', {
    alias: 'pt',
    describe: '(Optional) mockPathPattern'
  })
  .option('replacement', {
    alias: 'rp',
    describe: '(Optional) mockPathReplacement'
  })
  .option('verbose', {
    alias: 'v',
    boolean: true,
    describe: 'Output verbose'
  })
  .help()
  .argv

setVerboseLevel(argv)
main(argv)
