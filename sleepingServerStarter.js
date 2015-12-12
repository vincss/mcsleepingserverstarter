'use strict';

var settings = require("js-yaml").load(
		require("fs").readFileSync("sleepingSettings.yml"));

var mc = require('minecraft-protocol');
var connect = require('connect');
var serveStatic = require('serve-static');
var childProcess = require('child_process');

var webServer;
var mcServer;

var init = function() {
	if (settings.webPort > 0)
		webServer = connect().use(serveStatic(settings.webDir)).listen(
				settings.webPort);

	mcServer = mc.createServer({
		'online-mode' : true, // optional
		encryption : true, // optional
		host : '0.0.0.0', // optional
		motd : settings.serverName,
		port : settings.serverPort, // optional
	});
	console.log('Waiting for a Prince to come.')

};
init();

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

var closeServer = function() {
	console.log('Cleaning up the place.')
	mcServer.close();
	webServer.close();

	if (settings.startMinecraft > 0) {
		console.log('Starting Minecraft : ' + settings.minecraftCommand)
		childProcess.execSync(settings.minecraftCommand);
	}
};
