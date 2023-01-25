import { Client, createServer, Server } from 'minecraft-protocol';
import { ServerStatus } from './sleepingHelper';
import { getLogger, LoggerType } from './sleepingLogger';
import { ISleepingServer } from './sleepingServerInterface';
import { DefaultFavIconString, Settings } from './sleepingSettings';
import { PlayerConnectionCallBackType } from './sleepingTypes';

export class SleepingMcJava implements ISleepingServer {

    server?: Server;

    settings: Settings;
    logger: LoggerType;
    playerConnectionCallBack: PlayerConnectionCallBackType;

    isClosing = false;

    constructor(settings: Settings, playerConnectionCallBack: PlayerConnectionCallBackType) {
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
            },
            validateChannelProtocol: true,
            errorHandler: (client, error) => console.warn('SleepingMcJava.errorHandler: ', client, error),
            enforceSecureProfile: this.settings.serverOnlineMode
            // encryption: false,
            // host: '0.0.0.0',
        });

        this.logger.info(`[McJava] Waiting for a Prince to come. [${this.settings.serverPort}] Or someone to type quit.`);

        this.server.on('connection', (client: Client) => {
            this.logger.info(`A Prince has taken a quick peek. [${client.version}_${client.socket.remoteAddress}]`);
        });

        this.server.on('listening', () => {
            this.logger.info('[McJava] Ready for battle');
        });

        this.server.on('login', (client) => {

            const userName = client.username;

            if (this.settings.blackListedAddress?.some(address => client.socket.remoteAddress?.includes(address))) {
                this.logger.info(`${userName}.${client.state}:[${client.socket.remoteAddress}], rejected: blacklisted`);
                client.end('Connection rejected : blacklisted.');
                return;
            }

            if (this.isClosing) {
                this.logger.info(`Prince ${userName}.${client.state}, someone came before you...`);
                client.on('end', (client) => {
                    this.logger.info(`${userName} is gone.`, client);
                });
                client.end(this.settings.loginMessage);
                return;
            }
            this.isClosing = true;

            this.logger.info(`Prince [${userName}.${client.state}_${client.socket.remoteAddress}] has come, time to wake up.`);

            client.on('end', (client) => {
                this.logger.info(`[${userName}] The prince is gone, for now`, client);
                this.playerConnectionCallBack(userName);
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
        if (this.server) {
            status = ServerStatus.Sleeping;
        }
        return status;
    };
}
