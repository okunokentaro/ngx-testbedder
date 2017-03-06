import { TreeWithMap } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';

const archy = require('archy')

export class ArchyRenderer extends AbstractRenderer {

  render(treeWithMap: TreeWithMap): Promise<string> {
    return Promise.resolve(archy(treeWithMap.treeNode))
  }

}