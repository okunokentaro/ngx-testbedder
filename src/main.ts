import * as ts from 'typescript'
declare const require: any

const isClassDeclaration = (node: ts.Node): node is ts.ClassDeclaration => {
  return node.kind === ts.SyntaxKind.ClassDeclaration
}
const isCallExpression = (node: ts.Node): node is ts.CallExpression => {
  return node.kind === ts.SyntaxKind.CallExpression
}

class Visitor {

  constructor(files: string[], tsconfig: any) {
    const program  = ts.createProgram(files, tsconfig)

    for (const sourceFile of program.getSourceFiles()) {
      if (sourceFile.fileName.substr(-5) === '.d.ts') {
        continue
      }
      ts.forEachChild(sourceFile, this.visit.bind(this))
    }
  }


  private visit(node: ts.Node) {
    if (isClassDeclaration(node) && node.decorators) {
      Array.from(node.decorators).forEach(decoNode => {
        ts.forEachChild(decoNode, this.visitDecorators.bind(this))
      })
    }
    ts.forEachChild(node, this.visit.bind(this))
  }

  private visitDecorators(node: ts.Node) {
    if (isCallExpression(node)) {
      const decoratorName = (<ts.Identifier>node.expression).text
      console.log('decoratorName', decoratorName)
    }
    ts.forEachChild(node, this.visitDecorators.bind(this))
  }

}

const main = () => {
  const files    = ['sample/sample.ts']
  const tsconfig = require('../sample/tsconfig.json')
  new Visitor(files, tsconfig)
}

main()