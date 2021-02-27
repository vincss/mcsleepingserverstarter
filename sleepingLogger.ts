import { Logger, transports } from 'winston';
import { existsSync, mkdirSync } from 'fs';

const DefaultLogger = {
    info: (...params) => console.info(params),
    error: (...params) => console.error(params),
    warn: (...params) => console.warn(params)
};

let logger = DefaultLogger;
let initialized = false;

const logFolder = 'logs/';

function getDate() {
    return new Date().toISOString();
};

export function getLogger() {
    try {

        if (initialized) {
            return logger;
        }

        if (!existsSync(logFolder)) {
            mkdirSync(logFolder);
        }

        logger = new Logger({
            level: 'info',
            transports: [new (transports.Console)({
                timestamp: getDate,
                colorize: true
            }), new (transports.File)({
                filename: `${logFolder}sleepingServer.log`,
                timestamp: getDate,
                maxsize: 2 * 1024 * 1024,
                maxFiles: 3,
                json: false
            })]
        });
    } catch (error) {
        logger.error('Failed to initialize logger', error);
        logger = DefaultLogger;
    }
    initialized = true;
    logger.info('.........................');
    logger.info('... A new story begin ...');
    return logger;
}
