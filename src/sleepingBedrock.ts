import { Events, Managers, Config } from "@jsprismarine/prismarine";
import { Protocol, RakNetListener, InetAddress, RakNetSession } from "@jsprismarine/raknet";
import { getMOTD } from "./sleepingHelper.js";
import { getLogger, LoggerType } from "./sleepingLogger.js";
import { ISleepingServer } from "./sleepingServerInterface.js";
import { Settings } from "./sleepingSettings.js";
import { Player, PlayerConnectionCallBackType } from "./sleepingTypes.js";

const Address = "0.0.0.0";
const Version = "1.17.41";

export class SleepingBedrock implements ISleepingServer {
  settings: Settings;
  logger: LoggerType;
  listener?: RakNetListener;
  //playerManager: PlayerManager;
  private readonly eventManager = new Managers.EventManager();
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
      getLogger: () => {
        return this.logger;
      },
      getPlayerManager: () => {
        return null; //this.playerManager;
      },
    };
    //this.playerManager = new PlayerManager(server as any);
    this.listener = new RakNetListener(server.getConfig().getMaxPlayers(), server.getConfig().getOnlineMode());
  }

  init = async () => {
    if (!this.settings.bedrockPort) {
      return;
    }

    await this.listener?.start(
      Address,
      this.settings.bedrockPort
    );
    this.logger.info(
      `[Bedrock] Listening on ${Address}:${this.settings.bedrockPort}`
    );

    this.listener?.on("openConnection", this.handleOpenConnection);
    this.listener?.on(
      "closeConnection",
      async (inetAddr: InetAddress, reason: string) => {
        this.logger.info(
          `[Bedrock] closeConnection ${JSON.stringify(inetAddr)} ${reason}`
        );
      }
    );
    this.listener?.on("encapsulated", this.handleEncapsulated);
    // this.listener.on('raw', async (buffer: Buffer, inetAddr: InetAddress) => { this.logger.info(`raw ${JSON.stringify(inetAddr)} ${JSON.stringify(buffer)}`) });

    this.eventManager.on("raknetConnect", this.handleRaknetConnect);
  };

  private handleOpenConnection = async (connection: RakNetSession) => {
    this.logger.info(
      `[Bedrock] openConnection ${JSON.stringify(connection.getState())}`
    );
    const event = new Events.RaknetConnectEvent(connection);
    await this.eventManager.emit("raknetConnect", event);
  };

  private handleRaknetConnect = async (
    raknetConnectEvent: Events.RaknetConnectEvent
  ) => {
    this.logger.info(`[Bedrock] raknetConnect ${raknetConnectEvent}`);
    const connection = raknetConnectEvent.getRakNetSession();
    connection.disconnect(this.settings.loginMessage);
    await connection.close();
    await this.close();
    this.playerConnectionCallBack(Player.bedrock());
  };

  private handleEncapsulated = async (
    packet: Protocol.Frame ,
    inetAddr: InetAddress
  ) => {
    this.logger.info(`encapsulated ${JSON.stringify(inetAddr)}`);
    const event = new Events.RaknetEncapsulatedPacketEvent(inetAddr, packet);
    await this.eventManager.emit("raknetEncapsulatedPacket", event);
  };

  close = async () => {
    this.logger.info(`[Bedrock] Closing`);
    if (this.listener) {
      try {
        this.listener.kill();
      } catch (error: any) {
        this.logger.error(`[Bedrock] Closing error: ${error?.message}`);
      }
      this.listener = undefined;
    }
  };
}
