import { SleepingContainer } from './sleepingContainer';
import { getLogger, LoggerType } from './sleepingLogger';

const logger: LoggerType = getLogger();

let sleepingContainer: SleepingContainer;

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received.');
    await close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('SIGTERM  signal received.');
    await close();
    process.exit(0);
});

process.on('uncaughtException', (err: Error) => {
    logger.warn(`Caught uncaughtException: ${JSON.stringify(err.message ?? err)}`);

    if ((err as any).code === 'ECONNRESET') {
        logger.info('Connection reset client side... Keep on going.');
        return;
    }
    if ((err as any).code === 'EADDRINUSE') {
        logger.info(`A server is already using the port. Kill it and restart the app.`, err.message ?? err)
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
    await sleepingContainer.close(true);
    logger.info('... To be continued ... ')
}

const main = async () => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    try {
        sleepingContainer = new SleepingContainer();
        await sleepingContainer.init(true);
    } catch (error) {
        logger.error('Something bad happened.', error)
    }

    process.stdin.on('data', (text) => {
        if (text.indexOf('quit') > -1) {
            sleepingContainer.playerConnectionCallBack('A CliUser');
        }
    });
};

main();
