import * as ts from 'typescript'

import { isTypeReference, isImportDeclaration, isNamedImports } from './type-guards'
import { AbstractDetector } from './abstract-detector'

export class ImportDetector extends AbstractDetector {

  private paths = new Set<string>()

  constructor(
    private sourceFile: ts.SourceFile,
    private params: string[],
  ) {
    super()
  }

  detect(): string[] {
    ts.forEachChild(this.sourceFile, _node => this.visit(_node))
    return Array.from(this.paths)
  }

  private visit(node: ts.Node) {
    if (isImportDeclaration(node)) {
      const elements = this.getElements(node)
      this.detectPaths(node, elements)
    }
    ts.forEachChild(node, _node => this.visit(_node))
  }

  private detectPaths(node: ts.ImportDeclaration, elements: ts.ImportSpecifier[]) {
    elements.forEach(elem => {
      if (this.params.includes(elem.name.text)) {
        if ((node.moduleSpecifier as ts.StringLiteral).text) {
          const path = (node.moduleSpecifier as ts.StringLiteral).text
          this.paths.add(path)
        }
      }
    })
  }

  private getElements(node: ts.ImportDeclaration): ts.ImportSpecifier[] {
    if (!isNamedImports(node.importClause.namedBindings)) {
      return []
    }
    return Array.from(node.importClause.namedBindings.elements)
  }

}
