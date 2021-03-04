import connect from 'connect';
import serveStatic from 'serve-static';
import { execSync } from 'child_process';
import * as http from 'http';

import { getLogger, LoggerType } from './sleepingLogger';
import { Settings } from './sleepingSettings';
import { SleepingMcJava } from './sleepingMcJava';
import { SleepingBedrock } from './sleepingBedrock';

export class SleepingContainer {

    logger: LoggerType;
    settings: Settings;

    mcServer?: SleepingMcJava;
    brServer?: SleepingBedrock;
    webServer?: http.Server;

    constructor(settings: Settings) {
        this.settings = settings;
        this.logger = getLogger();
    }

    init = async () => {
        if (this.settings.webPort > 0) {
            this.webServer = connect().use(serveStatic(this.settings.webDir)).listen(
                this.settings.webPort);
            this.logger.info(`Starting web server on *:${this.settings.webPort} webDir: ${this.settings.webDir}`);
        }

        if (this.settings.serverPort > 0) {
            this.mcServer = new SleepingMcJava(this.settings, this.playerConnectionCallBack);
            await this.mcServer.init();
        }

        if (this.settings.bedrockPort > 0) {
            this.brServer = new SleepingBedrock(this.settings, this.playerConnectionCallBack);
            await this.brServer.init();
        }
    }

    startMinecraft = () => {
        // this.settings.minecraftCommand = 'notepad';
        this.logger.info(`----------- Starting Minecraft : ${this.settings.minecraftCommand} ----------- `);
        execSync(this.settings.minecraftCommand, {
            stdio: 'inherit'
        });

        this.logger.info('----------- Minecraft stopped -----------');
    };

    close = async () => {
        this.logger.info('Cleaning up the place.');

        if (this.mcServer) {
            await this.mcServer.close();
        }

        if (this.brServer) {
            await this.brServer.close();
        }

        if (this.webServer) {
            this.webServer.close();
        }
    }

    playerConnectionCallBack = async () => {
        await this.close();

        if (this.settings.startMinecraft > 0) {
            this.startMinecraft();

            this.logger.info('...Time to kill me if you want...');
            setTimeout(async () => {
                this.logger.info('...Too late !...');
                await this.init();
            }, 5000); // restart server
        }
    };

}