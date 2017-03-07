import test from 'ava'
import * as sinon from 'sinon'

import { Facade } from './facade';
import { TestingRenderer } from './renderers/testing-renderer';
import { InquirerRenderer } from './renderers/inquirer-renderer';

const packpath = require('packpath')
const tsconfig = require('../../fixture/tsconfig.json')
const testingRenderer = new TestingRenderer()

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
  const facade = new Facade(
    './fixture/using-injectable-and-import/01.ts',
    tsconfig,
    packpath.self(),
    {
      allowDuplicates: true,
      renderer: testingRenderer,
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
  const facade = new Facade(
    './fixture/using-injectable-deep-import/01.ts',
    tsconfig,
    packpath.self(),
    {
      allowDuplicates: true,
      renderer: testingRenderer,
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
  const facade = new Facade(
    './fixture/using-injectable-multi-edges/01.ts',
    tsconfig,
    packpath.self(),
    {
      allowDuplicates: true,
      renderer: testingRenderer,
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
  const facade = new Facade(
    './fixture/using-injectable-multi-parents/01.ts',
    tsconfig,
    packpath.self(),
    {
      allowDuplicates: true,
      renderer: testingRenderer,
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
  const facade = new Facade(
    './fixture/using-injectable-multi-parents/01.ts',
    tsconfig,
    packpath.self(),
    {
      allowDuplicates: false,
      renderer: testingRenderer,
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
  const renderer = new InquirerRenderer()
  const facade   = new Facade(
    './fixture/using-injectable-multi-parents/01.ts',
    tsconfig,
    packpath.self(),
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
    'import { BServiceMock } from \'./02.ts\';',
    'import { CServiceMock } from \'./03.ts\';',
    'import { DServiceMock } from \'./04.ts\';',
    'AService,',
    '{provide: BService, useClass: BServiceMock},',
    '{provide: CService, useClass: CServiceMock},',
    '{provide: DService, useClass: DServiceMock},',
  ]

  t.deepEqual(result, expected)
})

test(async t => {
  const renderer = new InquirerRenderer()
  const facade   = new Facade(
    './fixture/using-injectable-multi-parents/01.ts',
    tsconfig,
    packpath.self(),
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
    'import { EServiceMock } from \'./05.ts\';',
    'import { FServiceMock } from \'./06.ts\';',
    'import { CServiceMock } from \'./03.ts\';',
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
  const renderer = new InquirerRenderer()
  const facade   = new Facade(
    './fixture/using-injectable-multi-parents/01.ts',
    tsconfig,
    packpath.self(),
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
    'import { DServiceMock } from \'./04.ts\';',
    'import { EServiceMock } from \'./05.ts\';',
    'import { FServiceMock } from \'./06.ts\';',
    'import { CServiceMock } from \'./03.ts\';',
    'AService,',
    'BService,',
    '{provide: DService, useClass: DServiceMock},',
    '{provide: EService, useClass: EServiceMock},',
    '{provide: FService, useClass: FServiceMock},',
    '{provide: CService, useClass: CServiceMock},',
  ]

  t.deepEqual(result, expected)
})
