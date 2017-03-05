import * as ts from 'typescript'

export const isClassDeclaration = (node: ts.Node): node is ts.ClassDeclaration => {
  return node.kind === ts.SyntaxKind.ClassDeclaration
}

export const isCallExpression = (node: ts.Node): node is ts.CallExpression => {
  return node.kind === ts.SyntaxKind.CallExpression
}

export const isConstructor = (node: ts.Node): node is ts.ConstructorDeclaration => {
  return node.kind === ts.SyntaxKind.Constructor
}

export const isTypeReference = (node: ts.Node): node is ts.TypeReferenceNode => {
  return node.kind === ts.SyntaxKind.TypeReference
}

export const isImportDeclaration = (node: ts.Node): node is ts.ImportDeclaration => {
  return node.kind === ts.SyntaxKind.ImportDeclaration
}

export const isImportSpecifier = (node: ts.Node): node is ts.ImportSpecifier => {
  return node.kind === ts.SyntaxKind.ImportSpecifier
}

export const isNamedImports = (namedBindings: ts.NamedImportBindings): namedBindings is ts.NamedImports => {
  return !!(namedBindings as any)['elements']
}
