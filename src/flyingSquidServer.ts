import {ISleepingServer} from "./sleepingServerInterface";
import {getLogger, LoggerType} from "./sleepingLogger";
import {Settings} from "./sleepingSettings";
import {createMCServer, InputOptions} from "@zardoy/flying-squid";

export class FlyingSquidServer implements ISleepingServer {
    logger: LoggerType;
    settings: Settings;

    constructor(
        settings: Settings
    ) {
        this.logger = getLogger();
        this.settings = settings;
    }

    async close() {
    }

    async init() {
        this.logger.info('Initializing SquidServer...');

        const options: InputOptions = {"online-mode": true, port: this.settings.serverPort, version: "1.21.8"};
        const server = createMCServer(options);

        server.on("newPlayer", async (player: Player) => {
            this.logger.info('New player', player);
        })

        server.on("listening", async (port) => {
            this.logger.info('listening', port);
        })
    }
}