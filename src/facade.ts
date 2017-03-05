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
    const dispose = this.solver.addListenerOutput((v: string) => {
      console.log('output', v)
    })
    this.solver.run()
    dispose()
  }

}
