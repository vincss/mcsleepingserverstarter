import { writeFileSync, readFileSync } from "fs";
import { dump, load } from "js-yaml";
import { getLogger } from "./sleepingLogger";
import { getMinecraftDirectory, loadFile } from "./sleepingHelper";
import path from "path";

import PropertiesReader = require("properties-reader");

const logger = getLogger();

const SettingFilePath = "sleepingSettings.yml";
const WhitelistFilePath = "whitelist.json";
const BannedIpsFilePath = "banned-ips.json";
const BannedPlayersFilePath = "banned-players.json";
const NativePropertiesFilePath = "server.properties";

export type Settings = {
  serverName: string;
  serverMOTD?: string;
  serverPort: number;
  bedrockPort?: number;
  maxPlayers: number;
  loginMessage: string;
  serverOnlineMode: boolean;
  webPort?: number;
  webStopOnStart?: boolean;
  webServeDynmap?: boolean | string;
  webSubPath?: string;
  webAllowRestart?: boolean;
  startMinecraft: boolean;
  minecraftAutostart?: boolean;
  minecraftCommand: string;
  minecraftWorkingDirectory?: string;
  restartDelay: number;
  preventStop?: boolean;
  version?: string | false;
  favIcon?: string;
  favIconPath?: string;
  discordWebhookUrl?: string;
  blackListedAddress?: string[];
  whiteListedNames?: string[];
  useWhitelistFile: boolean;
  useBlacklistFiles: boolean;
  useNativeFiles: boolean;
  hideIpInLogs?: boolean;
  hideOnConnectionLogs?: boolean;
  useLegacyLogin?: boolean;
};

export const DefaultSettings: Settings = {
  serverName: "SleepingServer, waiting for his prince...",
  serverPort: 25565,

  maxPlayers: 20,

  loginMessage: "...Waking server up, come back in a minute...",
  serverOnlineMode: true,

  startMinecraft: true, // false to disable
  minecraftCommand: "java -jar paper.jar nogui",
  restartDelay: 5000,
  version: false,
  useWhitelistFile: false,
  useBlacklistFiles: false,
  useNativeFiles: false,
};

export type AccessFileSettings = {
  whitelistEntries?: WhitelistEntry[];
  bannedIpEntries?: BannedIpEntry[];
  bannedPlayerEntries?: BannedPlayerEntry[];
};

export type WhitelistEntry = {
  name: string;
  uuid: string;
};

export type BannedIpEntry = {
  ip: string;
  created: string;
  source: string;
  expires: string;
  reason: string;
};

export type BannedPlayerEntry = {
  uuid: string;
  name: string;
  created: string;
  source: string;
  expires: string;
  reason: string;
};

function saveDefault() {
  try {
    logger.info(`Saving default settings to ${SettingFilePath}`);
    const yamlToWrite = dump(DefaultSettings);
    writeFileSync(SettingFilePath, yamlToWrite);
  } catch (error: any) {
    logger.error("Failed to write setting.", error?.message);
  }
}

export function getSettings(): Settings {
  let settings = { ...DefaultSettings };
  try {
    const read = readFileSync(SettingFilePath).toString();
    const settingsFromFiles = load(read) as Settings;
    settings = { ...DefaultSettings, ...settingsFromFiles };
    if (settings.useNativeFiles) {
      try {
        applyNativeProperties(settings);
      } catch (error: any) {
        logger.error(
          `useNativeFiles is specified, but wasn't able to read ${NativePropertiesFilePath}.`,
          error
        );
      }
    }
  } catch (error: any) {
    logger.error("Failed to load setting, using default.", error);

    try {
      const pathBackup = `${SettingFilePath}.${new Date()
        .toISOString()
        .replace(/:/g, "")}.bak`;
      logger.info(`Backing up your old config to : ${pathBackup}`);
      const read = readFileSync(SettingFilePath).toString();
      writeFileSync(pathBackup, read);
    } catch (error) {
      logger.error("Backup setting", error);
    }

    saveDefault();
  }
  logger.info(
    `Retrieved settings:${JSON.stringify({
      ...settings,
      favIcon: settings.favIcon
        ? `${settings.favIcon?.substring(0, 38)}...`
        : undefined,
    })}`
  );
  return settings;
}

export function getAccessSettings(settings: Settings): AccessFileSettings {
  return {
    whitelistEntries: getWhitelistEntries(settings),
    bannedIpEntries: getBannerIpEntries(settings),
    bannedPlayerEntries: getBannerPlayerEntries(settings),
  };
}

export function getWhitelistEntries(
  settings: Settings
): WhitelistEntry[] | undefined {
  return loadFile(WhitelistFilePath, "whitelist entries", settings);
}

export function getBannerIpEntries(
  settings: Settings
): BannedIpEntry[] | undefined {
  return loadFile(BannedIpsFilePath, "banned ips", settings);
}

export function getBannerPlayerEntries(
  settings: Settings
): BannedPlayerEntry[] | undefined {
  return loadFile(BannedPlayersFilePath, "banned players", settings);
}

export function applyNativeProperties(settings: Settings) {
  const properties = PropertiesReader(
    path.join(getMinecraftDirectory(settings), NativePropertiesFilePath)
  );

  logger.info(`Loaded server.properties: ${JSON.stringify(properties)}`);

  const portProperty = properties.get("query.port");
  const maxPlayersProperty = properties.get("max-players");
  const serverOnlineModeProperty = properties.get("online-mode");
  const useWhitelistFileProperty = properties.get("white-list");
  if (portProperty) {
    settings.serverPort = portProperty.valueOf() as number;
  }
  if (maxPlayersProperty) {
    settings.maxPlayers = maxPlayersProperty.valueOf() as number;
  }
  if (serverOnlineModeProperty) {
    settings.serverOnlineMode = serverOnlineModeProperty.valueOf() as boolean;
  }
  if (useWhitelistFileProperty) {
    settings.useWhitelistFile = useWhitelistFileProperty.valueOf() as boolean;
  }
  settings.useBlacklistFiles = true;
}
