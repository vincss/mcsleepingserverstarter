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
let logger = DefaultLogger;
let initialized = false;

const logFolder = "logs/";

export const getLogger = () => {
  try {
    if (initialized) {
      return logger;
    }

    if (process.env.DEFAULT_LOGGER) {
      initialized = true;
      logger.info("... Default Logger ...");
      return logger;
    }

    const loggers: transport[] = [new transports.Console()];
    if (
      !process.env.DISABLE_FILE_LOGS ||
      process.env.DISABLE_FILE_LOGS !== "true"
    ) {
      if (!existsSync(logFolder)) {
        mkdirSync(logFolder);
      }
      loggers.push(
        new transports.File({
          filename: `${logFolder}sleepingServer.log`,
          maxsize: 2 * 1024 * 1024,
          maxFiles: 3,
        })
      );
    }

    logger = createLogger({
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
      transports: loggers,
    });
  } catch (error) {
    logger.error("Failed to initialize logger", error);
    logger = DefaultLogger;
  }
  initialized = true;
  const msg = `... A new story begin v${version} ...`;
  const separator = msg.replace(/./g, ".");
  logger.info(separator);
  logger.info(msg);
  logger.info(separator);
  return logger;
};
