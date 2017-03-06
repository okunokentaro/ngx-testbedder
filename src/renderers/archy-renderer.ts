import { TreeNode } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';

const archy = require('archy')

export class ArchyRenderer extends AbstractRenderer {

  render(tree: TreeNode): string {
    return archy(tree)
  }

}