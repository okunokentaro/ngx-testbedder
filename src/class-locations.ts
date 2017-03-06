import * as pathModule from 'path'
import { ClassLocation } from './class-location';

const typeScriptExtension = 'ts'
const extensionSeparator  = '.'

const makeAbsolutePath = (fileDir: string, partialPath: string) => {
  return [
    pathModule.resolve(fileDir, partialPath),
    typeScriptExtension,
  ].join(extensionSeparator)
}

export class ClassLocations {

  constructor(
    private list: ClassLocation[],
    private fileDir: string,
  ) {
    this.excludeNodeModules()
    this.classLocationArrayWithAbsolutePath()
  }

  toArray(): ClassLocation[] {
    return this.list
  }

  count(): number {
    return this.list.length
  }

  exists(): boolean {
    return 0 < this.count()
  }

  private classLocationArrayWithAbsolutePath() {
    this.list = this.list.map(loc => {
      return new ClassLocation(
        makeAbsolutePath(this.fileDir, loc.path),
        loc.name
      )
    })
  }

  private excludeNodeModules() {
    this.list = this.list.filter(loc => /^\./.test(loc.path))
  }

}
