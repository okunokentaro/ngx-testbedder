import * as ts from 'typescript'
declare const require: any

const files    = ['sample/sample.ts']
const tsconfig = require('../sample/tsconfig.json')
const program  = ts.createProgram(files, tsconfig)

for (const sourceFile of program.getSourceFiles()) {
  if (sourceFile.fileName.substr(-5) === '.d.ts') {
    continue
  }
  ts.forEachChild(sourceFile, visit)
}

function visit(node: ts.Node) {
  console.log(<any>node)
  console.log('========================================================')
  ts.forEachChild(node, visit)
}
