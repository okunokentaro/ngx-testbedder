import { TreeLevelMap } from '../tree-builder';
import { AbstractRenderer } from './abstract-renderer';

const archy = require('archy')

export class ArchyRenderer extends AbstractRenderer {

  render(treeLevelMap: TreeLevelMap): Promise<string> {
    return Promise.resolve(archy(treeLevelMap.treeNode))
  }

}