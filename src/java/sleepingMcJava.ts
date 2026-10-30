import { createServer, Server as NetServer, Socket } from "net";
import { encodePacket, encodeString } from "./sleepingMcJavaProtocol";
import {
  isStatusRequest,
  parseHandshake,
  parseLoginStart,
  parseStatusPing,
  readPacket,
} from "./sleepingMcJavaParser";
import {
  getFavIcon,
  getMOTD,
  isAccessAllowed,
  ServerStatus,
} from "../sleepingHelper";
import { getLogger, LoggerType } from "../sleepingLogger";
import { ISleepingServer } from "../sleepingServerInterface";
import { AccessFileSettings, Settings } from "../sleepingSettings";
import { Player, PlayerConnectionCallBackType } from "../sleepingTypes";
import { LATEST_MINECRAFT_VERSION } from "../version";

const MaxPacketLength = 2 * 1024 * 1024;

export class SleepingMcJava implements ISleepingServer {
  server?: NetServer;

  settings: Settings;
  accessSettings: AccessFileSettings;
  logger: LoggerType;
  playerConnectionCallBack: PlayerConnectionCallBackType;

  isClosing = false;

  constructor(
    playerConnectionCallBack: PlayerConnectionCallBackType,
    settings: Settings,
    accessSettings: AccessFileSettings,
  ) {
    this.settings = settings;
    this.accessSettings = accessSettings;
    this.playerConnectionCallBack = playerConnectionCallBack;
    this.logger = getLogger();
  }

  getIp = (socket: Socket) => {
    return this.settings.hideIpInLogs ? "" : `_${socket.remoteAddress}`;
  };

  init = async () => {
    this.server = createServer((socket) => this.onConnection(socket));
    this.server.listen(this.settings.serverPort);

    this.logger.info(
      `[McJava] Waiting for a Prince to come. [${this.settings.serverPort}]`,
    );

    this.server.on("connection", (client: Socket) => {
      if (!this.settings.hideOnConnectionLogs) {
        this.logger.info(
          `A Prince has taken a quick peek. [${this.getIp(client)}]`,
        );
      }
    });

    this.server.on("listening", () => {
      this.logger.info("[McJava] Ready for battle");
    });

    this.server.on("error", (error) => {
      this.logger.error(`Something went wrong in wonderland ${error.message}`);
    });
  };

  onConnection = (socket: Socket) => {
    let buffer = Buffer.alloc(0);
    let state: "handshake" | "status" | "login" = "handshake";
    let protocolVersion = 0;

    socket.on("data", (data) => {
      buffer = Buffer.concat([buffer, data]);
      if (buffer.length > MaxPacketLength) {
        socket.destroy();
        return;
      }

      try {
        while (true) {
          const packet = readPacket(buffer);
          if (!packet) {
            return;
          }
          buffer = buffer.subarray(packet.bytesRead);

          if (state === "handshake") {
            const handshake = parseHandshake(packet);
            if (!handshake) {
              socket.destroy();
              return;
            }
            protocolVersion = handshake.protocolVersion;
            state = handshake.nextState;
            continue;
          }

          if (state === "status") {
            if (isStatusRequest(packet)) {
              socket.write(
                encodePacket(
                  0,
                  encodeString(
                    JSON.stringify(this.createStatusResponse(protocolVersion)),
                  ),
                ),
              );
              continue;
            }
            const ping = parseStatusPing(packet);
            if (ping) {
              socket.end(encodePacket(1, ping));
              return;
            }
            socket.destroy();
            return;
          }

          const username = parseLoginStart(packet);
          if (username) {
            this.onLogin(socket, username);
            return;
          }
          socket.destroy();
          return;
        }
      } catch {
        socket.destroy();
      }
    });

    socket.on("error", () => undefined);
  };

  onLogin = (socket: Socket, userName: string) => {
    const player = Player.fromConnection(userName, socket.remoteAddress);
    const accessStatus = isAccessAllowed(
      player,
      this.settings,
      this.accessSettings,
    );
    if (!accessStatus.allowed) {
      this.logger.info(
        `${player}:[${socket.remoteAddress}], rejected: ${accessStatus.reason}.`,
      );
      this.sendLoginDisconnect(socket, "You are not on the guest list.");
      return;
    }

    if (this.isClosing) {
      this.logger.info(`Prince ${userName}, someone came before you...`);
      this.sendLoginDisconnect(socket, this.settings.loginMessage);
      return;
    }
    this.isClosing = true;

    this.logger.info(
      `Prince [${userName}${this.getIp(socket)}] has come, time to wake up.`,
    );
    this.logger.info(`Sending best regards ${this.settings.loginMessage}`);
    socket.once("close", () => {
      this.logger.info(`[${player}] The prince is gone, for now`);
      this.playerConnectionCallBack(player);
    });
    this.sendLoginDisconnect(socket, this.settings.loginMessage);
  };

  private createStatusResponse(protocolVersion: number) {
    return {
      version: {
        name: this.settings.version || LATEST_MINECRAFT_VERSION,
        protocol: protocolVersion,
      },
      players: { max: this.settings.maxPlayers, online: 0 },
      description: getMOTD(this.settings, "json"),
      favicon: getFavIcon(this.settings),
    };
  }

  private sendLoginDisconnect(socket: Socket, message: string) {
    socket.end(
      encodePacket(0, encodeString(JSON.stringify({ text: message }))),
    );
  }

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
