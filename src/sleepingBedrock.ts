import { ISleepingServer } from "./sleepingServerInterface";
import { Player, PlayerConnectionCallBackType } from "./sleepingTypes";
import { Settings } from "./sleepingSettings";
import { Config, Server } from "@jsprismarine/prismarine";
import { Logger as PrismarineLogger } from "@jsprismarine/logger";
import { getLogger, LoggerType, getTransports } from "./sleepingLogger";

export class SleepingBedrock implements ISleepingServer {
  private settings: Settings;
  private playerConnectionCallBack: PlayerConnectionCallBackType;
  private logger: LoggerType;
  private server: Server;
  prismarineLogger: PrismarineLogger;

  constructor(
    settings: Settings,
    playerConnectionCallBack: PlayerConnectionCallBackType
  ) {
    this.logger = getLogger();
    this.settings = settings;
    this.playerConnectionCallBack = playerConnectionCallBack;

    const config = new Config();
    
    this.prismarineLogger = new PrismarineLogger("info");

    (this.prismarineLogger as any).disable = async () => {}; // do not close the logger
    (this.prismarineLogger as any).logger = this.logger;

    this.server = new Server({ config, logger: this.prismarineLogger, headless: true });
    this.server.on("playerConnect", (evt) => {
      console.log("DEBUG SleepingBedrock.playerConnect : (): ", evt);
    });
    this.server.on("raknetConnect", (evt) => {
      console.log("DEBUG SleepingBedrock.raknetConnect : evt(): ", evt);
      evt.getRakNetSession().disconnect(this.settings.loginMessage);
      evt.getRakNetSession().close();
      this.playerConnectionCallBack(Player.bedrock());
    });
    this.server.on("playerDisconnect", (evt) => {
      console.log("DEBUG SleepingBedrock.playerDisconnect : evt(): ", evt);
    });
    this.server.on("raknetDisconnect", (evt) => {
      console.log("DEBUG SleepingBedrock.constructor : (): ", evt);
    });
  }

  init = async () => {
    console.log("DEBUG SleepingBedrock.init : (): ");
    try {
      this.logger.info(`[BedRock] Starting on ${this.settings.bedrockPort}`);
      await this.server.bootstrap("0.0.0.0", this.settings.bedrockPort);
    } catch (err) {
      this.logger.error(err);
    }
    console.log("DEBUG SleepingBedrock.init : AFTER ");
  };

  close = async () => {
    console.log("DEBUG SleepingBedrock.close : (): BEGIN");

    // const saveExit = process.exit;
    // (process.exit as any) = (code?: number) => {};
    await this.server.shutdown({stayAlive: true});
    // process.exit = saveExit;
    console.log("DEBUG SleepingBedrock.close : (): END");
  };
}

/*
import Config from "@jsprismarine/prismarine/dist/config/Config";
import { EventManager } from "@jsprismarine/prismarine/dist/events/EventManager";
import {
  RaknetConnectEvent,
  RaknetEncapsulatedPacketEvent,
} from "@jsprismarine/prismarine/dist/events/Events";
import PlayerManager from "@jsprismarine/prismarine/dist/player/PlayerManager";
import { Protocol } from "@jsprismarine/raknet";
import Connection from "@jsprismarine/raknet/dist/Connection";
import Listener from "@jsprismarine/raknet/dist/Listener";
import Identifiers from "@jsprismarine/raknet/dist/protocol/Identifiers";
import InetAddress from "@jsprismarine/raknet/dist/utils/InetAddress";
import { getMOTD } from "./sleepingHelper";

import { getLogger, LoggerType } from "./sleepingLogger";
import { ISleepingServer } from "./sleepingServerInterface";
import { Settings } from "./sleepingSettings";
import { Player, PlayerConnectionCallBackType } from "./sleepingTypes";

const Address = "0.0.0.0";
const Version = "1.17.41";

export class SleepingBedrock implements ISleepingServer {
  settings: Settings;
  logger: LoggerType;
  listener?: Listener;
  listenerBuilder: Listener;
  playerManager: PlayerManager;
  private readonly eventManager = new EventManager();
  playerConnectionCallBack: PlayerConnectionCallBackType;

  constructor(
    settings: Settings,
    playerConnectionCallBack: PlayerConnectionCallBackType
  ) {
    this.settings = settings;

    this.playerConnectionCallBack = playerConnectionCallBack;

    this.logger = getLogger();
    const config = new Config(Version);
    (config as any).motd = getMOTD(settings, "plain");
    const server = {
      getConfig() {
        return config;
      },
      getIdentifiers() {
        return Identifiers;
      },
      getLogger: () => {
        return this.logger;
      },
      getPlayerManager: () => {
        return this.playerManager;
      },
    };
    this.playerManager = new PlayerManager(server as any);
    this.listenerBuilder = new Listener(server);
  }

  init = async () => {
    if (!this.settings.bedrockPort) {
      return;
    }

    this.listener = await this.listenerBuilder.listen(
      Address,
      this.settings.bedrockPort
    );
    this.logger.info(
      `[BedRock] Listening on ${Address}:${this.settings.bedrockPort}`
    );

    this.listener.on("openConnection", this.handleOpenConnection);
    this.listener.on(
      "closeConnection",
      async (inetAddr: InetAddress, reason: string) => {
        this.logger.info(
          `[BedRock] closeConnection ${JSON.stringify(inetAddr)} ${reason}`
        );
      }
    );
    this.listener.on("encapsulated", this.handleEncapsulated);
    // this.listener.on('raw', async (buffer: Buffer, inetAddr: InetAddress) => { this.logger.info(`raw ${JSON.stringify(inetAddr)} ${JSON.stringify(buffer)}`) });

    this.eventManager.on("raknetConnect", this.handleRaknetConnect);
  };

  private handleOpenConnection = async (connection: Connection) => {
    this.logger.info(
      `[BedRock] openConnection ${JSON.stringify(connection.getState())}`
    );
    const event = new RaknetConnectEvent(connection);
    await this.eventManager.emit("raknetConnect", event);
  };

  private handleRaknetConnect = async (
    raknetConnectEvent: RaknetConnectEvent
  ) => {
    this.logger.info(`[BedRock] raknetConnect ${raknetConnectEvent}`);
    const connection = raknetConnectEvent.getConnection();
    connection.disconnect(this.settings.loginMessage);
    await connection.close();
    await this.close();
    this.playerConnectionCallBack(Player.bedrock());
  };

  private handleEncapsulated = async (
    packet: Protocol.EncapsulatedPacket,
    inetAddr: InetAddress
  ) => {
    this.logger.info(`encapsulated ${JSON.stringify(inetAddr)}`);
    const event = new RaknetEncapsulatedPacketEvent(inetAddr, packet);
    await this.eventManager.emit("raknetEncapsulatedPacket", event);
  };

  close = async () => {
    this.logger.info(`[BedRock] Closing`);
    if (this.listener) {
      try {
        this.listener.kill();
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            this.logger.info(`[BedRock] Timeout during close`);
            reject("[BedRock] Timeout during close");
          }, 5000);
          this.listener?.getSocket().close(() => {
            this.logger.info(`[BedRock] Socket Closed`);
            resolve("closed");
            clearTimeout(timeout);
          });
        });
      } catch (error: any) {
        this.logger.error(`[BedRock] Closing error: ${error?.message}`);
      }
      this.listener = undefined;
    }
  };
}
*/
