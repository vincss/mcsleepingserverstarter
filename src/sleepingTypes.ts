import {Client} from "minecraft-protocol";

export type PlayerConnectionCallBackType = (player: Player) => void;

export class Player {
    playerName: string;
    uuid: string;
    realUser: boolean;

    private constructor(playerName: string, uuid: string, client?: Client) {
        if (client) {
            this.playerName = client.username;
            this.uuid = client.uuid;
            this.realUser = true;
        } else {
            this.playerName = playerName;
            this.uuid = uuid;
            this.realUser = false;
        }
    }

    static cli() {
        return new Player("A CliUser", "A CliUser");
    }

    static bedrock() {
        return new Player("A BedRock Player", "A BedRock Player");
    }

    static web() {
        return new Player("A WebUser", "A WebUser");
    }

    static fromClient(client: Client) {
        return new Player("", "", client);
    }

    toString() {
        return `${this.playerName}(${this.uuid})`;
    }
}