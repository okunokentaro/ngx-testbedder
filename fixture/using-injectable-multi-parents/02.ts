/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { DService } from './04';
import { EService } from './05';
import { FService } from './06';

@Injectable()
export class BService {

  constructor(
    private d: DService,
    private e: EService,
    private f: FService,
  ) {
    //
  }

}
