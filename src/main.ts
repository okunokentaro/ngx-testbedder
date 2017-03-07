import * as pathModule from 'path'
import * as yargs from 'yargs'

import { Facade } from './facade';
import { setVerboseLevel } from './logger';

const console  = require('better-console')
const findRoot = require('find-root')

const tsconfigFileName = 'tsconfig.json'
const angularCliRoot   = 'src'

const main = async (argv: any) => {
  const arg = argv._[0]
  if (!arg) {
    console.error('[ERROR] A file path is required!')
    return
  }

  const rootRelativepath = (() => {
    if (pathModule.isAbsolute(arg)) {
      return findRoot(arg)
    }
    const absPath = pathModule.resolve(__dirname, arg)
    return findRoot(absPath)
  })()

  const tsconfig = (() => {
    try {
      return require([rootRelativepath, tsconfigFileName].join(pathModule.sep))
    } catch (e) {
      try {
        return require([rootRelativepath, angularCliRoot, tsconfigFileName].join(pathModule.sep))
      } catch (e) {
        return require(argv.tsconfig)
      }
    }
  })()

  const facade = new Facade(arg, tsconfig, rootRelativepath, {
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
  .option('tsconfig', {
    alias: 'c',
    describe: '(Optional) tsconfig.json path, default ./tsconfig.json or ./src/tsconfig.json'
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
