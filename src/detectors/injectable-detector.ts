import * as ts from 'typescript'
import { EventEmitter } from 'events'

import { isClassDeclaration, isCallExpression } from '../type-guards'
import { AbstractDetector, TextRangeTuple } from './abstract-detector'

interface ClassPosition {
  position:      TextRangeTuple
  hasInjectable: boolean
}

const INJECTABLE_NAME   = 'Injectable'
const DETECT_INJECTABLE = 'detectInjectable'

export class InjectableDetector extends AbstractDetector {

  private classPositions = [] as ClassPosition[]

  private emitter = new EventEmitter()

  private listeners = {
    [DETECT_INJECTABLE]: (pos: TextRangeTuple) => {
      this.classPositions.forEach(v => {
        if (v.position[0] <= pos[0] && pos[1] <= v.position[1]) {
          v.hasInjectable = true
        }
      })
    },
  } as {[eventName: string]: () => void}

  constructor(
    private sourceFile: ts.SourceFile,
  ) {
    super()
  }

  detect(): TextRangeTuple[] {
    ts.forEachChild(this.sourceFile, node => this.visit(node))
    return this.classPositions.map(pos => {
      if (pos.hasInjectable) {
        return pos.position
      }
    }).filter(item => !!item)
  }

  private visit(node: ts.Node) {
    if (!isClassDeclaration(node) || !node.decorators) {
      ts.forEachChild(node, _node => this.visit(_node))
      return
    }

    // This node is a class declarations.
    this.classPositions.push({
      position:      [node.pos, node.end],
      hasInjectable: false,
    })

    Array.from(node.decorators).forEach(decoNode => {
      this.emitter.on(DETECT_INJECTABLE, this.listeners[DETECT_INJECTABLE])
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
    this.emitter.removeListener(DETECT_INJECTABLE, this.listeners[DETECT_INJECTABLE])
    ts.forEachChild(node, _node => this.visitDecorators(_node))
  }

}
