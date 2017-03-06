import test from 'ava'
import { Facade } from './facade';

const packpath = require('packpath')
const tsconfig = require('../../fixture/tsconfig.json')

test(t => {
  const rootRelativePath = './fixture/using-injectable-and-import/01.ts'
  const facade           = new Facade(rootRelativePath, tsconfig, packpath.self())

  const result = facade.run().split('\n').filter(v => !!v)
  const expected = [
    'AService',
    '└── BService',
  ]

  t.deepEqual(result, expected)
})

test(t => {
  const rootRelativePath = './fixture/using-injectable-deep-import/01.ts'
  const facade           = new Facade(rootRelativePath, tsconfig, packpath.self())

  const result = facade.run().split('\n').filter(v => !!v)
  const expected = [
    'AService',
    '└─┬ BService',
    '  └─┬ CService',
    '    └─┬ DService',
    '      └─┬ EService',
    '        └─┬ FService',
    '          └─┬ GService',
    '            └─┬ HService',
    '              └── IService',
  ]

  t.deepEqual(result, expected)
})
