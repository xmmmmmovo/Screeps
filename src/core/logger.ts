export enum LoggerLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR
}

const levelsColor: Record<LoggerLevel, number[]> = {
  0: [36, 39],
  1: [32, 39],
  2: [33, 39],
  3: [91, 39]
}

const levelsString: Record<LoggerLevel, string> = {
  0: 'Debug',
  1: 'Info',
  2: 'Warn',
  3: 'Error'
}

const styles: Record<string, number[]> = {
  // styles
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  // grayscale
  white: [37, 39],
  grey: [90, 39],
  black: [90, 39]
}

/**
 * Taken from masylum's fork (https://github.com/masylum/log4js-node)
 */
function colorize(str: string, level: LoggerLevel) {
  const c = levelsColor[level]
  return `\x1B[${c[0]}m` + str + `\x1B[${c[1]}m`
}

interface ILoggerConfig {
  level: LoggerLevel
}

const consoleLog = console.log.bind(console)

class Logger {
  private _config: ILoggerConfig = {
    level: LoggerLevel.DEBUG
  }

  public set level(v: LoggerLevel) {
    this._config.level = v
  }

  public getLevelString(v: LoggerLevel): string {
    return levelsString[v]
  }

  public set config(v: ILoggerConfig) {
    this._config = v
  }

  /**
   * log具体实现
   * @param level log等级
   * @param args 参数列表
   */
  private _log(level: LoggerLevel, ...args: any[]): void {
    if (level < this._config.level) {
      return
    }
    if (args.length === 0) {
      consoleLog(colorize(`[${new Date().toISOString()}] [${this.getLevelString(level)}] - `, level))
    } else if (args.length === 1) {
      if (_.isObject(args[0])) {
        consoleLog(colorize(`[${new Date().toISOString()}] [${this.getLevelString(level)}] - `, level))
        consoleLog(args[0])
      } else {
        consoleLog(
          colorize(`[${new Date().toISOString()}] [${this.getLevelString(level)}] - ${args[0] as string}`, level)
        )
      }
    } else {
      consoleLog(
        colorize(`[${new Date().toISOString()}] [${this.getLevelString(level)}] - ${JSON.stringify(args)}`, level)
      )
    }
  }

  debug(message: any, ...args: any[]): void {
    this._log(LoggerLevel.DEBUG, message, ...args)
  }
  info(message: any, ...args: any[]): void {
    this._log(LoggerLevel.INFO, message, ...args)
  }
  warn(message: any, ...args: any[]): void {
    this._log(LoggerLevel.WARN, message, ...args)
  }
  error(message: any, ...args: any[]): void {
    this._log(LoggerLevel.ERROR, message, ...args)
  }
}

export const logger = new Logger()
