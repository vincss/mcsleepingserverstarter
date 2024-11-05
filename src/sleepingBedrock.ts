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

    this.prismarineLogger = new PrismarineLogger("info", getTransports());
    (this.prismarineLogger as any).disable = () => {
      /* do not close the logger */
    };
    (this.prismarineLogger as any).logger = this.logger;

    this.server = new Server({
      config,
      logger: this.prismarineLogger,
      headless: true,
    });

    this.server.on("raknetConnect", (evt) => {
      this.logger.info(
        `[BedRock] A player connected ${
          this.settings.hideIpInLogs ? "" : evt.getRakNetSession().getAddress()
        }`
      );

      evt.getRakNetSession().disconnect(this.settings.loginMessage);
      evt.getRakNetSession().close();
      this.playerConnectionCallBack(Player.bedrock());
    });
  }

  init = async () => {
    try {
      this.logger.info(`[BedRock] Starting on ${this.settings.bedrockPort}`);
      await this.server.bootstrap("0.0.0.0", this.settings.bedrockPort);
    } catch (err) {
      this.logger.error("[BedRock] Init error", err);
    }
  };

  close = async () => {
    this.logger.info(`[BedRock] Closing...`);
    await this.server.shutdown({ stayAlive: true });
  };
}
