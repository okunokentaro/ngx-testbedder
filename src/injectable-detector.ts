import * as ts from 'typescript'
import { EventEmitter } from 'events';

interface ClassPosition {
  fileName:      string
  position:      TextRangeTuple
  hasInjectable: boolean
}

type TextRangeTuple = [number, number]

const INJECTABLE_NAME   = 'Injectable'
const DETECT_INJECTABLE = 'detectInjectable'

const isClassDeclaration = (node: ts.Node): node is ts.ClassDeclaration => {
  return node.kind === ts.SyntaxKind.ClassDeclaration
}
const isCallExpression = (node: ts.Node): node is ts.CallExpression => {
  return node.kind === ts.SyntaxKind.CallExpression
}

export class InjectableDetector {

  private classPositions = [] as ClassPosition[]
  private fileName: string

  private emitter = new EventEmitter()

  private listener = (pos: TextRangeTuple) => {
    this.classPositions.forEach(v => {
      if (v.position[0] <= pos[0] && pos[1] <= v.position[1]) {
        v.hasInjectable = true
      }
    })
  }

  constructor(private sourceFile: ts.SourceFile) {
    this.fileName = this.sourceFile.fileName
  }

  detect(): any[] {
    ts.forEachChild(this.sourceFile, node => this.visit(node))
    return this.classPositions
  }

  private visit(node: ts.Node) {
    if (!isClassDeclaration(node) || !node.decorators) {
      ts.forEachChild(node, _node => this.visit(_node))
      return
    }

    // This node is a class declarations.
    this.classPositions.push({
      fileName:      this.fileName,
      position:      [node.pos, node.end],
      hasInjectable: false,
    })

    Array.from(node.decorators).forEach(decoNode => {
      this.emitter.on(DETECT_INJECTABLE, this.listener)
      ts.forEachChild(decoNode, _node => this.visitDecorators(_node))
    })
  }

  private visitDecorators(node: ts.Node) {
    if (isCallExpression(node)) {
      const decoratorName = (node.expression as ts.Identifier).text
      if (decoratorName === INJECTABLE_NAME) {
        this.emitter.emit(DETECT_INJECTABLE, [node.pos, node.end])
      }
    }
    this.emitter.removeListener(DETECT_INJECTABLE, this.listener)
    ts.forEachChild(node, _node => this.visitDecorators(_node))
  }

}
