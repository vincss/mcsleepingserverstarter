import { AddressInfo } from "net";
import { createSocket, Socket } from "dgram";
import { SleepingBedrock } from "./sleepingBedrock";
import { DefaultSettings } from "./sleepingSettings";
import { Player } from "./sleepingTypes";
import { RakNetMagic } from "./sleepingBedrockProtocol";

const writeTriadLE = (value: number) => {
  const result = Buffer.alloc(3);
  result.writeUIntLE(value, 0, 3);
  return result;
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

const createFrameSet = (sequenceNumber: number, payload: Buffer) => {
  const bitLength = Buffer.alloc(2);
  bitLength.writeUInt16BE(payload.length * 8);
  return Buffer.concat([
    Buffer.from([0x80]),
    writeTriadLE(sequenceNumber),
    Buffer.from([0x60]),
    bitLength,
    Buffer.alloc(7),
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
    expect(motd.split(";")[1]).toBe(settings.serverName);
    expect(motd.split(";")[5]).toBe(String(settings.maxPlayers));

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
    const connectionRequest = Buffer.alloc(17);
    connectionRequest[0] = 0x09;
    connectionRequest.writeBigInt64BE(BigInt(Date.now()), 9);
    await send(client, address.port, createFrameSet(0, connectionRequest));
    await accepted;

    const disconnect = waitForPacket(client, 0x80);
    await send(client, address.port, createFrameSet(1, Buffer.from([0x13])));
    const disconnectFrameSet = await disconnect;
    expect(disconnectFrameSet.includes(0x15)).toBe(true);
    expect(await playerConnected).toMatchObject({
      playerName: "A BedRock Player",
      realUser: false,
    });
  } finally {
    client.close();
    await listener.close();
  }
});
