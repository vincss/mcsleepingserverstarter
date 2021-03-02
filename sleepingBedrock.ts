import { Server, Config, Logger } from '@jsprismarine/prismarine';
import LoggerBuilder from '@jsprismarine/prismarine/dist/utils/Logger';
import { Listener, Connection, InetAddress, Protocol } from '@jsprismarine/raknet';
import Identifiers from '@jsprismarine/raknet/dist/protocol/Identifiers';
import { doesNotMatch } from 'assert';
import { getLogger } from './sleepingLogger';
// import {createSocket} from 'dgram';


const Address = '192.168.0.99';
// const Address = '0.0.0.0';
const Version = '1.16.201';
const DEF_MTU_SIZE = 1455;

export class SleepingBedrock {

    port: number;
    logger: Logger;
    // server : Server = null;
    listener?: Listener;
    listenerBuilder: Listener;
    // connection: Connection;


    constructor(port: number) {
        // this.server = new Server()
        this.port = port;
        const logger = new LoggerBuilder();
        this.logger = logger;
        const config = new Config(Version);
        const server = {
            // getConfig() { return { getMotd() { return 'sleepingBedrock' } } },
            getConfig() { return config },
            getIdentifiers() { return Identifiers },
            getLogger() { return logger; }
        };
        this.listenerBuilder = new Listener(server)

        // this.listener.addListener(this);
        // this.connection = new Connection()
        /*         logger.info('sleepingBedrock');
                const inetAddress = new InetAddress(Address, port);
                this.connection = new Connection(this.listener, DEF_MTU_SIZE, inetAddress); */

    }

    async init() {
        this.logger.info(`BedRock listening on ${Address}:${this.port}`);
        this.listener = await this.listenerBuilder.listen(Address, this.port);
        this.listener.on('openConnection', async (connection: Connection) => { this.logger.info(`openConnection ${JSON.stringify(connection)}`) });
        this.listener.on('closeConnection', async (inetAddr: InetAddress, reason: string) => { this.logger.info(`closeConnection ${inetAddr} ${JSON.stringify(reason)}`) });
        this.listener.on('encapsulated', async (packet: Protocol.EncapsulatedPacket, inetAddr: InetAddress) => { this.logger.info(`encapsulated ${inetAddr} ${JSON.stringify(packet)}`) });
        this.listener.on('raw', async (buffer: Buffer, inetAddr: InetAddress) => { this.logger.info(`raw ${JSON.stringify(inetAddr)} ${JSON.stringify(buffer)}`) });
        this.logger.info(`BedRock DONE`);
    }

    async close() {
        this.logger.info(`BedRock close ${this.listener}`);
        if(this.listener) {
            await this.listener.kill();
            this.logger.info(`BedRock Killed ${this.listener}`);
        }
        /*         if (this.server) {
                    // this.server.close();
                } */
    }

}