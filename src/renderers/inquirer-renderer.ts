import * as inquirer from 'inquirer'
import { EventEmitter } from 'events';

import { TreeLevelMap, TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';
import { ArchyRenderer } from './archy-renderer';

export class InquirerRenderer extends AbstractRenderer {

  private emitter: EventEmitter
  private levelMap: Map<string, number>

  render(treeLevelMap: TreeLevelMap): Promise<string> {
    this.question(treeLevelMap)
    this.emitter = new EventEmitter()

    return new Promise(resolve => {
      this.emitter.on('resolve', (res: string) => {
        resolve(res)
      })
    })
  }

  private question(treeLevelMap: TreeLevelMap) {
    this.levelMap = treeLevelMap.levelMap
    this.renderPrompt(treeLevelMap, [treeLevelMap.treeNode.label], 1)
  }

  private async renderPrompt(treeLevelMap: TreeLevelMap, chosens: string[], maxLevel: number) {
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

    const decimatedTree = decimateTree(treeLevelMap.treeNode, maxLevel)

    const archy = new ArchyRenderer()
    const archyResult = await archy.render({treeNode: decimatedTree, levelMap: treeLevelMap.levelMap})
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
      this.renderPrompt(treeLevelMap, chosens, maxLevel + 1)
    })
  }

  private getInquirer(): inquirer.Inquirer {
    return inquirer
  }

}