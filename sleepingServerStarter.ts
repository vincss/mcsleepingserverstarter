import { SleepingContainer } from './sleepingContainer';
import { getLogger, LoggerType } from './sleepingLogger';
import { getSettings } from './sleepingSettings';

const logger: LoggerType = getLogger();
const settings = getSettings();

let sleepingContainer: SleepingContainer;

process.on('SIGINT', async() => {
    logger.info('SIGINT signal received.');
    await close();
    process.exit(0);
});

process.on('SIGTERM', async() => {
    logger.info('SIGTERM  signal received.');
    await close();
    process.exit(0);
});

process.on('uncaughtException', function (err: any) {
    logger.warn(`Caught uncaughtException: ${JSON.stringify(err)}`);

    if (err.code === 'ECONNRESET') {
        logger.info('Connection reset client side... Keep on going.');
        return;
    }
    if (err.code === 'EADDRINUSE') {
        logger.info(`A server is already using the port ${settings.serverPort}. Kill it and restart the app.`)
    }
    if (err.message !== 'undefined'
        // && err.message.indexOf('handshaking.toServer')
    ) {
        logger.error('Something bad happened', err.message);
    }

    logger.info('...Exiting...');
    process.exit(1);
});

const close = async () => {
    await sleepingContainer.close();
    logger.info('... To be continued ... ')
}

const main = async () => {

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    sleepingContainer = new SleepingContainer(settings);
    sleepingContainer.init();

    process.stdin.on('data', (text) => {
        if (text.indexOf('quit') > -1) {
            sleepingContainer.playerConnectionCallBack();
        }
    });
};

main();
