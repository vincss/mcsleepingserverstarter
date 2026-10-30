import { AddressInfo, connect } from "net";
import { DefaultSettings } from "../sleepingSettings";
import { Player } from "../sleepingTypes";
import { SleepingMcJava } from "./sleepingMcJava";
import {
  encodePacket,
  encodeString,
  encodeVarInt,
} from "./sleepingMcJavaProtocol";
import { readPacket, readString } from "./sleepingMcJavaParser";

const createHandshake = (port: number, nextState: number) => {
  const serverPort = Buffer.alloc(2);
  serverPort.writeUInt16BE(port);
  return encodePacket(
    0,
    Buffer.concat([
      encodeVarInt(765),
      encodeString("localhost"),
      serverPort,
      encodeVarInt(nextState),
    ]),
  );
};

const sendLogin = (port: number, username: string) =>
  new Promise<string>((resolve, reject) => {
    const client = connect(port);
    let buffer = Buffer.alloc(0);
    client.on("connect", () =>
      client.write(
        Buffer.concat([
          createHandshake(25565, 2),
          encodePacket(0, encodeString(username)),
        ]),
      ),
    );
    client.on("data", (data) => {
      buffer = Buffer.concat([buffer, data]);
      const packet = readPacket(buffer);
      if (!packet) {
        return;
      }
      const message = readString(packet.payload, 0);
      if (packet.id !== 0 || !message) {
        reject(new Error("Invalid login disconnect packet"));
        return;
      }
      resolve(message.value);
      client.end();
    });
    client.once("error", reject);
  });

type StatusResponse = {
  players: {
    max: number;
    online: number;
  };
  description: {
    text: string;
    color: string;
  };
};

test("handles login without account authentication and still applies access rules", async () => {
  let resolvePlayer: (player: Player) => void = () => undefined;
  const playerConnected = new Promise<Player>((resolve) => {
    resolvePlayer = resolve;
  });
  const settings = {
    ...DefaultSettings,
    serverName: "§aJava status server name",
    serverPort: 0,
    whiteListedNames: ["Tester"],
    hideOnConnectionLogs: true,
  };
  const listener = new SleepingMcJava(resolvePlayer, settings, {});
  await listener.init();
  await new Promise<void>((resolve) =>
    listener.server?.once("listening", resolve),
  );

  const address = listener.server?.address() as AddressInfo;
  const pingPayload = Buffer.from("12345678");
  const statusResponse = new Promise<{ status: StatusResponse; pong: Buffer }>(
    (resolve, reject) => {
      const client = connect(address.port);
      let buffer = Buffer.alloc(0);
      let status: StatusResponse | undefined;
      client.on("connect", () =>
        client.write(
          Buffer.concat([
            createHandshake(25565, 1),
            encodePacket(0, Buffer.alloc(0)),
          ]),
        ),
      );
      client.on("data", (data) => {
        buffer = Buffer.concat([buffer, data]);
        while (true) {
          const packet = readPacket(buffer);
          if (!packet) {
            return;
          }
          buffer = buffer.subarray(packet.bytesRead);
          if (packet.id === 0 && status === undefined) {
            const message = readString(packet.payload, 0);
            if (!message) {
              reject(new Error("Invalid status response packet"));
              return;
            }
            status = JSON.parse(message.value) as StatusResponse;
            client.write(encodePacket(1, pingPayload));
            continue;
          }
          if (
            packet.id !== 1 ||
            !packet.payload.equals(pingPayload) ||
            status === undefined
          ) {
            reject(new Error("Invalid status pong packet"));
            return;
          }
          resolve({ status, pong: packet.payload });
          client.end();
          return;
        }
      });
      client.once("error", reject);
    },
  );

  try {
    const { status, pong } = await statusResponse;
    expect(status.players.max).toBe(settings.maxPlayers);
    expect(status.players.online).toBe(0);
    expect(status.description).toEqual({
      text: "Java status server name",
      color: "green",
    });
    expect(pong).toEqual(pingPayload);

    expect(JSON.parse(await sendLogin(address.port, "Intruder"))).toEqual({
      text: "You are not on the guest list.",
    });
    expect(listener.isClosing).toBe(false);

    expect(JSON.parse(await sendLogin(address.port, "Tester"))).toEqual({
      text: settings.loginMessage,
    });
    const player = await playerConnected;
    expect(player.playerName).toBe("Tester");
    expect(player.realUser).toBe(true);
  } finally {
    await listener.close();
  }
});
