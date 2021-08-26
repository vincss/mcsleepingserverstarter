import { spawn, execSync } from 'child_process';

import { getLogger, LoggerType } from './sleepingLogger';
import { Settings } from './sleepingSettings';
import { SleepingMcJava } from './sleepingMcJava';
import { SleepingBedrock } from './sleepingBedrock';
import { SleepingWeb } from './sleepingWeb';
import { ISleepingServer } from './sleepingServerInterface';
import { isPortTaken, ServerStatus } from './sleepingHelper';

export class SleepingContainer implements ISleepingServer {

    logger: LoggerType;
    settings: Settings;

    mcServer?: SleepingMcJava;
    brServer?: SleepingBedrock;
    webServer?: SleepingWeb;

    constructor(settings: Settings) {
        this.settings = settings;
        this.logger = getLogger();
    }

    init = async (isThisTheBeginning = false) => {
        if (isThisTheBeginning) {
            if (this.settings.webPort > 0) {
                this.webServer = new SleepingWeb(this.settings, this.playerConnectionCallBack, this);
                await this.webServer.init();
            }
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

    startMinecraft = async (onProcessClosed: () => void) => {
        this.logger.info(`----------- Starting Minecraft : ${this.settings.minecraftCommand} ----------- `);

        if (this.settings.webPort > 0) {
            const cmdArgs = this.settings.minecraftCommand.split(' ');
            const exec = cmdArgs.splice(0, 1)[0];
            const mcProcess = spawn(exec, cmdArgs, {
                stdio: 'inherit',
                cwd: this.settings.minecraftWorkingDirectory
            });

            mcProcess.on('close', code => {
                this.logger.info(`----------- Minecraft stopped ${code} -----------`);
                onProcessClosed();
            });
        } else {
            execSync(this.settings.minecraftCommand, {
                stdio: 'inherit',
                cwd: this.settings.minecraftWorkingDirectory
            });
            this.logger.info('----------- Minecraft stopped -----------');
            onProcessClosed();
        }

    };

    close = async (isThisTheEnd = false) => {
        this.logger.info('Cleaning up the place.');

        if (this.mcServer) {
            await this.mcServer.close();
        }

        if (this.brServer) {
            await this.brServer.close();
        }

        if (isThisTheEnd) {

            if (this.webServer) {
                this.webServer.close();
            }
        }
    }

    playerConnectionCallBack = async () => {
        await this.close();

        if (this.settings.startMinecraft > 0) {


            const onMcClosed = () => {
                this.logger.info('...Time to kill me if you want...');
                setTimeout(async () => {
                    this.logger.info('...Too late !...');
                    await this.init();
                }, 10000); // restart server
            }

            this.startMinecraft(onMcClosed);
        }
    };

    getStatus = async () => {
        let status = ServerStatus.Stopped;
        if (this.mcServer) {
            status = this.mcServer?.getStatus();
        }
        if (status !== ServerStatus.Sleeping) {
            const portTaken = await isPortTaken(this.settings.serverPort)
            if (portTaken) {
                status = ServerStatus.Running;
            } else {
                status = ServerStatus.Starting;
            }
        }
        return status;
    }

}