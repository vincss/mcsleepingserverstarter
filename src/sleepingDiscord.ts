import { LoggerType, getLogger } from "./sleepingLogger";
import { MessagesType, Settings } from "./sleepingSettings";
import { WebhookClient, EmbedBuilder, Colors } from "discord.js";

export class SleepingDiscord {
    logger: LoggerType;
    settings: Settings;
    messages: MessagesType;

    constructor(settings: Settings, messages: MessagesType) {
        this.settings = settings;
        this.messages = messages;
        this.logger = getLogger();
    }

    private sendMessage = (embed: EmbedBuilder, wakingUp: boolean) => {
        if (!this.settings.discordWebhookUrl) return
        // Same as 
        // if (woke) {
        //     this.logger.info(`[Discord] Sending waking up message`);
        //   } else {
        //     this.logger.info(`[Discord] Sending closing server message`);
        //   }

        this.logger.info(`[Discord] Sending ${wakingUp ? 'waking up' : 'closing server'} message`)
        // Send message as user-created webhook using discord.js' WebhookClient Class
        new WebhookClient({ url: this.settings.discordWebhookUrl })
            .send({ embeds: [embed] })
    }

    onPlayerLogin = (playerName: string) => {
        const embed = new EmbedBuilder()
            .setTitle(this.messages.onPlayerLogin.replace(`{PlayerName}`, playerName))
            .setColor(Colors.Green)

        this.sendMessage(embed, true)
    }

    onServerStop = () => {
        const embed = new EmbedBuilder()
            .setTitle(this.messages.onServerStop)
            .setColor(Colors.Red)

        this.sendMessage(embed, false)
    }
}