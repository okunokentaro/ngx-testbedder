/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { EService } from './05';
import { FService } from './06';

@Injectable()
export class BService {

  constructor(
    private e: EService,
    private f: FService,
  ) {
    //
  }

}
