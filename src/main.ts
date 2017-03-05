import * as ts from 'typescript'
import { EventEmitter } from 'events';
declare const require: any

type TextRangeTuple = [number, number]

const injectableName = 'Injectable'

const isClassDeclaration = (node: ts.Node): node is ts.ClassDeclaration => {
  return node.kind === ts.SyntaxKind.ClassDeclaration
}
const isCallExpression = (node: ts.Node): node is ts.CallExpression => {
  return node.kind === ts.SyntaxKind.CallExpression
}

class Visitor {

  private classPositions = [] as {
    position: TextRangeTuple,
    hasInjectable: boolean,
  }[]

  private emitter = new EventEmitter()

  private listener = (pos: TextRangeTuple) => {
    this.classPositions.forEach(v => {
      if (v.position[0] <= pos[0] && pos[1] <= v.position[1]) {
        v.hasInjectable = true
      }
    })
    console.log(this.classPositions)
  }

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
      this.classPositions.push({
        position: [node.pos, node.end],
        hasInjectable: false,
      })
      Array.from(node.decorators).forEach(decoNode => {
        this.hasInjectable(decoNode)
      })
    }
    ts.forEachChild(node, this.visit.bind(this))
  }

  private hasInjectable(node: ts.Decorator): boolean {
    this.emitter.on('detectInjectable', this.listener)

    ts.forEachChild(node, this.visitDecorators.bind(this))
    return false
  }

  private visitDecorators(node: ts.Node) {
    if (isCallExpression(node)) {
      const decoratorName = (node.expression as ts.Identifier).text
      if (decoratorName === injectableName) {
        this.emitter.emit('detectInjectable', [node.pos, node.end])
      }
    }
    this.emitter.removeListener('detectInjectable', this.listener)
    ts.forEachChild(node, this.visitDecorators.bind(this))
  }

}

const main = () => {
  const files    = ['sample/sample.ts']
  const tsconfig = require('../sample/tsconfig.json')
  return new Visitor(files, tsconfig)
}

main()
