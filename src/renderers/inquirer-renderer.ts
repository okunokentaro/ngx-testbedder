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

  private emitter: SelfEventEmitter
  private levelMap: Map<string, number>

  constructor() {
    super()
    this.emitter = new EventEmitter() as SelfEventEmitter
  }

  render(treeLevelMap: TreeLevelMap): Promise<string> {
    this.levelMap = treeLevelMap.levelMap
    this.renderPrompt(treeLevelMap, [treeLevelMap.treeNode.label], 1)

    return new Promise(resolve => {
      this.emitter.on(resolveEventName, res => resolve(res))
    })
  }

  private async renderPrompt(treeLevelMap: TreeLevelMap, chosens: string[], _maxLevel: number) {
    const decimateTree = (tree: TreeNode, maxLevel: number): TreeNode => {
      const nodes = this.getLevel(tree) <= maxLevel && chosens.includes(tree.label)
        ? tree.nodes.map(node => decimateTree(node, maxLevel))
        : []

      return {
        path:  tree.path,
        label: tree.label,
        nodes,
      }
    }

    const decimatedTree = decimateTree(treeLevelMap.treeNode, _maxLevel)

    const archy       = new ArchyRenderer()
    const archyResult = await archy.render({
      treeNode: decimatedTree,
      levelMap: treeLevelMap.levelMap
    })
    const treeLines   = [doneText].concat(archyResult.split('\n').filter(l => !!l))

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

    this.getInquirer().prompt(questions).then((answer: {tree: string[]}) => {
      const chosens = Array.from((() => {
        return new Set(
          answer.tree.map(item => {
            return item.split(' ').slice(-1)[0]
          })
        )
      })())

      if (answer.tree.includes(doneText)) {
        const treeLinesExcludeDone = treeLines.filter(item => item !== doneText)

        const unchosens = Array.from(
          new Set(
            treeLinesExcludeDone.map(item => {
              return item.split(' ').slice(-1)[0]
            }).filter(item => {
              return !chosens.includes(item)
            })
          )
        )

        const mockProviders = unchosens.map(item => {
          return `{provide: ${item}, useClass: ${item}Mock},`
        })
        const providers = chosens.filter(item => item !== doneText).map(item => {
          return `${item},`
        })

        this.emitter.emit(resolveEventName, providers.concat(mockProviders).join('\n'))
        return
      }
      this.renderPrompt(treeLevelMap, chosens, _maxLevel + 1)
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