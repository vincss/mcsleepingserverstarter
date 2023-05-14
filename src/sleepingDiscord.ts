import { getLogger, LoggerType } from "./sleepingLogger";
import { Settings } from "./sleepingSettings";

type DiscordContent = {
  content: null;
  embeds: {
    title: string;
    color: number;
  }[];
  username: string;
  avatar_url: string;
};

export class SleepingDiscord {
  logger: LoggerType;
  settings: Settings;

  constructor(settings: Settings) {
    this.settings = settings;
    this.logger = getLogger();
  }

  private sendMessage = async (content: DiscordContent, woke: boolean) => {
    if (woke) {
      this.logger.info(`[Discord] Sending waking up message`);
    } else {
      this.logger.info(`[Discord] Sending closing server message`);
    }

    if (this.settings.discordWebhookUrl) {
      const response = await fetch(this.settings.discordWebhookUrl, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(content),
      });

      this.logger.info("[Discord] response: ", await response.text());
    }
  };

  onPlayerLogging = async (playerName: string) => {
    const content = {
      content: null,
      embeds: [
        {
          title: `⏰ ${playerName} woke up the server !`,
          color: 25344,
        },
      ],
      username: "SleepingServerStarter",
      avatar_url:
        "https://raw.githubusercontent.com/vincss/mcsleepingserverstarter/feature/discord_notification/docs/sleepingLogo.png",
    };
    await this.sendMessage(content, true);
  };

  onServerStop = async () => {
    const content = {
      content: null,
      embeds: [
        {
          title: "💤 Server has shut down.",
          color: 25344,
        },
      ],
      username: "SleepingServerStarter",
      avatar_url:
        "https://raw.githubusercontent.com/vincss/mcsleepingserverstarter/feature/discord_notification/docs/sleepingLogo.png",
    };
    await this.sendMessage(content, false);
  };
}
