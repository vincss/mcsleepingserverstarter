import { Config, Logger } from '@jsprismarine/prismarine';
import { EventManager } from '@jsprismarine/prismarine/dist/events/EventManager';
import { RaknetConnectEvent, RaknetEncapsulatedPacketEvent } from '@jsprismarine/prismarine/dist/events/Events';
import PlayerManager from '@jsprismarine/prismarine/dist/player/PlayerManager';
import LoggerBuilder from '@jsprismarine/prismarine/dist/utils/Logger';
import { Listener, Connection, InetAddress, Protocol } from '@jsprismarine/raknet';
import Identifiers from '@jsprismarine/raknet/dist/protocol/Identifiers';
import { Settings } from './sleepingSettings';


const Address = '0.0.0.0';
const Version = '1.16.201';

export class SleepingBedrock {

    port: number;
    logger: Logger;
    listener?: Listener;
    listenerBuilder: Listener;
    playerManager: PlayerManager;
    private readonly eventManager = new EventManager();
    playerConnectionCallBack: () => void;

    constructor(settings: Settings, playerConnectionCallBack: () => void) {
        this.port = settings.bedrockPort;
        this.playerConnectionCallBack = playerConnectionCallBack;

        this.logger = new LoggerBuilder();
        const config = new Config(Version);
        const server = {
            getConfig() { return config },
            getIdentifiers() { return Identifiers },
            getLogger: () => { return this.logger; },
            getPlayerManager: () => { return this.playerManager }
        };
        this.playerManager = new PlayerManager(server as any);
        this.listenerBuilder = new Listener(server)
    }

    async init() {
        this.logger.info(`BedRock listening on ${Address}:${this.port}`);

        this.listener = await this.listenerBuilder.listen(Address, this.port);
        this.listener.on('openConnection', this.handleOpenConnection);
        this.listener.on('closeConnection', async (inetAddr: InetAddress, reason: string) => { this.logger.info(`closeConnection ${JSON.stringify(inetAddr)} ${reason}`) });
        this.listener.on('encapsulated', this.handleEncapsulated);
        // this.listener.on('raw', async (buffer: Buffer, inetAddr: InetAddress) => { this.logger.info(`raw ${JSON.stringify(inetAddr)} ${JSON.stringify(buffer)}`) });

        this.eventManager.on('raknetConnect', this.handleRaknetConnect);

        this.logger.info(`BedRock DONE`);
    }


    handleOpenConnection = async (connection: Connection) => {
        this.logger.info(`openConnection ${JSON.stringify(connection.getState())}`)
        const event = new RaknetConnectEvent(connection);
        await this.eventManager.emit('raknetConnect', event);
    };

    handleRaknetConnect = async (raknetConnectEvent: RaknetConnectEvent) => {
        this.logger.info(`raknetConnect ${raknetConnectEvent}`);
        const connection = raknetConnectEvent.getConnection();
        connection.disconnect('Starting MC Server');
        this.playerConnectionCallBack();
        connection.close();
    }

    handleEncapsulated = async (packet: Protocol.EncapsulatedPacket, inetAddr: InetAddress) => {
        this.logger.info(`encapsulated ${JSON.stringify(inetAddr)}`)
        const event = new RaknetEncapsulatedPacketEvent(inetAddr, packet);
        await this.eventManager.emit('raknetEncapsulatedPacket', event);
    }

    async close() {
        this.logger.info(`BedRock close ${this.listener}`);
        if (this.listener) {
            await this.listener.kill();
            this.logger.info(`BedRock Killed ${this.listener}`);
        }
    }

}