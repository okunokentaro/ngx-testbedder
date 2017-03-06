/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { BService } from './02';

@Injectable()
class AService {

  constructor(
    private b: BService,
  ) {
    //
  }

}
