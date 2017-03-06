import * as pathModule from 'path'
import { ClassLocation } from './class-location';

const typeScriptExtension = 'ts'
const extensionSeparator  = '.'

export class ClassLocations {

  constructor(
    private list: ClassLocation[],
  ) {
    this.excludeNodeModules()
  }

  hoge(filePath: string): ClassLocation[] {
    return this.list.map(loc => {
        const fileDir = this.getFileDir(filePath)

        const absolutePath = [
          pathModule.resolve(fileDir, loc.path),
          typeScriptExtension
        ]
          .join(extensionSeparator)

        return new ClassLocation(absolutePath, loc.name)
      })
  }

  private excludeNodeModules() {
    this.list = this.list.filter(loc => /^\./.test(loc.path))
  }

  getFileDir(pathWithFileName: string): string {
    return pathWithFileName.split(pathModule.basename(pathWithFileName))[0]
  }

}
