import { Client, createServer, Server, ServerClient } from "minecraft-protocol";
import {
  getFavIcon,
  getMOTD,
  isAccessAllowed,
  ServerStatus,
} from "./sleepingHelper";
import { getLogger, LoggerType } from "./sleepingLogger";
import { ISleepingServer } from "./sleepingServerInterface";
import { AccessFileSettings, Settings } from "./sleepingSettings";
import { Player, PlayerConnectionCallBackType } from "./sleepingTypes";

export class SleepingMcJava implements ISleepingServer {
  server?: Server;

  settings: Settings;
  accessSettings: AccessFileSettings;
  logger: LoggerType;
  playerConnectionCallBack: PlayerConnectionCallBackType;

  isClosing = false;

  constructor(
    playerConnectionCallBack: PlayerConnectionCallBackType,
    settings: Settings,
    accessSettings: AccessFileSettings
  ) {
    this.settings = settings;
    this.accessSettings = accessSettings;
    this.playerConnectionCallBack = playerConnectionCallBack;
    this.logger = getLogger();
  }

  getIp = (client: Client) => {
    return this.settings.hideIpInLogs ? "" : `_${client.socket.remoteAddress}`;
  };

  init = async () => {
    this.server = createServer({
      "online-mode": this.settings.serverOnlineMode,
      motdMsg: getMOTD(this.settings, "json"),
      port: this.settings.serverPort,
      maxPlayers: this.settings.maxPlayers,
      version: this.settings.version,
      beforePing: (reponse) => {
        reponse.favicon = getFavIcon(this.settings);
      },
      validateChannelProtocol: true,
      errorHandler: (client, error) =>
        console.warn("SleepingMcJava.errorHandler: ", client, error),
      enforceSecureProfile: this.settings.serverOnlineMode,
      // encryption: false,
      // host: '0.0.0.0',
    });

    this.logger.info(
      `[McJava] Waiting for a Prince to come. [${this.settings.serverPort}]`
    );

    this.server.on("connection", (client: Client) => {
      !this.settings.hideOnConnectionLogs &&
        this.logger.info(
          `A Prince has taken a quick peek. [${client.version}${this.getIp(
            client
          )}]`
        );
    });

    this.server.on("listening", () => {
      this.logger.info("[McJava] Ready for battle");
    });

    if (this.settings.useLegacyLogin) {
      this.server.on("login", this.onLogin);
    } else {
      this.server.on("playerJoin", this.onLogin);
    }

    this.server.on("error", (error) => {
      this.logger.error(`Something went wrong in wonderland ${error.message}`);
    });
  };

  onLogin = (client: ServerClient) => {
    {
      const userName = client.username;
      const player = Player.fromClient(client);

      const accessStatus = isAccessAllowed(
        player,
        this.settings,
        this.accessSettings
      );
      if (!accessStatus.allowed) {
        this.logger.info(
          `${player}.${client.state}:[${client.socket.remoteAddress}], rejected: ${accessStatus.reason}.`
        );
        client.end("You are not on the guest list.");
        return;
      }

      if (this.isClosing) {
        this.logger.info(
          `Prince ${userName}.${client.state}, someone came before you...`
        );
        client.on("end", (client) => {
          this.logger.info(`${userName} is gone.`, client);
        });
        client.end(this.settings.loginMessage);
        return;
      }
      this.isClosing = true;

      this.logger.info(
        `Prince [${userName}.${client.state}${this.getIp(
          client
        )}] has come, time to wake up.`
      );

      client.on("end", (client) => {
        this.logger.info(`[${player}] The prince is gone, for now`, client);
        this.playerConnectionCallBack(player);
      });
      this.logger.info(`Sending best regards ${this.settings.loginMessage}`);
      client.end(this.settings.loginMessage);
    }
  };

  close = async () => {
    this.logger.info("[McJava] Closing");
    if (this.server) {
      this.server.close();
      this.server = undefined;
      this.logger.info("[McJava] Closed");
    }
  };

  getStatus = () => {
    let status = ServerStatus.Stopped;
    if (this.server) {
      status = ServerStatus.Sleeping;
    }
    return status;
  };
}
