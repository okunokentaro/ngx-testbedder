/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { EService } from './05';

@Injectable()
export class DService {

  constructor(
    private e: EService,
  ) {
    //
  }

}
