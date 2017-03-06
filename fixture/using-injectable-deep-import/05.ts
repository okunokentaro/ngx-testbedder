/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { FService } from './06';

@Injectable()
export class EService {

  constructor(
    private f: FService,
  ) {
    //
  }

}
