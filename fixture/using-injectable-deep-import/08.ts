/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { IService } from './09';

@Injectable()
export class HService {

  constructor(
    private i: IService,
  ) {
    //
  }

}
