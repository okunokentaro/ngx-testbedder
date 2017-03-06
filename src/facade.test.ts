import test from 'ava'
import { Facade } from './facade';

const packpath = require('packpath')

// test(_ => {
//   const tsconfig = require('../../fixture/tsconfig.json')
//
//   const rootRelativePath = './fixture/using-injectable-but-no-import/01.ts'
//   const facade           = new Facade(rootRelativePath, tsconfig, packpath.self())
//
//   const result = facade.run()
//   console.log(result);
// })

test(_ => {
  const tsconfig = require('../../fixture/tsconfig.json')

  const rootRelativePath = './fixture/using-injectable-and-import/01.ts'
  const facade           = new Facade(rootRelativePath, tsconfig, packpath.self())

  const result = facade.run()
  console.log(result);
})
