'use strict';
// var packageSleep = JSON.parse(require('fs').readFileSync('package.json',
// 'utf8'));

var settings = require('js-yaml').load(
		require('fs').readFileSync('sleepingSettings.yml'));

var mc = require('minecraft-protocol');
var connect = require('connect');
var serveStatic = require('serve-static');
var childProcess = require('child_process');

var webServer;
var mcServer;

var startMinecraft = function() {
	console.log('----------- Starting Minecraft : ' + settings.minecraftCommand
			+ ' ----------- ');

	//settings.minecraftCommand = 'notepad';
	var mcProcess = childProcess.execSync(settings.minecraftCommand, {
		stdio : "inherit"
	});
	console.log('----------- Minecraft stopped -----------');
};

var init = function() {
	if (settings.webPort > 0) {
		webServer = connect().use(serveStatic(settings.webDir)).listen(
				settings.webPort);
		console.log("Starting web server on *:" + settings.webPort
				+ " webDir: " + settings.webDir);
	}

	mcServer = mc.createServer({
		'online-mode' : settings.serverOnlineMode, // optional
		encryption : true, // optional
		host : '0.0.0.0', // optional
		motd : settings.serverName,
		port : settings.serverPort, // optional
	});
	console.log('Waiting for a Prince to come. [' + settings.serverPort + ']');

	mcServer.on('login', function(client) {
		client.write('login', {
			entityId : client.id,
			levelType : 'default',
			gameMode : 0,
			dimension : 0,
			difficulty : 2,
			maxPlayers : mcServer.maxPlayers,
			reducedDebugInfo : false
		});

		console.log('Prince as come, time to wake up.')

		client.end(settings.loginMessage);
		closeServer();
	});

};
init();

var closeServer = function() {
	console.log('Cleaning up the place.')
	mcServer.close();
	webServer.close();

	if (settings.startMinecraft > 0) {
		startMinecraft();

		console.log('...Time to kill me if you want...')
		setTimeout(function() {
			console.log('...Too late !...');
			init();
		}, 5000); // restart server
	}
};
