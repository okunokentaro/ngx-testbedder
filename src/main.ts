import * as ts from 'typescript'
declare const require: any

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
    if (node.kind === ts.SyntaxKind.ClassDeclaration) {
      const classDefNode = node as ts.ClassDeclaration
      if (classDefNode.decorators) {
        Array.from(classDefNode.decorators).forEach(decoratorNode => {
          ts.forEachChild(decoratorNode, this.visitDecorators.bind(this))
        })
      }
    }
    ts.forEachChild(node, this.visit.bind(this))
  }

  private visitDecorators(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.CallExpression) {
      const callNode      = node as ts.CallExpression
      const decoratorName = (<ts.Identifier>callNode.expression).text
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