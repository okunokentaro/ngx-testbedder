import * as ts from 'typescript'

import { isTypeReference, isImportDeclaration, isNamedImports } from '../type-guards'
import { AbstractDetector } from './abstract-detector'
import { ClassLocation } from '../class-location';

export class ImportDetector extends AbstractDetector {

  private paths = new Map<string, string>()

  constructor(
    private sourceFile: ts.SourceFile,
    private params: string[],
  ) {
    super()
  }

  detect(): ClassLocation[] {
    ts.forEachChild(this.sourceFile, _node => this.visit(_node))

    return Array.from(this.paths.keys())
      .map(k => {
        return new ClassLocation(k, this.paths.get(k))
      })
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
          this.paths.set(path, elem.name.text)
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
