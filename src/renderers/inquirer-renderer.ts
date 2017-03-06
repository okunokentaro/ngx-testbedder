import * as inquirer from 'inquirer'

import { TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';
import { ArchyRenderer } from './archy-renderer';
import { Solved } from '../solver';

type TreeSolveds = {treeNode: TreeNode, solveds: Solved[]}
type PromptTarget = {name: string, level: number}

export class InquirerRenderer extends AbstractRenderer {

  private levelMap: Map<string, number>

  render(tree: TreeSolveds): string {
    this.question(tree)
    return ''
  }

  private question(tree: TreeSolveds) {
    this.levelMap = new Map<string, number>()
    tree.solveds.map(v => {
      this.levelMap.set(v.name, v.level)
    })

    this.renderPrompt(tree, [tree.treeNode.label], 1)
  }

  private renderPrompt(tree: TreeSolveds, chosens: string[], maxLevel: number) {
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
    const treeLines = ['Done'].concat(archy.render({treeNode: decimatedTree, solveds: tree.solveds}).split('\n').filter(l => !!l))

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
      const chosens = answer.tree.map(item => {
        return item.split(' ').slice(-1)[0]
      })
      if (answer.tree.includes('Done')) {
        const unchosens = treeLines.map(item => {
          return item.split(' ').slice(-1)[0]
        }).filter(item => {
          return !chosens.includes(item)
        })

        const mockProviders = unchosens.map(item => {
          return `{provide: ${item}, useClass: ${item}Mock},`
        })
        const providers = chosens.map(item => {
          return `${item},`
        })

        console.info(providers.concat(mockProviders).join('\n'));
        return
      }
      this.renderPrompt(tree, chosens, maxLevel + 1)
    })
  }

  private getInquirer(): inquirer.Inquirer {
    return inquirer
  }

}