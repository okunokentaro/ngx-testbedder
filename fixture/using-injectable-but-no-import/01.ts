/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';

class AService {

}

@Injectable()
class BService {

  constructor(
    private aService: AService,
  ) {
    //
  }

}
