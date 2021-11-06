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

    private sendMessage = async (content: any, woke: boolean) => {
        if (woke)
            this.logger.info(`[Discord] Sending waking up message`);
        else
            this.logger.info(`[Discord] Sending closing server message`);

        const response = await axios.post(this.settings.discordWebhookUrl!, content, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        this.logger.info('[Discord] ', response.statusText);
    }

    onPlayerLogging = async (playerName: string) => {
        const content = `{
            "content": null,
            "embeds": [
              {
                "title": "⏰ ${playerName} woke up the server !",
                "color": 25344
              }
            ],
            "username": "SleepingServerStarter",
            "avatar_url": "https://raw.githubusercontent.com/vincss/mcsleepingserverstarter/feature/discord_notification/docs/sleepingLogo.png"
        }`;
        await this.sendMessage(content, true);

    }

    onServerStop = async () => {
        const content = `{
            "content": null,
            "embeds": [
              {
                "title": "💤 Server has shut down.",
                "color": 25344
              }
            ],
            "username": "SleepingServerStarter",
            "avatar_url": "https://raw.githubusercontent.com/vincss/mcsleepingserverstarter/feature/discord_notification/docs/sleepingLogo.png"
        }`;
        await this.sendMessage(content, false);
    }
}