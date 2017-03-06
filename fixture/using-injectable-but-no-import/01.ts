/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';

class BService {

}

@Injectable()
class AService {

  constructor(
    private b: BService,
  ) {
    //
  }

}
