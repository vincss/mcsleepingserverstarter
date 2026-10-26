import { randomBytes } from "crypto";
import { createSocket, RemoteInfo, Socket } from "dgram";
import { ISleepingServer } from "../sleepingServerInterface";
import { Player, PlayerConnectionCallBackType } from "../sleepingTypes";
import { Settings } from "../sleepingSettings";
import { getLogger, LoggerType } from "../sleepingLogger";
import {
  createConnectionAccepted,
  createDisconnectFrameSet,
  createOpenConnectionReply1,
  createOpenConnectionReply2,
  createPong,
  writeAck,
} from "./sleepingBedrockProtocol";
import { BedrockPacket, parseBedrockDatagram } from "./sleepingBedrockParser";

type RakNetSession = {
  outputSequenceNumber: number;
};

export class SleepingBedrock implements ISleepingServer {
  private settings: Settings;
  private playerConnectionCallBack: PlayerConnectionCallBackType;
  private logger: LoggerType;
  private server?: Socket;
  private readonly serverGuid = randomBytes(8).readBigUInt64BE();
  private sessions = new Map<string, RakNetSession>();

  constructor(
    settings: Settings,
    playerConnectionCallBack: PlayerConnectionCallBackType,
  ) {
    this.logger = getLogger();
    this.settings = settings;
    this.playerConnectionCallBack = playerConnectionCallBack;
  }

  init = async () => {
    this.logger.info(`[BedRock] Starting on ${this.settings.bedrockPort}`);
    this.server = createSocket("udp4");
    this.server.on("message", (message, remote) =>
      this.onMessage(message, remote),
    );
    this.server.on("error", (error) => {
      this.logger.error("[BedRock] Socket error", error);
    });

    await new Promise<void>((resolve, reject) => {
      this.server?.once("listening", resolve);
      this.server?.once("error", reject);
      this.server?.bind(this.settings.bedrockPort, "0.0.0.0");
    }).catch((error) => {
      this.logger.error("[BedRock] Init error", error);
    });
  };

  onMessage = (message: Buffer, remote: RemoteInfo) => {
    try {
      const packet = parseBedrockDatagram(message);
      if (!packet) {
        return;
      }

      switch (packet.type) {
        case "ping":
          this.handlePing(packet, remote);
          break;
        case "open_connection_request_1":
          this.send(
            createOpenConnectionReply1(this.serverGuid, packet.mtuSize),
            remote,
          );
          break;
        case "open_connection_request_2":
          this.handleOpenConnectionRequest2(packet.mtuSize, remote);
          break;
        case "frame_set":
          this.handleFrameSet(packet, remote);
          break;
      }
    } catch {
      // Ignore malformed and unsupported datagrams.
    }
  };

  private handlePing(
    packet: Extract<BedrockPacket, { type: "ping" }>,
    remote: RemoteInfo,
  ) {
    this.send(
      createPong(
        packet.timestamp,
        this.serverGuid,
        this.settings.serverName,
        this.settings.maxPlayers,
        this.settings.bedrockPort ?? 0,
      ),
      remote,
    );
  }

  private handleOpenConnectionRequest2(mtuSize: number, remote: RemoteInfo) {
    this.sessions.set(this.getSessionKey(remote), { outputSequenceNumber: 0 });
    this.send(
      createOpenConnectionReply2(this.serverGuid, remote, mtuSize),
      remote,
    );
  }

  private handleFrameSet(
    packet: Extract<BedrockPacket, { type: "frame_set" }>,
    remote: RemoteInfo,
  ) {
    const key = this.getSessionKey(remote);
    const session = this.sessions.get(key);
    if (!session) {
      return;
    }

    this.send(writeAck(packet.sequenceNumber), remote);
    for (const controlPacket of packet.packets) {
      switch (controlPacket.type) {
        case "connection_request":
          this.send(
            createConnectionAccepted(
              remote,
              controlPacket.timestamp,
              BigInt(Date.now()),
              session.outputSequenceNumber++,
            ),
            remote,
          );
          break;
        case "new_incoming_connection":
          this.disconnectClient(key, session, remote);
          return;
      }
    }
  }

  private disconnectClient(
    key: string,
    session: RakNetSession,
    remote: RemoteInfo,
  ) {
    this.send(createDisconnectFrameSet(session.outputSequenceNumber), remote);
    this.sessions.delete(key);
    this.logger.info(
      `[BedRock] A player connected ${this.settings.hideIpInLogs ? "" : remote.address}`,
    );
    this.playerConnectionCallBack(Player.bedrock());
  }

  private send(message: Buffer, remote: RemoteInfo) {
    this.server?.send(message, remote.port, remote.address);
  }

  private getSessionKey(remote: RemoteInfo) {
    return `${remote.address}:${remote.port}`;
  }

  close = async () => {
    this.logger.info(`[BedRock] Closing...`);
    const server = this.server;
    this.server = undefined;
    this.sessions.clear();
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  };
}
