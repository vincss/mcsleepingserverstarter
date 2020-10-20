const fileSystem = require('fs');
const logger = require('./sleepingLogger').getLogger();

const SettingFilePath = 'sleepingSettings.yml';

const DefaultSettings = {
    serverName: 'SleepingServer, waiting for his prince...',
    serverPort: 25565,
    loginMessage: '...Waking server up, come back in a minute...',
    serverOnlineMode: true,

    webPort: 0,	 				// 0 to disable web hosting, 8123default dynmap
    webDir: 'plugins/dynmap/web', 	// dir of dynmap web

    startMinecraft: 1,				// 0 to disable
    minecraftCommand: 'java -jar spigot.jar nogui',
    version: '1.16.3'
};

function saveDefault() {
    try {
        const yamlToWrite = require('js-yaml').safeDump(DefaultSettings);
        fileSystem.writeFileSync(SettingFilePath, yamlToWrite)
    } catch (error) {
        logger.error('Failed to write setting.', error.message);
    }
}

function getSettings() {
    let settings = {...DefaultSettings};
    try {
        const settingsFromFiles = require('js-yaml').safeLoad(
            fileSystem.readFileSync(SettingFilePath));
        settings = { ...DefaultSettings, ...settingsFromFiles }
    } catch (error) {
        logger.error('Failed to load setting, using default.', error.message);
        saveDefault();
    }
    logger.info('.........................');
    logger.info('Retrieved settings:', settings);
    return settings;
}

module.exports = { getSettings };