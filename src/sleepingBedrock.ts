import { randomBytes } from "crypto";
import { createSocket, RemoteInfo, Socket } from "dgram";
import { ISleepingServer } from "./sleepingServerInterface";
import { Player, PlayerConnectionCallBackType } from "./sleepingTypes";
import { Settings } from "./sleepingSettings";
import { getLogger, LoggerType } from "./sleepingLogger";
import {
  createConnectionAccepted,
  createDisconnectFrameSet,
  createOpenConnectionReply1,
  createOpenConnectionReply2,
  createPong,
  getFramePayloads,
  isRakNetMagic,
  readOpenConnectionRequest2,
  readSequenceNumber,
  writeAck,
} from "./sleepingBedrockProtocol";

type RakNetSession = {
  outputSequenceNumber: number;
};

const RakNetProtocolVersion = 11;
const ConnectedPingPacket = 0x01;
const UnconnectedPingPacket = 0x02;
const OpenConnectionRequest1Packet = 0x05;
const OpenConnectionRequest2Packet = 0x07;
const ConnectionRequestPacket = 0x09;
const NewIncomingConnectionPacket = 0x13;

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
      switch (message[0]) {
        case ConnectedPingPacket:
        case UnconnectedPingPacket:
          this.handlePing(message, remote);
          break;
        case OpenConnectionRequest1Packet:
          this.handleOpenConnectionRequest1(message, remote);
          break;
        case OpenConnectionRequest2Packet:
          this.handleOpenConnectionRequest2(message, remote);
          break;
        default:
          if ((message[0] & 0xf0) === 0x80) {
            this.handleFrameSet(message, remote);
          }
      }
    } catch {
      // Ignore malformed and unsupported datagrams.
    }
  };

  private handlePing(message: Buffer, remote: RemoteInfo) {
    if (message.length < 25 || !isRakNetMagic(message, 9)) {
      return;
    }
    this.send(
      createPong(
        message.subarray(1, 9),
        this.serverGuid,
        this.settings.serverName,
        this.settings.maxPlayers,
        this.settings.bedrockPort ?? 0,
      ),
      remote,
    );
  }

  private handleOpenConnectionRequest1(message: Buffer, remote: RemoteInfo) {
    if (
      message.length < 18 ||
      !isRakNetMagic(message, 1) ||
      message[17] !== RakNetProtocolVersion
    ) {
      return;
    }
    this.send(
      createOpenConnectionReply1(
        this.serverGuid,
        Math.min(message.length + 28, 1492),
      ),
      remote,
    );
  }

  private handleOpenConnectionRequest2(message: Buffer, remote: RemoteInfo) {
    if (message.length < 34 || !isRakNetMagic(message, 1)) {
      return;
    }
    const { mtuSize } = readOpenConnectionRequest2(message);
    this.sessions.set(this.getSessionKey(remote), { outputSequenceNumber: 0 });
    this.send(
      createOpenConnectionReply2(this.serverGuid, remote, mtuSize),
      remote,
    );
  }

  private handleFrameSet(message: Buffer, remote: RemoteInfo) {
    const key = this.getSessionKey(remote);
    const session = this.sessions.get(key);
    if (!session) {
      return;
    }

    this.send(writeAck(readSequenceNumber(message)), remote);
    for (const payload of getFramePayloads(message)) {
      switch (payload[0]) {
        case ConnectionRequestPacket:
          this.send(
            createConnectionAccepted(
              remote,
              payload.readBigInt64BE(9),
              BigInt(Date.now()),
              session.outputSequenceNumber++,
            ),
            remote,
          );
          break;
        case NewIncomingConnectionPacket:
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
