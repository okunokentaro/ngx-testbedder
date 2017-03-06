/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { DService } from './04';

@Injectable()
export class CService {

  constructor(
    private d: DService,
  ) {
    //
  }

}
