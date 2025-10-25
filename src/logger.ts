/**
 * Универсальный логгер
 * Поддерживает уровни логирования:
 *   - "debug" → выводит всё
 *   - "info"  → info, warn, error
 *   - "warn"  → warn, error
 *   - "error" → только ошибки
 *
 * Уровень логирования задаётся через process.env.LOG_LEVEL или по умолчанию "info".
 * Пример: process.env.LOG_LEVEL = "debug"
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

// class Logger зарезервирован на dota2.ru и есть конфликты интересов, поэтому так
export class extLogger {
  private prefix: string
  private level: LogLevel

  constructor(context: string = 'unknown') {
    this.prefix = context

    const envLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'
    this.level = envLevel

    this.info('Загружен')
  }

  private format(level: string, args: unknown[]): unknown[] {
    const time = new Date().toLocaleTimeString()
    return [`[${process.env.EXT_NAME}][${this.prefix}][${time}][${level.toUpperCase()}]`, ...args]
  }

  private shouldLog(level: LogLevel): boolean {
    const order: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }
    return order[level] >= order[this.level]
  }

  debug(...args: unknown[]) {
    if (!this.shouldLog('debug')) return
    console.debug(...this.format('debug', args))
  }

  info(...args: unknown[]) {
    if (!this.shouldLog('info')) return
    console.info(...this.format('info', args))
  }

  warn(...args: unknown[]) {
    if (!this.shouldLog('warn')) return
    console.warn(...this.format('warn', args))
  }

  error(...args: unknown[]) {
    if (!this.shouldLog('error')) return
    console.error(...this.format('error', args))
  }
}
