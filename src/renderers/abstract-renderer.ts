import { TreeWithMap } from '../tree-builder';

export abstract class AbstractRenderer {

  abstract render(treeWithMap: TreeWithMap): Promise<string>

}