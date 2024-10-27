import { existsSync, mkdirSync } from "fs";
import { createLogger, format, transports, transport } from "winston";

export const { version } = require("../package.json"); // eslint-disable-line

const DefaultLogger = {
  info: console.info,
  error: console.error,
  warn: console.warn,
  silly: console.trace,
};

export type LoggerType = typeof DefaultLogger;
let _logger = DefaultLogger;
let _transports  : transport[] =  [new transports.Console()];
let _initialized = false;

const logFolder = "logs/";

export const getLogger = () => {
  try {
    if (_initialized) {
      return _logger;
    }

    if (process.env.DEFAULT_LOGGER) {
      _initialized = true;
      _logger.info("... Default Logger ...");
      return _logger;
    }

    if (
      !process.env.DISABLE_FILE_LOGS ||
      process.env.DISABLE_FILE_LOGS !== "true"
    ) {
      if (!existsSync(logFolder)) {
        mkdirSync(logFolder);
      }
      _transports.push(
        new transports.File({
          filename: `${logFolder}sleepingServer.log`,
          maxsize: 2 * 1024 * 1024,
          maxFiles: 3,
        })
      );
    }

    _logger = createLogger({
      level: "info",
      format: format.combine(
        format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        format.printf(
          (info) =>
            `${info.timestamp} ${info.level}: ${info.message}` +
            (info.splat !== undefined ? `${info.splat}` : " ")
        )
      ),
      transports: _transports,
    });
  } catch (error) {
    _logger.error("Failed to initialize logger", error);
    _logger = DefaultLogger;
  }
  _initialized = true;
  const msg = `... A new story begin v${version} ...`;
  const separator = msg.replace(/./g, ".");
  _logger.info(separator);
  _logger.info(msg);
  _logger.info(separator);
  return _logger;
};

export const getTransports = () => {
  return _transports;
}