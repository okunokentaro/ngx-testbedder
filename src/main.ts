import * as ts from 'typescript'
import { EventEmitter } from 'events';
declare const require: any

interface ClassPosition {
  fileName:      string
  position:      TextRangeTuple
  hasInjectable: boolean
}

type TextRangeTuple = [number, number]

const injectableName = 'Injectable'

const isClassDeclaration = (node: ts.Node): node is ts.ClassDeclaration => {
  return node.kind === ts.SyntaxKind.ClassDeclaration
}
const isCallExpression = (node: ts.Node): node is ts.CallExpression => {
  return node.kind === ts.SyntaxKind.CallExpression
}

const DETECT_INJECTABLE = 'detectInjectable'

class Facade {

  constructor(files: string[], tsconfig: any) {
    const program        = ts.createProgram(files, tsconfig)
    const classPositions = program.getSourceFiles().map(sourceFile => {
      if (sourceFile.fileName.substr(-5) === '.d.ts') {
        return
      }
      const detector = new InjectableDetector(sourceFile)
      return detector.detect()
    }).filter(i => !!i)

    console.log('constructor', JSON.stringify(classPositions))
  }

}

class InjectableDetector {

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
      if (decoratorName === injectableName) {
        this.emitter.emit(DETECT_INJECTABLE, [node.pos, node.end])
      }
    }
    this.emitter.removeListener(DETECT_INJECTABLE, this.listener)
    ts.forEachChild(node, _node => this.visitDecorators(_node))
  }

}

const main = () => {
  const files    = ['sample/sample01.ts', 'sample/sample02.ts']
  const tsconfig = require('../sample/tsconfig.json')
  return new Facade(files, tsconfig)
}

main()
