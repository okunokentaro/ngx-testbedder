/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { GService } from './07';
import { HService } from './08';

@Injectable()
export class CService {

  constructor(
    private g: GService,
    private h: HService,
  ) {
    //
  }

}
