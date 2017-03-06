import test from 'ava'
import { Facade } from './facade';
import { TestingRenderer } from './testing-renderer';

const packpath = require('packpath')
const tsconfig = require('../../fixture/tsconfig.json')
const renderer = new TestingRenderer()

test(t => {
  const rootRelativePath = './fixture/using-injectable-and-import/01.ts'
  const facade           = new Facade(rootRelativePath, tsconfig, packpath.self(), renderer)

  const result = facade.run().split('\n').filter(v => !!v)
  const expected = [
    '1 AService',
    '2 BService',
  ]

  t.deepEqual(result, expected)
})

test(t => {
  const rootRelativePath = './fixture/using-injectable-deep-import/01.ts'
  const facade           = new Facade(rootRelativePath, tsconfig, packpath.self(), renderer)

  const result = facade.run().split('\n').filter(v => !!v)
  const expected = [
    '1 AService',
    '2 BService',
    '3 CService',
    '4 DService',
    '5 EService',
    '6 FService',
    '7 GService',
    '8 HService',
    '9 IService',
  ]

  t.deepEqual(result, expected)
})

test(t => {
  const rootRelativePath = './fixture/using-injectable-multi-edges/01.ts'
  const facade           = new Facade(rootRelativePath, tsconfig, packpath.self(), renderer)

  const result = facade.run().split('\n').filter(v => !!v)
  const expected = [
    '1 AService',
    '2 BService',
    '3 EService',
    '3 FService',
    '2 CService',
    '3 GService',
    '3 HService',
    '2 DService',
    '3 IService',
  ]

  t.deepEqual(result, expected)
})

test(t => {
  const rootRelativePath = './fixture/using-injectable-multi-parents/01.ts'
  const facade           = new Facade(rootRelativePath, tsconfig, packpath.self(), renderer)

  const result = facade.run().split('\n').filter(v => !!v)
  const expected = [
    '1 AService',
    '2 BService',
    '3 DService',
    '4 IService',
    '3 EService',
    '3 FService',
    '2 CService',
    '3 GService',
    '3 HService',
  ]

  t.deepEqual(result, expected)
})
