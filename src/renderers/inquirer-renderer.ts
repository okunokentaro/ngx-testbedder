import * as inquirer from 'inquirer'
import { EventEmitter } from 'events';

import { TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';
import { ArchyRenderer } from './archy-renderer';
import { Solved } from '../solver';

type TreeSolveds = {treeNode: TreeNode, solveds: Solved[]}

export class InquirerRenderer extends AbstractRenderer {

  private emitter: EventEmitter
  private levelMap: Map<string, number>

  render(tree: TreeSolveds): Promise<string> {
    this.question(tree)
    this.emitter = new EventEmitter()

    return new Promise(resolve => {
      this.emitter.on('resolve', (res: string) => {
        resolve(res)
      })
    })
  }

  private question(tree: TreeSolveds) {
    this.levelMap = new Map<string, number>()
    tree.solveds.map(v => {
      this.levelMap.set(v.name, v.level)
    })

    this.renderPrompt(tree, [tree.treeNode.label], 1)
  }

  private async renderPrompt(tree: TreeSolveds, chosens: string[], maxLevel: number) {
    const decimateTree = (tree: TreeNode, _maxLevel: number): TreeNode => {
      if (_maxLevel < this.levelMap.get(tree.label)) {
        return {
          path: tree.path,
          label: tree.label,
          nodes: [],
        }
      }
      if (!chosens.includes(tree.label)) {
        return {
          path: tree.path,
          label: tree.label,
          nodes: [],
        }
      }
      return {
        path: tree.path,
        label: tree.label,
        nodes: tree.nodes.map(node => decimateTree(node, _maxLevel)),
      }
    }

    const decimatedTree = decimateTree(tree.treeNode, maxLevel)

    const archy = new ArchyRenderer()
    const archyResult = await archy.render({treeNode: decimatedTree, solveds: tree.solveds})
    const treeLines = ['Done'].concat(archyResult.split('\n').filter(l => !!l))

    const defaultChosens = treeLines.map((item, idx) => {
      if (chosens.includes(item.split(' ').slice(-1)[0])) {
        return idx
      }
    }).map(idx => {
      return treeLines[idx]
    })

    const questions = [
      {
        type: 'checkbox',
        name: 'tree',
        message: 'Is this for delivery?',
        choices: treeLines,
        default: defaultChosens,
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

      if (answer.tree.includes('Done')) {
        const treeLinesExcludeDone = treeLines.filter(item => item !== 'Done')

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
        const providers = chosens.filter(item => item !== 'Done').map(item => {
          return `${item},`
        })

        this.emitter.emit('resolve', providers.concat(mockProviders).join('\n'))
        return
      }
      this.renderPrompt(tree, chosens, maxLevel + 1)
    })
  }

  private getInquirer(): inquirer.Inquirer {
    return inquirer
  }

}