/* tslint:disable:max-classes-per-file */
import { Injectable } from '../mock-injectable';
import { AService } from './02';

@Injectable()
class BService {

  constructor(
    private aService: AService,
  ) {
    //
  }

}
