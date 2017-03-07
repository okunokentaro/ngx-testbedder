let verboseLevel = 0

export const setVerboseLevel = (argv: any) => {
  verboseLevel = argv.verbose ? 2 : 0;
}

export const WARN  = (...args: any[]) => verboseLevel >= 0 && console.log.apply(console, args)
export const INFO  = (...args: any[]) => verboseLevel >= 1 && console.log.apply(console, args)
export const DEBUG = (...args: any[]) => verboseLevel >= 2 && console.log.apply(console, [`[verb] ${args[0]}`, ...args.slice(1)])

