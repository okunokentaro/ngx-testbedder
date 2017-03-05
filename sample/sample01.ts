/* tslint:disable:max-classes-per-file */

import { AService, BService } from './sample03'
import { CService, DService } from './sample04'

export function Injectable() {
  return (cls: any) => {
    return cls
  }
}

function OtherDecorator() {
  return (cls: any) => {
    return cls
  }
}

@Injectable()
class CCCC {

  constructor(
    private aService: AService,
    private bService: CService,
  ) {
    //
  }

  methodA(): string {
    return 'string'
  }

}

class DDDD {

  methodA(): string {
    return 'string'
  }

}
