import { createHash } from "crypto";

export type PlayerConnectionCallBackType = (player: Player) => void;

export class Player {
  playerName: string;
  uuid: string;
  ip?: string;
  realUser: boolean;

  private constructor(
    name: string,
    connection?: { username: string; uuid: string; ip?: string },
  ) {
    if (connection) {
      this.playerName = connection.username;
      this.uuid = connection.uuid;
      this.ip = connection.ip;
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

  static fromConnection(username: string, ip?: string) {
    const hash = createHash("md5")
      .update(`OfflinePlayer:${username}`, "utf8")
      .digest();
    hash[6] = (hash[6] & 0x0f) | 0x30;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    const uuid = hash
      .toString("hex")
      .replace(/^(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})$/, "$1-$2-$3-$4-$5");
    return new Player("", { username, uuid, ip });
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
