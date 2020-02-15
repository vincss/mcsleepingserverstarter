const fileSystem = require('fs');

let settings = {
    serverName: 'SleepingServer, waiting for his prince...',
    serverPort: 25565,
    loginMessage: '...Waking server up, come back in a minute...',
    serverOnlineMode: true,

    webPort: 0,	 				// 0 to disable web hosting, 8123default dynmap
    webDir: 'plugins/dynmap/web', 	// dir of dynmap web

    startMinecraft: 1,				// 0 to disable
    minecraftCommand: 'java -jar spigot.jar nogui'
};

try {
    const settingsFromFiles = require('js-yaml').load(
        fileSystem.readFileSync('sleepingSettings.yml'));
    settings = {...settings, ...settingsFromFiles}
} catch (error) {
    console.log('Failed to load setting, using default.', error.message)
}

console.log('Retrieved settings', settings);

module.exports = settings;