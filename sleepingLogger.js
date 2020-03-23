const dateFormat = require('dateformat');
const winston = require('winston');
const fileSystem = require('fs');

const DefaultLogger = {
    info: (...params) => console.info(params),
    error: (...params) => console.error(params)
};

let logger = DefaultLogger;
let initialized = false;

const logFolder = 'logs/';

function getDate() {
    return dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l');
};

function getLogger() {
    try {

        if(initialized) {
            return logger;
        }

        if (!fileSystem.existsSync(logFolder)) {
            fileSystem.mkdirSync(logFolder);
        }

        logger = new winston.Logger({
            level: 'info',
            transports: [new (winston.transports.Console)({
                timestamp: getDate,
                colorize: true
            }), new (winston.transports.File)({
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

module.exports = { getLogger };