import { writeFileSync, readFileSync } from 'fs';
import { dump, load } from 'js-yaml';
import { getLogger } from './sleepingLogger';

const logger = getLogger();

const SettingFilePath = 'sleepingSettings.yml';

export type Settings = {
    serverName: string,
    serverPort: number,
    bedrockPort?: number,
    maxPlayers: number,
    loginMessage: string,
    serverOnlineMode: boolean,
    webPort: number,
    webStopOnStart: boolean,
    webServeDynmap?: boolean | string,
    webSubPath?: string,
    startMinecraft: boolean,
    minecraftCommand: string,
    preventStop?: boolean,
    version?: string | false,
    favIcon?: string,
    favIconPath?: string,
    minecraftWorkingDirectory?: string,
    discordWebhookUrl?: string,
    blackListedAddress?: string[],
    whiteListedNames?: string[],
    hideIpInLogs?: boolean,
};

export const DefaultSettings: Settings = {
    serverName: 'SleepingServer, waiting for his prince...',
    serverPort: 25565,

    maxPlayers: 20,

    loginMessage: '...Waking server up, come back in a minute...',
    serverOnlineMode: true,

    webPort: 0,	 				// 0 to disable web hosting
    webStopOnStart: false,

    startMinecraft: true,				// false to disable
    minecraftCommand: 'java -jar paper.jar nogui',
    version: false,
};

function saveDefault() {
    try {
        const yamlToWrite = dump(DefaultSettings);
        writeFileSync(SettingFilePath, yamlToWrite)
    } catch (error: any) {
        logger.error('Failed to write setting.', error?.message);
    }
}

export function getSettings(): Settings {
    let settings = { ...DefaultSettings };
    try {
        const read = readFileSync(SettingFilePath).toString();
        const settingsFromFiles = load(read) as Settings;
        settings = { ...DefaultSettings, ...settingsFromFiles };
    } catch (error: any) {
        logger.error('Failed to load setting, using default.', error);

        try {
            const pathBackup = `${SettingFilePath}.${new Date().toISOString().replace(/:/g,'')}.bak`;
            logger.info(`Backing up your old config to : ${pathBackup}`);
            const read = readFileSync(SettingFilePath).toString();
            writeFileSync(pathBackup, read);
        } catch (error) {
            logger.error('Backup setting', error);
        }

        saveDefault();
    }
    logger.info(
        `Retrieved settings:${JSON.stringify({
            ...settings,
            favIcon: settings.favIcon
                ? `${settings.favIcon?.substring(0, 38)}...`
                : undefined,
        })}`
    );
    return settings;
}
