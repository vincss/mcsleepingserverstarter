'use strict';
// var packageSleep = JSON.parse(require('fs').readFileSync('package.json',
// 'utf8'));

var fileSystem = require('fs');
var settings = require('js-yaml').load(
		fileSystem.readFileSync('sleepingSettings.yml'));

var mc = require('minecraft-protocol');
var connect = require('connect');
var serveStatic = require('serve-static');
var childProcess = require('child_process');

var winston = require('winston');
var logFolder = 'logs/'
var dateFormat = require('dateformat');
var logger;

var webServer;
var mcServer;

var startMinecraft = function() {
	logger.info('----------- Starting Minecraft : ' + settings.minecraftCommand
			+ ' ----------- ');

	// settings.minecraftCommand = 'notepad';
	var mcProcess = childProcess.execSync(settings.minecraftCommand, {
		stdio : "inherit"
	});
	logger.info('----------- Minecraft stopped -----------');
};

var getDate = function() {
	return dateFormat(new Date(), 'yyyy-mm-dd hh:MM:ss.l');
};

process.on('uncaughtException', function(err) {
	logger.info('Caught exception: ' + err);
	logger.info('...Exiting..');
	process.exit(1);
});

var initLog = function() {
	if (!fileSystem.existsSync(logFolder)) {
		fileSystem.mkdirSync(logFolder);
	}

	logger = new winston.Logger({
		level : 'info',
		transports : [ new (winston.transports.Console)({
			timestamp : getDate,
			colorize : true
		}), new (winston.transports.File)({
			filename : logFolder + 'sleepinServer.log',
			timestamp : getDate,
			maxsize : 2048,
			maxFiles : 3,
			json : false
		}) ]
	});
};

var init = function() {

	initLog();

	if (settings.webPort > 0) {
		webServer = connect().use(serveStatic(settings.webDir)).listen(
				settings.webPort);
		logger.info("Starting web server on *:" + settings.webPort
				+ " webDir: " + settings.webDir);
	}

	mcServer = mc.createServer({
		'online-mode' : settings.serverOnlineMode, // optional
		encryption : true, // optional
		host : '0.0.0.0', // optional
		motd : settings.serverName,
		port : settings.serverPort, // optional
	});
	logger.info('Waiting for a Prince to come. [' + settings.serverPort
			+ '] Or someone to hit a key.');

	process.stdin.resume();
	process.stdin.on('data', function() {
		closeServer();
	});

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

		logger.info('Prince has come, time to wake up.')

		client.end(settings.loginMessage);
		closeServer();
	});

};
init();

var closeServer = function() {
	logger.info('Cleaning up the place.')
	mcServer.close();
	if (webServer !== undefined)
		webServer.close();

	if (settings.startMinecraft > 0) {
		startMinecraft();

		logger.info('...Time to kill me if you want...')
		setTimeout(function() {
			logger.info('...Too late !...');
			init();
		}, 5000); // restart server
	}
};
