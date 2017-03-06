/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { GService } from './07';

@Injectable()
export class FService {

  constructor(
    private g: GService,
  ) {
    //
  }

}
