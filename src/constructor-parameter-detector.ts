import * as ts from 'typescript'
import { isConstructor, isTypeReference } from './type-guards'
import { TextRangeTuple } from './main'
import { AbstractDetector } from './abstract-detector'

export class ConstructorParameterDetector extends AbstractDetector {

  private injectClassNames = [] as string[]

  constructor(
    private sourceFile:     ts.SourceFile,
    private detectedRanges: TextRangeTuple[],
  ) {
    super()
  }

  detect(): string[] {
    if (this.detectedRanges.length < 1) {
      return []
    }
    ts.forEachChild(this.sourceFile, _node => this.visit(_node))
    return this.injectClassNames
  }

  private visit(node: ts.Node) {
    if (isConstructor(node)) {
      const inInRange = this.detectedRanges.some(range => {
        return this.isInRange(range, [node.pos, node.end])
      })
      if (!inInRange) {
        return
      }

      Array.from(node.parameters).forEach(paramNode => {
        ts.forEachChild(paramNode, _node => this.visitParameters(_node))
      })
    }
    ts.forEachChild(node, _node => this.visit(_node))
  }

  private visitParameters(node: ts.Node) {
    if (isTypeReference(node)) {
      const injectClassName = (node.typeName as ts.Identifier).text
      this.injectClassNames.push(injectClassName)
    }
  }

}
