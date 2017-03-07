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
    describe: '(Optional) You can specify a file path of tsconfig.json. default \'./tsconfig.json\' or \'./src/tsconfig.json\' if not found'
  })
  .option('verbose', {
    alias: 'v',
    boolean: true,
    describe: 'It prints debug log verbose'
  })
  .option('tree', {
    alias: 't',
    boolean: true,
    describe: 'It displays only a tree. The prompt is not displayed'
  })
  .option('pattern', {
    alias: 'pt',
    describe: '(Optional) You can specify a pattern to name mock file. Default is \'(.*)\.ts\''
  })
  .option('replacement', {
    alias: 'rp',
    describe: '(Optional) You can specify the replacement result for the above `--pattern`. Default is \'$1.mock.ts\''
  })
  .help()
  .version(() => {
    const pkg = require('../../package.json')
    return [pkg.name, pkg.version].join(' ')
  })
  .argv

setVerboseLevel(argv)
main(argv)
