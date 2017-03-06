import { TreeLevelMap } from '../tree-builder';

export abstract class AbstractRenderer {

  abstract render(treeLevelMap: TreeLevelMap): Promise<string>

}