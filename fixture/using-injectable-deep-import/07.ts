/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { HService } from './08';

@Injectable()
export class GService {

  constructor(
    private h: HService,
  ) {
    //
  }

}
