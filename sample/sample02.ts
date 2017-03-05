/* tslint:disable:max-classes-per-file */

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

class AService {

}

class BService {

}

class CService {

}

class DService {

}

class CCCC {

  constructor(
    private aService: AService,
  ) {
    //
  }

  methodA(): string {
    return 'string'
  }

}

@Injectable()
class DDDD {

  constructor(
    public cService: CService,
    protected dService: DService,
  ) {

  }

  methodA(): string {
    return 'string'
  }

}
