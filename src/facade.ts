import { Solver } from './solver';

export class Facade {

  solver: Solver

  constructor(
    private filePath: string,
    private tsconfig: any,
    private projectRoot: string,
  ) {
    this.solver = new Solver(filePath, tsconfig, projectRoot)
  }

  run() {
    this.solver.run()
  }

}
