import { RemoteInfo } from "dgram";
import { RakNetMagic } from "./sleepingBedrockParser";

const writeLong = (value: bigint) => {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt.asUintN(64, value));
  return buffer;
};

const writeTriadLE = (value: number) => {
  const buffer = Buffer.alloc(3);
  buffer.writeUIntLE(value & 0xffffff, 0, 3);
  return buffer;
};

const writeAddress = (address: string, port: number) => {
  const octets = address.split(".").map((octet) => Number(octet));
  if (octets.length !== 4 || octets.some((octet) => octet < 0 || octet > 255)) {
    throw new Error("Unsupported RakNet address");
  }
  const buffer = Buffer.alloc(7);
  buffer[0] = 4;
  for (let index = 0; index < 4; index++) {
    buffer[index + 1] = ~octets[index] & 0xff;
  }
  buffer.writeUInt16BE(port, 5);
  return buffer;
};

export const createPong = (
  timestamp: Buffer,
  serverGuid: bigint,
  serverName: string,
  maxPlayers: number,
  port: number,
) => {
  const motd = [
    "MCPE",
    serverName,
    "748",
    "1.21.40",
    "0",
    String(maxPlayers),
    serverGuid.toString(),
    serverName,
    "Survival",
    "1",
    String(port),
    String(port),
  ].join(";");
  const name = Buffer.from(motd, "utf8");
  const length = Buffer.alloc(2);
  length.writeUInt16BE(name.length);
  return Buffer.concat([
    Buffer.from([0x1c]),
    timestamp,
    writeLong(serverGuid),
    RakNetMagic,
    length,
    name,
  ]);
};

export const createOpenConnectionReply1 = (
  serverGuid: bigint,
  mtuSize: number,
) => {
  const mtu = Buffer.alloc(2);
  mtu.writeUInt16BE(mtuSize);
  return Buffer.concat([
    Buffer.from([0x06]),
    RakNetMagic,
    writeLong(serverGuid),
    Buffer.from([0]),
    mtu,
  ]);
};

export const createOpenConnectionReply2 = (
  serverGuid: bigint,
  remote: RemoteInfo,
  mtuSize: number,
) => {
  const mtu = Buffer.alloc(2);
  mtu.writeUInt16BE(mtuSize);
  return Buffer.concat([
    Buffer.from([0x08]),
    RakNetMagic,
    writeLong(serverGuid),
    writeAddress(remote.address, remote.port),
    mtu,
    Buffer.from([0]),
  ]);
};

export const writeAck = (sequenceNumber: number) =>
  Buffer.concat([Buffer.from([0xc0, 0, 1, 1]), writeTriadLE(sequenceNumber)]);

export const createConnectionAccepted = (
  remote: RemoteInfo,
  requestTimestamp: bigint,
  acceptedTimestamp: bigint,
  sequenceNumber: number,
) => {
  const unknown = writeAddress("0.0.0.0", 0);
  const local = writeAddress("127.0.0.1", 0);
  const accepted = Buffer.concat([
    Buffer.from([0x10]),
    writeAddress(remote.address, remote.port),
    Buffer.alloc(2),
    local,
    ...Array.from({ length: 19 }, () => unknown),
    writeLong(requestTimestamp),
    writeLong(acceptedTimestamp),
  ]);
  return createFrameSet(sequenceNumber, accepted);
};

export const createDisconnectFrameSet = (sequenceNumber: number) =>
  createFrameSet(sequenceNumber, Buffer.from([0x15]));

const createFrameSet = (sequenceNumber: number, payload: Buffer) => {
  const bitLength = Buffer.alloc(2);
  bitLength.writeUInt16BE(payload.length * 8);
  return Buffer.concat([
    Buffer.from([0x80]),
    writeTriadLE(sequenceNumber),
    Buffer.from([0]),
    bitLength,
    payload,
  ]);
};
