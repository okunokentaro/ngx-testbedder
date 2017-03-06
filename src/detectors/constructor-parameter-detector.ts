import * as ts from 'typescript'

import { isConstructor, isTypeReference, isClassDeclaration } from '../type-guards'
import { AbstractDetector, TextRangeTuple } from './abstract-detector'

export class ConstructorParameterDetector extends AbstractDetector {

  private injectClassNames = [] as string[]
  private includingClassName: string
  private classDeclarations = [] as Array<{name: string, position: TextRangeTuple}>

  constructor(
    private sourceFile:     ts.SourceFile,
    private detectedRanges: TextRangeTuple[],
  ) {
    super()
  }

  detect(): {includingClassName: string, injectNames: string[]} {
    if (this.detectedRanges.length < 1) {
      return {
        includingClassName: this.includingClassName,
        injectNames: []
      }
    }
    ts.forEachChild(this.sourceFile, _node => this.visit(_node))
    return {
      includingClassName: this.includingClassName,
      injectNames: this.injectClassNames
    }
  }

  private visit(node: ts.Node) {
    if (isClassDeclaration(node)) {
      this.classDeclarations.push({
        name: node.name.text,
        position: [node.pos, node.end]
      })
      ts.forEachChild(node, _node => this.visit(_node))
      return
    }

    if (isConstructor(node)) {
      const targetClassDeclaration = this.classDeclarations.find(classDeclaration => {
        return this.isInRange(classDeclaration.position, [node.pos, node.end])
      })

      this.includingClassName = targetClassDeclaration.name
      const inInRange = this.detectedRanges.some(range => {
        return this.isInRange(range, [node.pos, node.end])
      })
      if (!inInRange) {
        return
      }

      Array.from(node.parameters).forEach(paramNode => {
        ts.forEachChild(paramNode, _node => this.visitParameters(_node))
      })
      return
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
