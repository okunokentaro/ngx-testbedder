/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { CService } from './03';

@Injectable()
export class BService {

  constructor(
    private c: CService,
  ) {
    //
  }

}
