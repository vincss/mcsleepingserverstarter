import { createConnection } from 'net';
import { autoToHtml, cleanTags } from '@sfirew/minecraft-motd-parser'
import ChatMessage from 'prismarine-chat';
import { Settings } from './sleepingSettings';
import { LATEST_MINECRAFT_VERSION } from './version';

export const isInDev = () => {
    if (process.env.NODE_ENV === 'development') {
        return true;
    }
    return false;
}

export const isPortTaken = (port: number) => new Promise<boolean>((resolve) => {

    const client = createConnection({ port }, () => {
        client.end();
        resolve(true);
    }).once("error", () => {
        resolve(false);
    });

});

export const getMOTD = (settings: Settings, outputType: 'json' | 'html' | 'plain'): string | object => {
    if (outputType === 'plain') {
        return cleanTags(settings.serverName);
    }

    if (outputType === 'html') {
        // This automatically escapes any tags in the serverName to prevent XSS
        return autoToHtml(settings.serverName);
    }

    return ChatMessage(settings.version || LATEST_MINECRAFT_VERSION)
        .MessageBuilder
        .fromString(settings.serverName, { colorSeparator: '§' })
        .toJSON();
}

export enum ServerStatus {
    Sleeping = 'Sleeping',
    Running = 'Running',
    Starting = 'Starting',
    Stopped = 'Stopped'
}