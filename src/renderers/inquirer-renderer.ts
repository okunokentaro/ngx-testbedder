import { TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';
import { ArchyRenderer } from './archy-renderer';
import { Solved } from '../solver';

const inquirer = require('inquirer')

export class InquirerRenderer extends AbstractRenderer {

  private levelMap: Map<string, number>

  render(tree: {treeNode: TreeNode, solveds: Solved[]}): string {
    this.question(tree)

    return ''
  }

  private question(tree: {treeNode: TreeNode, solveds: Solved[]}) {
    this.levelMap = new Map<string, number>()
    tree.solveds.map(v => {
      this.levelMap.set(v.name, v.level)
    })

    this.doHoge(tree, tree.solveds[0].name)
  }

  private doHoge(tree: {treeNode: TreeNode, solveds: Solved[]}, className: string) {
    const f = (_tree: TreeNode, _className: string): TreeNode => {
      console.log(_className === _tree.label)
      const nodes = _className === _tree.label
        ? _tree.nodes.map(node => f(node, _className)).filter(n => !!n)
        : []

      return {
        path:  _tree.path,
        label: _tree.label,
        nodes
      }
    }
    const hoge = f(tree.treeNode, className)
    const archy = new ArchyRenderer()
    const treeLines = ['Done'].concat(archy.render({treeNode: hoge, solveds: tree.solveds}).split('\n').filter(l => !!l))

    const questions = [
      {
        type: 'checkbox',
        name: 'tree',
        message: 'Is this for delivery?',
        choices: treeLines,
        pageSize: 31,
      },
    ]
    inquirer.prompt(questions).then((answers: {tree: string[]}) => {
      answers.tree.map(a => {
        const _className = a.split(' ')[1]
        const level = this.levelMap.get(_className)
        this.doHoge(tree, _className)
      })
    })
  }

}