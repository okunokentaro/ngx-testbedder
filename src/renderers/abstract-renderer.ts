import { TreeWithMap } from '../tree-builder'
import { OptionsNonNull } from '../facade'

export abstract class AbstractRenderer {

  abstract render(treeWithMap: TreeWithMap, options?: OptionsNonNull): Promise<string>

}
