const dateFormat = require('dateformat');
const winston = require('winston');
const fileSystem = require('fs');

let logger = {
    info: (...params) => console.log(params),
    error: (...params) => console.error(params)
};

const logFolder = 'logs/';

const getDate = function () {
    return dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l');
};

function getLogger() {
    try {
        if (!fileSystem.existsSync(logFolder)) {
            fileSystem.mkdirSync(logFolder);
        }

        return new winston.Logger({
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
    }
    return logger;
}

module.exports = { getLogger };