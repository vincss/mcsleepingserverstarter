import axios from 'axios';
import { getLogger, LoggerType } from './sleepingLogger';
import { Settings } from './sleepingSettings';

export class SleepingDiscord {

    logger: LoggerType;
    settings: Settings;

    constructor(settings: Settings) {
        this.settings = settings;
        this.logger = getLogger();
    }

    private sendMessage = async (message: string) => {
        this.logger.info(`[Discord] Sending ${message}`)
        const toSend = { content: message };
        const response = await axios.post(this.settings.discordWebhookUrl!, toSend);
        this.logger.info('[Discord] ', response.statusText);
    }

    onPlayerLogging = async (playerName: string) => {
        const message = `\` ⏰ ${playerName} has woke the server up. ⏰ \``;
        await this.sendMessage(message);

    }

    onServerStop = async () => {
        const message = `\` 💤 Server has shut down. 💤 \``;
        await this.sendMessage(message);
    }
}