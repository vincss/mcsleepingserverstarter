import { SleepingContainer } from './sleepingContainer';
import { getLogger, LoggerType } from './sleepingLogger';
import { Settings } from './sleepingSettings';

const logger: LoggerType = getLogger();

let sleepingContainer: SleepingContainer;

process.on('SIGINT', async () => {
    logger.info('[Main] SIGINT signal received.');
    await close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('[Main] SIGTERM  signal received.');
    await close();
    process.exit(0);
});

process.on('uncaughtException', (err: Error) => {
    logger.warn(`[Main] Caught uncaughtException: ${JSON.stringify(err.message ?? err)}`);

    if ((err as any).code === 'ECONNRESET') {
        logger.info('[Main] Connection reset client side... Keep on going.');
        return;
    }
    if ((err as any).code === 'EADDRINUSE') {
        logger.info(`[Main] A server is already using the port. Kill it and restart the app.`, err.message ?? err)
    }
    if (err.message !== 'undefined'
        // && err.message.indexOf('handshaking.toServer')
    ) {
        logger.error('[Main] Something bad happened', err.message);
    }

    logger.info('[Main] ...Exiting...');
    process.exit(1);
});

const close = async () => {
    await sleepingContainer.close(true);
    logger.info('[Main] ... To be continued ... ')
}

const main = async () => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    const mainCallBack = (settings: Settings) => {
        if (!settings.preventStop) {
            logger.info(`[Main] Waiting for 'quit' in CLI.`);
            process.stdin.on('data', (text) => {
                if (text.indexOf('quit') > -1) {
                    sleepingContainer.playerConnectionCallBack('A CliUser');
                }
            });
        }
    }

    try {
        sleepingContainer = new SleepingContainer(mainCallBack);
        await sleepingContainer.init(true);
    } catch (error) {
        logger.error('[Main] Something bad happened.', error)
    }
};

main();
