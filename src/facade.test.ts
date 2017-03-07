import * as pathModule from 'path'
import * as sinon from 'sinon'
import test from 'ava'

import { Facade } from './facade';
import { TestingRenderer } from './renderers/testing-renderer';
import { InquirerRenderer } from './renderers/inquirer-renderer';

const tsconfig        = require('../../fixture/tsconfig.json')
const findRoot        = require('find-root')
const testingRenderer = new TestingRenderer()

const makeRootRelativepath = (path: string): string => {
  if (pathModule.isAbsolute(path)) {
    return findRoot(path)
  }
  const absPath = pathModule.resolve(__dirname, path)
  return findRoot(absPath)
}

const makeInquirerStub = (renderer: InquirerRenderer, answersFixture: string[]) => {
  const inquirerStub = sinon.stub(renderer, 'getInquirer')
  answersFixture.forEach((fixture, idx) => {
    inquirerStub.onCall(idx).returns({
      prompt: () => Promise.resolve({
        tree: fixture.split(',')
      })
    })
  })
}

test(async t => {
  const path   = './fixture/using-injectable-and-import/01.ts'
  const facade = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      allowDuplicates: true,
      renderer:        testingRenderer,
    }
  )

  const result   = (await facade.run()).split('\n').filter(v => !!v)
  const expected = [
    '1 AService',
    '2 BService',
  ]

  t.deepEqual(result, expected)
})

test(async t => {
  const path   = './fixture/using-injectable-deep-import/01.ts'
  const facade = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      allowDuplicates: true,
      renderer:        testingRenderer,
    }
  )

  const result   = (await facade.run()).split('\n').filter(v => !!v)
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

test(async t => {
  const path   = './fixture/using-injectable-multi-edges/01.ts'
  const facade = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      allowDuplicates: true,
      renderer:        testingRenderer,
    }
  )

  const result   = (await facade.run()).split('\n').filter(v => !!v)
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

test(async t => {
  const path   = './fixture/using-injectable-multi-parents/01.ts'
  const facade = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      allowDuplicates: true,
      renderer:        testingRenderer,
    }
  )

  const result   = (await facade.run()).split('\n').filter(v => !!v)
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
    '2 DService',
    '3 IService',
  ]

  t.deepEqual(result, expected)
})

test(async t => {
  const path   = './fixture/using-injectable-multi-parents/01.ts'
  const facade = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      allowDuplicates: false,
      renderer:        testingRenderer,
    }
  )

  const result   = (await facade.run()).split('\n').filter(v => !!v)
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

test(async t => {
  const path     = './fixture/using-injectable-multi-parents/01.ts'
  const renderer = new InquirerRenderer()
  const facade   = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      renderer,
    }
  )

  makeInquirerStub(renderer, [
    'Done, AService',
  ])

  const result   = (await facade.run()).split('\n').filter(v => !!v)
  const expected = [
    'import { AService } from \'./01.ts\';',
    'import { BServiceMock } from \'./02.mock.ts\';',
    'import { CServiceMock } from \'./03.mock.ts\';',
    'import { DServiceMock } from \'./04.mock.ts\';',
    'AService,',
    '{provide: BService, useClass: BServiceMock},',
    '{provide: CService, useClass: CServiceMock},',
    '{provide: DService, useClass: DServiceMock},',
  ]

  t.deepEqual(result, expected)
})

test(async t => {
  const path     = './fixture/using-injectable-multi-parents/01.ts'
  const renderer = new InquirerRenderer()
  const facade   = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      renderer,
    }
  )

  makeInquirerStub(renderer, [
    'AService, └── DService',
    'AService, ├── BService, └─┬ DService',
    'AService, ├─┬ BService, │ ├─┬ DService, └─┬ DService,   └── IService',
    'Done, AService, ├─┬ BService, │ ├─┬ DService, │ │ └── IService, └─┬ DService,   └── IService',
  ])

  const result   = (await facade.run()).split('\n').filter(v => !!v)
  const expected = [
    'import { AService } from \'./01.ts\';',
    'import { BService } from \'./02.ts\';',
    'import { DService } from \'./04.ts\';',
    'import { IService } from \'./09.ts\';',
    'import { EServiceMock } from \'./05.mock.ts\';',
    'import { FServiceMock } from \'./06.mock.ts\';',
    'import { CServiceMock } from \'./03.mock.ts\';',
    'AService,',
    'BService,',
    'DService,',
    'IService,',
    '{provide: EService, useClass: EServiceMock},',
    '{provide: FService, useClass: FServiceMock},',
    '{provide: CService, useClass: CServiceMock},',
  ]

  t.deepEqual(result, expected)
})

test(async t => {
  const path     = './fixture/using-injectable-multi-parents/01.ts'
  const renderer = new InquirerRenderer()
  const facade   = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      renderer,
    }
  )

  makeInquirerStub(renderer, [
    'Done, AService, ├── BService',
  ])

  const result   = (await facade.run()).split('\n').filter(v => !!v)
  const expected = [
    'import { AService } from \'./01.ts\';',
    'import { BService } from \'./02.ts\';',
    'import { DServiceMock } from \'./04.mock.ts\';',
    'import { EServiceMock } from \'./05.mock.ts\';',
    'import { FServiceMock } from \'./06.mock.ts\';',
    'import { CServiceMock } from \'./03.mock.ts\';',
    'AService,',
    'BService,',
    '{provide: DService, useClass: DServiceMock},',
    '{provide: EService, useClass: EServiceMock},',
    '{provide: FService, useClass: FServiceMock},',
    '{provide: CService, useClass: CServiceMock},',
  ]

  t.deepEqual(result, expected)
})

test(async t => {
  const path     = './fixture/using-injectable-multi-parents/01.ts'
  const renderer = new InquirerRenderer()
  const facade   = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      renderer,
      mockPathPattern:     '(.*)\.ts',
      mockPathReplacement: '$1.mock.ts',
    }
  )

  makeInquirerStub(renderer, [
    'Done, AService',
  ])

  const result   = (await facade.run()).split('\n').filter(v => !!v).slice(0, 2)
  const expected = [
    'import { AService } from \'./01.ts\';',
    'import { BServiceMock } from \'./02.mock.ts\';',
  ]

  t.deepEqual(result, expected)
})

test(async t => {
  const path     = './fixture/using-injectable-multi-parents/01.ts'
  const renderer = new InquirerRenderer()
  const facade   = new Facade(
    path,
    tsconfig,
    makeRootRelativepath(path),
    {
      renderer,
      mockPathPattern:     '(.*)\.ts',
      mockPathReplacement: '$1-mock.ts',
    }
  )

  makeInquirerStub(renderer, [
    'Done, AService',
  ])

  const result   = (await facade.run()).split('\n').filter(v => !!v).slice(0, 2)
  const expected = [
    'import { AService } from \'./01.ts\';',
    'import { BServiceMock } from \'./02-mock.ts\';',
  ]

  t.deepEqual(result, expected)
})
