// import LoggerBuilder from '@jsprismarine/prismarine/dist/utils/Logger';
import { existsSync, mkdirSync } from 'fs';
import { createLogger, format, transports } from 'winston';
import { version } from './package.json';

const DefaultLogger = {
    info: (...params: any) => console.info(params),
    error: (...params: any) => console.error(params),
    warn: (...params: any) => console.warn(params),
    silly: (...params: any) => console.trace(params)
};

export type LoggerType = typeof DefaultLogger;
let logger = DefaultLogger;
let initialized = false;

const logFolder = 'logs/';

export const getLogger = () => {
    try {

        if (initialized) {
            return logger;
        }

        if (!existsSync(logFolder)) {
            mkdirSync(logFolder);
        }

        // logger = new LoggerBuilder();

        logger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp({
                  format: 'YYYY-MM-DD HH:mm:ss'
                }),
                format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`+(info.splat!==undefined?`${info.splat}`:" "))
              ),
            transports: [
                new transports.Console(),
                new (transports.File)({
                    filename: `${logFolder}sleepingServer.log`,
                    maxsize: 2 * 1024 * 1024,
                    maxFiles: 3,
                })]
        });


    } catch (error) {
        logger.error('Failed to initialize logger', error);
        logger = DefaultLogger;
    }
    initialized = true;
    const msg = `... A new story begin v${version} ...`;
    const separator = msg.replace(/./g,'.');
    logger.info(separator);
    logger.info(msg);
    logger.info(separator)
    return logger;
}
