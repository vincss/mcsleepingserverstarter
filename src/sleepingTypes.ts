import { Client } from "minecraft-protocol";

export type PlayerConnectionCallBackType = (player: Player) => void;

export class Player {
  playerName: string;
  uuid: string;
  ip?: string;
  realUser: boolean;

  private constructor(name: string, client?: Client) {
    if (client) {
      this.playerName = client.username;
      this.uuid = client.uuid;
      this.ip = client.socket.remoteAddress;
      this.realUser = true;
    } else {
      this.playerName = name;
      this.uuid = name;
      this.realUser = false;
    }
  }

  static cli() {
    return new Player("A CliUser");
  }

  static bedrock() {
    return new Player("A BedRock Player");
  }

  static web() {
    return new Player("A WebUser");
  }

  static fromClient(client: Client) {
    return new Player("", client);
  }

  toString() {
    return `${this.playerName}(${this.uuid})`;
  }
}

export class AccessStatus {
  allowed: boolean;
  reason?: string;
  constructor(allowed: boolean, reason?: string) {
    this.allowed = allowed;
    this.reason = reason;
  }
}
