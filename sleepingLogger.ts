import { existsSync, mkdirSync } from 'fs';
import LoggerBuilder from '@jsprismarine/prismarine/dist/utils/Logger';

const DefaultLogger = {
    info: (...params: any) => console.info(params),
    error: (...params: any) => console.error(params),
    warn: (...params: any) => console.warn(params)
};

let logger = DefaultLogger;
let initialized = false;

const logFolder = 'logs/';

export function getLogger() {
    try {

        if (initialized) {
            return logger;
        }

        if (!existsSync(logFolder)) {
            mkdirSync(logFolder);
        }
        logger = new LoggerBuilder();
        /* 
                logger = createLogger({
                    level: 'info',
                    format: format.simple(),
                    transports: [
                        new (transports.Console)({
                            // timestamp: getDate,
                            // colorize: true                    
                        }),
                        new (transports.File)({
                            filename: `${logFolder}sleepingServer.log`,
                            // timestamp: getDate,
                            maxsize: 2 * 1024 * 1024,
                            maxFiles: 3,
                            // json: false                
                        })]
                }); */
    } catch (error) {
        logger.error('Failed to initialize logger', error);
        logger = DefaultLogger;
    }
    initialized = true;
    logger.info('.........................');
    logger.info('... A new story begin ...');
    return logger;
}
