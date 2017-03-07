import * as pathModule from 'path'
import * as yargs from 'yargs'

import { Facade } from './facade';
import { setVerboseLevel } from './logger';
import { ArchyRenderer } from './renderers/archy-renderer';

const console  = require('better-console')
const findRoot = require('find-root')

const tsconfigFileName = 'tsconfig.json'
const angularCliRoot   = 'src'

const main = async (argv: any) => {
  const target = argv._[0]
  if (!target) {
    console.error('[ERROR] A file path is required!')
    return
  }

  const rootRelativePath = pathModule.isAbsolute(target)
    ? findRoot(target)
    : findRoot(argv['$0'])

  const tsconfig = (() => {
    try {
      return require([rootRelativePath, tsconfigFileName].join(pathModule.sep))
    } catch (e) {
      try {
        return require([rootRelativePath, angularCliRoot, tsconfigFileName].join(pathModule.sep))
      } catch (e) {
        return require(argv.tsconfig)
      }
    }
  })()

  const renderer = argv.tree ? new ArchyRenderer() : undefined

  const facade = new Facade(target, tsconfig, rootRelativePath, {
    mockPathPattern:     argv.pattern,
    mockPathReplacement: argv.replacement,
    renderer,
  })

  const result = await facade.run()
  console.info(result)
}

const argv = yargs
  .option('tsconfig', {
    alias: 'c',
    describe: '(Optional) tsconfig.json path, default ./tsconfig.json or ./src/tsconfig.json'
  })
  .option('verbose', {
    alias: 'v',
    boolean: true,
    describe: 'Output verbose'
  })
  .option('tree', {
    alias: 't',
    boolean: true,
    describe: 'Print a tree only'
  })
  .option('pattern', {
    alias: 'pt',
    describe: '(Optional) mockPathPattern'
  })
  .option('replacement', {
    alias: 'rp',
    describe: '(Optional) mockPathReplacement'
  })
  .help()
  .argv

setVerboseLevel(argv)
main(argv)
