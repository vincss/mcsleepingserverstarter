import { AddressInfo } from "net";
import { createSocket, Socket } from "dgram";
import { SleepingBedrock } from "./sleepingBedrock";
import { DefaultSettings } from "../sleepingSettings";
import { Player } from "../sleepingTypes";
import { RakNetMagic } from "./sleepingBedrockParser";

const writeTriadLE = (value: number) => {
  const result = Buffer.alloc(3);
  result.writeUIntLE(value, 0, 3);
  return result;
};

const writeAddress = (address: string, port: number) => {
  const buffer = Buffer.alloc(7);
  const octets = address.split(".").map(Number);
  buffer[0] = 4;
  for (let index = 0; index < 4; index++) {
    buffer[index + 1] = ~octets[index] & 0xff;
  }
  buffer.writeUInt16BE(port, 5);
  return buffer;
};

const writeLong = (value: bigint) => {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(value);
  return buffer;
};

const waitForPacket = (socket: Socket, packetId: number) =>
  new Promise<Buffer>((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off("message", onMessage);
      reject(
        new Error(
          `Timed out waiting for RakNet packet 0x${packetId.toString(16)}`,
        ),
      );
    }, 1500);
    const onMessage = (message: Buffer) => {
      if (message[0] === packetId) {
        clearTimeout(timeout);
        socket.off("error", onError);
        resolve(message);
      }
    };
    const onError = (error: Error) => {
      clearTimeout(timeout);
      socket.off("message", onMessage);
      reject(error);
    };
    socket.on("message", onMessage);
    socket.once("error", onError);
  });

const send = (socket: Socket, port: number, packet: Buffer) =>
  new Promise<void>((resolve, reject) =>
    socket.send(packet, port, "127.0.0.1", (error) =>
      error ? reject(error) : resolve(),
    ),
  );

const createFrameSet = (
  sequenceNumber: number,
  reliableIndex: number,
  orderingIndex: number,
  payload: Buffer,
) => {
  const bitLength = Buffer.alloc(2);
  bitLength.writeUInt16BE(payload.length * 8);
  return Buffer.concat([
    Buffer.from([0x80]),
    writeTriadLE(sequenceNumber),
    Buffer.from([0x60]),
    bitLength,
    writeTriadLE(reliableIndex),
    writeTriadLE(orderingIndex),
    Buffer.from([0]),
    payload,
  ]);
};

test("completes RakNet handshake, disconnects, and wakes the server", async () => {
  let resolvePlayer: (player: Player) => void = () => undefined;
  const playerConnected = new Promise<Player>((resolve) => {
    resolvePlayer = resolve;
  });
  const settings = { ...DefaultSettings, bedrockPort: 0 };
  const listener = new SleepingBedrock(settings, resolvePlayer);
  const client = createSocket("udp4");

  try {
    await new Promise<void>((resolve) => client.bind(0, "127.0.0.1", resolve));
    await listener.init();
    const address = listener["server"]?.address() as AddressInfo;

    const ping = Buffer.concat([
      Buffer.from([0x01]),
      Buffer.alloc(8),
      RakNetMagic,
      Buffer.alloc(8),
    ]);
    const pong = waitForPacket(client, 0x1c);
    await send(client, address.port, ping);
    const pongPacket = await pong;
    const motdLength = pongPacket.readUInt16BE(33);
    const motd = pongPacket.toString("utf8", 35, 35 + motdLength);
    expect(motd.split(";")).toEqual([
      "MCPE",
      settings.serverName,
      "748",
      "1.21.40",
      "0",
      String(settings.maxPlayers),
      expect.any(String),
      settings.serverName,
      "Survival",
      "1",
      String(settings.bedrockPort),
      String(settings.bedrockPort),
      "0",
      "",
    ]);
    expect(motdLength).toBe(Buffer.byteLength(motd));

    const reply1 = waitForPacket(client, 0x06);
    await send(
      client,
      address.port,
      Buffer.concat([
        Buffer.from([0x05]),
        RakNetMagic,
        Buffer.from([11]),
        Buffer.alloc(1200),
      ]),
    );
    await reply1;

    const request2 = Buffer.alloc(34);
    request2[0] = 0x07;
    RakNetMagic.copy(request2, 1);
    request2[17] = 4;
    request2.fill(0xff, 18, 22);
    request2.writeUInt16BE(1200, 24);
    const reply2 = waitForPacket(client, 0x08);
    await send(client, address.port, request2);
    await reply2;

    const accepted = waitForPacket(client, 0x80);
    const requestTimestamp = BigInt(Date.now());
    const connectionRequest = Buffer.alloc(18);
    connectionRequest[0] = 0x09;
    connectionRequest.writeBigUInt64BE(requestTimestamp, 9);
    await send(client, address.port, createFrameSet(0, 0, 0, connectionRequest));
    const acceptedFrameSet = await accepted;
    expect(acceptedFrameSet[4]).toBe(0x60);
    expect(acceptedFrameSet.readUIntLE(7, 3)).toBe(0);
    expect(acceptedFrameSet.readUIntLE(10, 3)).toBe(0);
    expect(acceptedFrameSet[14]).toBe(0x10);

    const disconnect = waitForPacket(client, 0x80);
    const acceptedPayload = acceptedFrameSet.subarray(14);
    const newIncomingConnection = Buffer.concat([
      Buffer.from([0x13]),
      writeAddress("127.0.0.1", address.port),
      ...Array.from({ length: 20 }, () => writeAddress("0.0.0.0", 0)),
      writeLong(acceptedPayload.readBigUInt64BE(150)),
      writeLong(acceptedPayload.readBigUInt64BE(158)),
    ]);
    await send(
      client,
      address.port,
      createFrameSet(1, 1, 1, newIncomingConnection),
    );
    const disconnectFrameSet = await disconnect;
    expect(disconnectFrameSet[4]).toBe(0x60);
    expect(disconnectFrameSet.readUIntLE(7, 3)).toBe(1);
    expect(disconnectFrameSet.readUIntLE(10, 3)).toBe(1);
    expect(disconnectFrameSet[14]).toBe(0x15);
    expect(await playerConnected).toMatchObject({
      playerName: "A BedRock Player",
      realUser: false,
    });
  } finally {
    client.close();
    await listener.close();
  }
});
