/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { BService } from './02';
import { CService } from './03';
import { DService } from './04';

@Injectable()
class AService {

  constructor(
    private b: BService,
    private c: CService,
    private d: DService,
  ) {
    //
  }

}
