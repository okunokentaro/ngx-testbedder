import * as pathModule from 'path'
import * as inquirer from 'inquirer'
import { EventEmitter } from 'events';

import { TreeWithMap, TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';
import { ArchyRenderer } from './archy-renderer';

const resolveEventName = 'resolve'
interface SelfEventEmitter extends EventEmitter {
  on: (event: typeof resolveEventName, listener: (res: string) => void) => this
}

const doneText = 'Done'

export class InquirerRenderer extends AbstractRenderer {

  private emitter:     SelfEventEmitter
  private treeWithMap: TreeWithMap

  constructor() {
    super()
    this.emitter = new EventEmitter() as SelfEventEmitter
  }

  render(treeWithMap: TreeWithMap): Promise<string> {
    this.treeWithMap = treeWithMap
    this.renderPrompt([this.treeWithMap.treeNode.label], 1)

    return new Promise(resolve => {
      this.emitter.on(resolveEventName, res => resolve(res))
    })
  }

  private async renderPrompt(chosens: string[], maxLevel: number) {
    const decimateNode = (
      node: TreeNode,
      _chosens: string[],
      _maxLevel: number
    ): TreeNode => {
      const nodes = this.getLevel(node) <= _maxLevel && _chosens.includes(node.label)
        ? node.nodes.map(n => decimateNode(n, _chosens, _maxLevel))
        : []

      return {label: node.label, nodes}
    }

    const reCalcTreeLines = async (
      _chosens: string[],
      _maxLevel: number
    ): Promise<string[]> => {
      const decimatedTree = decimateNode(this.treeWithMap.treeNode, _chosens, _maxLevel)

      const archyResult = await new ArchyRenderer()
        .render(Object.assign({}, this.treeWithMap, {treeNode: decimatedTree}))
      return [doneText].concat(archyResult.split('\n').filter(l => !!l))
    }

    const treeLines = await reCalcTreeLines(chosens, maxLevel) as string[]
    const defaultChosens = treeLines
      .map((item, idx) => chosens.includes(this.getClassName(item)) ? idx : null)
      .filter(v => !!v)
      .map(idx => treeLines[idx])

    const questions = [
      {
        type:     'checkbox',
        name:     'tree',
        message:  'Which module do you use as real?',
        choices:  treeLines,
        default:  defaultChosens,
        pageSize: 31,
      },
    ]

    this.getInquirer().prompt(questions).then(async (answer: {tree: string[]}) => {
      const _chosens = Array.from(
        new Set(answer.tree.map(item => this.getClassName(item)))
      )

      if (!answer.tree.includes(doneText)) {
        this.renderPrompt(_chosens, maxLevel + 1)
        return
      }

      const treeLines = await reCalcTreeLines(
        _chosens.filter(item => item !== doneText),
        maxLevel + 1
      )

      const unchosens = Array.from(
        new Set(
          treeLines
            .filter(item => item !== doneText)
            .map(item => this.getClassName(item))
            .filter(item => !_chosens.includes(item))
        )
      )

      const imports       = this.formatImports(_chosens.filter(item => item !== doneText))
      const mockImports   = this.formatMockImports(unchosens)
      const providers     = this.formatProviders(_chosens.filter(item => item !== doneText))
      const mockProviders = this.formatMockProviders(unchosens)

      const result = imports
        .concat(...mockImports)
        .concat('') // a blank line
        .concat(...providers)
        .concat(...mockProviders)
        .join('\n')

      this.emitter.emit(resolveEventName, result)
    })
  }

  private getInquirer(): inquirer.Inquirer {
    return inquirer
  }

  private getLevel(node: TreeNode) {
    return this.treeWithMap.levelMap.get(node.label)
  }

  private getClassName(questionsText: string) {
    return questionsText.split(' ').slice(-1)[0]
  }

  private formatProviders(classNames: string[]): string[] {
    return classNames
      .map(item => `${item},`)
  }

  private formatMockProviders(classNames: string[]): string[] {
    return classNames
      .map(cls => `{provide: ${cls}, useClass: ${cls}Mock},`)
  }

  private formatImports(classNames: string[]): string[] {
    const baseLabel   = this.treeWithMap.treeNode.label
    const basePath    = this.treeWithMap.pathMap.get(baseLabel)
    const baseDirPath = pathModule.dirname(basePath)
    return classNames
      .map(cls => {
        const absPath = this.treeWithMap.pathMap.get(cls)
        const path    = (() => {
          const tmp = pathModule.relative(baseDirPath, absPath)
          return  /^\./.test(tmp) ? tmp : `./${tmp}`
        })()
        return `import { ${cls} } from '${path}';`
      })
  }

  private formatMockImports(classNames: string[]): string[] {
    const baseLabel   = this.treeWithMap.treeNode.label
    const basePath    = this.treeWithMap.pathMap.get(baseLabel)
    const baseDirPath = pathModule.dirname(basePath)
    return classNames
      .map(cls => {
        const absPath = this.treeWithMap.pathMap.get(cls)
        const path    = (() => {
          const tmp = pathModule.relative(baseDirPath, absPath)
          return  /^\./.test(tmp) ? tmp : `./${tmp}`
        })()

        return `import { ${cls}Mock } from '${path}';`
      }).filter(v => !!v)
  }

}