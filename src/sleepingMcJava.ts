import { Client, createServer, Server } from 'minecraft-protocol';
import { ServerStatus } from './sleepingHelper';
import { getLogger, LoggerType } from './sleepingLogger';
import { ISleepingServer } from './sleepingServerInterface';
import { DefaultFavIconString, Settings } from './sleepingSettings';

export class SleepingMcJava implements ISleepingServer {

    server?: Server;

    settings: Settings;
    logger: LoggerType;
    playerConnectionCallBack: () => void;

    constructor(settings: Settings, playerConnectionCallBack: () => void) {
        this.settings = settings;
        this.playerConnectionCallBack = playerConnectionCallBack;
        this.logger = getLogger();
    }

    init = async () => {
        this.server = createServer({
            'online-mode': this.settings.serverOnlineMode,
            motd: this.settings.serverName,
            port: this.settings.serverPort,
            maxPlayers: this.settings.maxPlayers,
            version: this.settings.version,
            beforePing: (reponse) => {
                reponse.favicon = this.settings.favIcon ?? DefaultFavIconString;
            }
            // encryption: false,
            // host: '0.0.0.0',
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

    close = async () => {
        this.logger.info('[McJava] Closing');
        if (this.server) {
            this.server.close();
            this.server = undefined;
            this.logger.info('[McJava] Closed');
        }
    }

    getStatus = () => {
        let status = ServerStatus.Stopped;
        if(this.server) {
            status = ServerStatus.Sleeping;
        }
        return status;
    };
}
