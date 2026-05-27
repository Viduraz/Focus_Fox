/**
 * Centralized logging utility for FocusFox.
 *
 * Provides consistent, color-coded log formatting across all
 * extension contexts: popup, background service worker, and content script.
 *
 * Usage:
 *   logger.info('Popup', 'Component mounted');
 *   logger.error('Background', 'Failed to fetch', error);
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LOG_PREFIX = '🦊 [FocusFox]';

/** Console color styles per log level */
const LOG_STYLES: Record<LogLevel, string> = {
  info:  'color: #f97316; font-weight: bold',
  warn:  'color: #fbbf24; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  debug: 'color: #64748b; font-weight: bold',
};

function formatMessage(level: LogLevel, context: string, message: string): string {
  return `${LOG_PREFIX} [${level.toUpperCase()}] [${context}] ${message}`;
}

export const logger = {
  info(context: string, message: string, ...args: unknown[]): void {
    console.log(`%c${formatMessage('info', context, message)}`, LOG_STYLES.info, ...args);
  },

  warn(context: string, message: string, ...args: unknown[]): void {
    console.warn(`%c${formatMessage('warn', context, message)}`, LOG_STYLES.warn, ...args);
  },

  error(context: string, message: string, ...args: unknown[]): void {
    console.error(`%c${formatMessage('error', context, message)}`, LOG_STYLES.error, ...args);
  },

  debug(context: string, message: string, ...args: unknown[]): void {
    console.debug(`%c${formatMessage('debug', context, message)}`, LOG_STYLES.debug, ...args);
  },
};
