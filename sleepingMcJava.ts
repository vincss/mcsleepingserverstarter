import { Logger } from '@jsprismarine/prismarine';

import { Client, createServer, Server } from 'minecraft-protocol';
import { faviconString } from './sleepingContainer';
import { getLogger } from './sleepingLogger';
import { Settings } from './sleepingSettings';

export class SleepingMcJava {

    server?: Server;

    settings: Settings;
    logger: Logger;
    playerConnectionCallBack: () => void;

    constructor(settings: Settings, playerConnectionCallBack: () => void) {
        this.settings = settings;
        this.playerConnectionCallBack = playerConnectionCallBack;
        this.logger = getLogger() as Logger;
    }

    init() {
        this.server = createServer({
            'online-mode': this.settings.serverOnlineMode,
            // encryption: false,
            // host: '0.0.0.0',
            motd: this.settings.serverName,
            port: this.settings.serverPort,
            // version: settings.version,
            beforePing: (reponse) => {
                reponse.favicon = faviconString;
            }
        });

        this.logger.info(`[McJava] Waiting for a Prince to come. [${this.settings.serverPort}] Or someone to type quit.`);

        this.server.on('connection', (client: Client) => {
            // @ts-ignore FixMe ToDo not exported in TS
            this.logger.info(`A Prince has taken a quick peek. [${client.protocolState}_${client.version}]`);
            // logger.info(`A Prince has taken a quick peek. [${client.state}_${client.protocolVersion}]`);
        });

        // @ts-ignore FixMe ToDo not exported in TS
        this.server.on('listening', () => {
            this.logger.info('[McJava] Ready for battle');
        });

        this.server.on('login', (client) => {

            this.logger.info(`Prince [${client.username}.${client.state}] has come, time to wake up.`);

            client.on('end', (client) => {
                this.logger.info('The prince is gone, for now', client);
                this.playerConnectionCallBack();
            });
            this.logger.info(`Sending best regards ${this.settings.loginMessage}`);
            client.end(this.settings.loginMessage);

        });

        this.server.on('error', (error) => {
            this.logger.error(`Something went wrong in wonderland ${error.message}`);
        });
    }

    close = () => {
        this.logger.info('[McJava] Closing');
        if (this.server) {
            this.server.close();
            this.logger.info('[McJava] Closed');
        }
    }
}