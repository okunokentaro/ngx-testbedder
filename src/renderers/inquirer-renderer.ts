import * as inquirer from 'inquirer'
import { EventEmitter } from 'events';

import { TreeLevelMap, TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';
import { ArchyRenderer } from './archy-renderer';

const resolveEventName = 'resolve'
interface SelfEventEmitter extends EventEmitter {
  on: (event: typeof resolveEventName, listener: (res: string) => void) => this
}

const doneText = 'Done'

export class InquirerRenderer extends AbstractRenderer {

  private emitter:  SelfEventEmitter
  private treeNode: TreeNode
  private levelMap: Map<string, number>

  constructor() {
    super()
    this.emitter = new EventEmitter() as SelfEventEmitter
  }

  render(treeLevelMap: TreeLevelMap): Promise<string> {
    this.treeNode = treeLevelMap.treeNode
    this.levelMap = treeLevelMap.levelMap

    this.renderPrompt([treeLevelMap.treeNode.label], 1)

    return new Promise(resolve => {
      this.emitter.on(resolveEventName, res => resolve(res))
    })
  }

  private async renderPrompt(chosens: string[], maxLevel: number) {
    const decimateTree = (
      node: TreeNode,
      _chosens: string[],
      _maxLevel: number
    ): TreeNode => {
      const nodes = this.getLevel(node) <= _maxLevel && _chosens.includes(node.label)
        ? node.nodes.map(n => decimateTree(n, _chosens, _maxLevel))
        : []

      return {
        path:  node.path,
        label: node.label,
        nodes,
      }
    }

    const calcTreeLines = async (
      _chosens: string[],
      _maxLevel: number
    ): Promise<string[]> => {
      const decimatedTree = decimateTree(this.treeNode, _chosens, _maxLevel)

      const archy       = new ArchyRenderer()
      const archyResult = await archy.render({treeNode: decimatedTree, levelMap: this.levelMap})
      return [doneText].concat(archyResult.split('\n').filter(l => !!l))
    }

    const treeLines = await calcTreeLines(chosens, maxLevel,) as string[]
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

      const treeLines = await calcTreeLines(
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

      const mockProviders = unchosens.map(item => {
        return `{provide: ${item}, useClass: ${item}Mock},`
      })

      const providers = _chosens.filter(item => item !== doneText).map(item => {
        return `${item},`
      })

      const result = providers.concat(mockProviders).join('\n')
      this.emitter.emit(resolveEventName, result)
    })
  }

  private getInquirer(): inquirer.Inquirer {
    return inquirer
  }

  private getLevel(tree: TreeNode) {
    return this.levelMap.get(tree.label)
  }

  private getClassName(questionsText: string) {
    return questionsText.split(' ').slice(-1)[0]
  }

}