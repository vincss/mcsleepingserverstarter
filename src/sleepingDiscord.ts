import { Client, Intents } from 'discord.js';
import { getLogger, LoggerType } from './sleepingLogger';
import { ISleepingServer } from './sleepingServerInterface';
import { Settings } from './sleepingSettings';

const AuthToken = 'OTA1NDMzMDY1NDY2MjUzMzIz.YYKAQA.-w0buY_hGW0qWwWRuwas2rfDmbE';
const AuthLink = 'https://discord.com/api/oauth2/authorize?client_id=905433065466253323&permissions=2048&scope=bot'

export class SleepingDiscord implements ISleepingServer {

    logger: LoggerType;
    settings: Settings;
    client: Client;

    constructor(settings: Settings) {
        this.settings = settings;
        this.logger = getLogger();

        this.client = new Client({ intents: [Intents.FLAGS.DIRECT_MESSAGES] });
    }

    async init() {

        this.client.on('ready', () => {
            this.logger.info(`[Discord] Logged in as ${this.client.user?.tag}!`)
        });

        this.logger.info(`[Discord] Logging...`)

        this.client.login(AuthToken);
    }

    async close() {
        this.logger.info('[Discord] Closing...');
        this.client.destroy();
    };

    onLogging = async (playerName: string) => {
        const channel = await this.client.channels.fetch(this.settings.discordChannelId!);
        if (channel) {
            await (channel as any).send(`\` 💤 ${playerName} has woke the server up ! ⏰ \``);
        }
    }
}