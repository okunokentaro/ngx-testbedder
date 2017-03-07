import * as ts from 'typescript'

import { isImportDeclaration, isNamedImports } from '../type-guards'
import { AbstractDetector } from './abstract-detector'
import { ClassLocation } from '../class-location';
import { ClassLocations } from '../class-locations';

export class ImportDetector extends AbstractDetector {

  private pathMap = new Map<string, string>()

  constructor(
    private sourceFile: ts.SourceFile,
    private params: string[],
    private fileDir: string
  ) {
    super()
  }

  detect(): ClassLocations {
    ts.forEachChild(this.sourceFile, _node => this.visit(_node))
    return this.makeClassLocations(this.pathMap)
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
          this.pathMap.set(path, elem.name.text)
        }
      }
    })
  }

  private getElements(node: ts.ImportDeclaration): ts.ImportSpecifier[] {
    if (!node.importClause) {
      // Only import but not used as variable
      // e.g.) import 'rxjs/add/operator/switchMap';
      return []
    }

    if (!isNamedImports(node.importClause.namedBindings)) {
      return []
    }

    return Array.from(node.importClause.namedBindings.elements)
  }

  private makeClassLocations(pathMap: Map<string, string>): ClassLocations {
    return new ClassLocations(
      Array.from(pathMap.keys())
        .map(k => {
          return new ClassLocation(k, pathMap.get(k))
        }),
      this.fileDir
    )
  }

}
