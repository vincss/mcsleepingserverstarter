import fs from "fs";
import path from "path";
import { createConnection } from "net";
import { autoToHtml, cleanTags } from "@sfirew/minecraft-motd-parser";
import ChatMessage from "prismarine-chat";
import { LATEST_MINECRAFT_VERSION } from "./version";
import { getLogger } from "./sleepingLogger";
import { Settings } from "./sleepingSettings";

export const isInDev = () => {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  return false;
};

export const isPortTaken = (port: number) =>
  new Promise<boolean>((resolve) => {
    const client = createConnection({ port }, () => {
      client.end();
      resolve(true);
    }).once("error", () => {
      resolve(false);
    });
  });

const DefaultFavIconString =
  "data:image/png;base64,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";

export const getFavIcon = (settings: Settings): string => {
  if (settings.favIcon) {
    return settings.favIcon;
  }

  let favIconPath = settings.favIconPath;
  if (!favIconPath) {
    return DefaultFavIconString;
  }

  if (!path.isAbsolute(favIconPath)) {
    const directory = settings.minecraftWorkingDirectory ?? process.cwd();
    favIconPath = path.join(directory, favIconPath);
  }
  if (fs.existsSync(favIconPath)) {
    const fileData = fs.readFileSync(favIconPath, { encoding: "base64" });
    return `data:image/png;base64,${fileData}`;
  } else {
    getLogger().error(`Server icon located at ${favIconPath} does not exist!`);
  }

  return DefaultFavIconString;
};

export const getMOTD = (
  settings: Settings,
  outputType: "json" | "html" | "plain",
  forceServerName?: boolean
): string | object => {
  forceServerName = forceServerName ? true : false;
  const motd =
    forceServerName || !settings.serverMOTD
      ? settings.serverName
      : settings.serverMOTD;

  if (outputType === "plain") {
    return cleanTags(motd);
  }

  if (outputType === "html") {
    // This automatically escapes any tags in the serverName to prevent XSS
    return autoToHtml(motd);
  }

  return ChatMessage(settings.version || LATEST_MINECRAFT_VERSION)
    .MessageBuilder.fromString(motd, { colorSeparator: "§" })
    .toJSON();
};

export enum ServerStatus {
  Sleeping = "Sleeping",
  Running = "Running",
  Starting = "Starting",
  Stopped = "Stopped",
}
