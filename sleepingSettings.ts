import { writeFileSync, readFileSync } from 'fs';
import { dump, load } from 'js-yaml';
import { getLogger } from './sleepingLogger';

const logger = getLogger();

const SettingFilePath = 'sleepingSettings.yml';

export type Settings = {
    serverName: string,
    serverPort: number,
    bedrockPort: number,
    loginMessage: string,
    serverOnlineMode: boolean,
    webPort: number,
    webDir: string,
    startMinecraft: number,
    minecraftCommand: string,
    // version: string
};

const DefaultSettings: Settings = {
    serverName: 'SleepingServer, waiting for his prince...',
    serverPort: 25565,
    bedrockPort: 19132,
    loginMessage: '...Waking server up, come back in a minute...',
    serverOnlineMode: true,

    webPort: 0,	 				// 0 to disable web hosting, 8123default dynmap
    webDir: 'plugins/dynmap/web', 	// dir of dynmap web

    startMinecraft: 1,				// 0 to disable
    minecraftCommand: 'java -jar spigot.jar nogui',
    // version: '1.16.4'
};

function saveDefault() {
    try {
        const yamlToWrite = dump(DefaultSettings);
        writeFileSync(SettingFilePath, yamlToWrite)
    } catch (error) {
        logger.error('Failed to write setting.', error.message);
    }
}

export function getSettings(): Settings {
    let settings = { ...DefaultSettings };
    try {
        const read = readFileSync(SettingFilePath).toString();
        const settingsFromFiles = load(read) as Settings;
        settings = { ...DefaultSettings, ...settingsFromFiles };
    } catch (error) {
        logger.error('Failed to load setting, using default.', error.message);
        saveDefault();
    }
    logger.info('.........................');
    logger.info(`Retrieved settings:${JSON.stringify(settings)}`);
    return settings;
}
