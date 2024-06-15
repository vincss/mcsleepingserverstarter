import { ChildProcess, execSync, spawn } from "child_process";
import { type } from "os";
import { SleepingBedrock } from "./sleepingBedrock";
import { SleepingDiscord } from "./sleepingDiscord";
import {
  getMinecraftDirectory,
  isPortTaken,
  isAccessAllowed,
  ServerStatus,
} from "./sleepingHelper";
import { getLogger, LoggerType, version } from "./sleepingLogger";
import { SleepingMcJava } from "./sleepingMcJava";
import { ISleepingServer } from "./sleepingServerInterface";
import {
  getSettings,
  getAccessSettings,
  Settings,
  AccessFileSettings,
} from "./sleepingSettings";
import { Player, PlayerConnectionCallBackType } from "./sleepingTypes";
import { SleepingWeb } from "./sleepingWeb";

const isWindows = type().includes("Windows");

export class SleepingContainer implements ISleepingServer {
  logger: LoggerType;
  settings: Settings;
  accessSettings: AccessFileSettings;

  sleepingMcServer?: SleepingMcJava;
  mcProcess?: ChildProcess;
  brServer?: SleepingBedrock;
  webServer?: SleepingWeb;

  discord?: SleepingDiscord;

  isClosing = false;
  restartAsked?: boolean = false;

  constructor(callBack: (settings: Settings) => void) {
    this.logger = getLogger();
    this.settings = getSettings();
    this.accessSettings = getAccessSettings(this.settings);
    callBack(this.settings);
  }

  init = async (isThisTheBeginning = false) => {
    if (isThisTheBeginning || this.settings.webStopOnStart) {
      if (this.settings.webPort) {
        this.webServer = new SleepingWeb(
          this.settings,
          this.playerConnectionCallBack,
          this
        );
        await this.webServer?.init();
      }
    }

    if (this.settings.serverPort > 0) {
      this.sleepingMcServer = new SleepingMcJava(
        this.playerConnectionCallBack,
        this.settings,
        this.accessSettings
      );
      if (isThisTheBeginning && this.settings.minecraftAutostart) {
        this.startMinecraft();
      } else {
        await this.sleepingMcServer?.init();
      }
    }

    if (this.settings.bedrockPort) {
      this.brServer = new SleepingBedrock(
        this.settings,
        this.playerConnectionCallBack
      );
      await this.brServer?.init();
    }

    if (this.settings.discordWebhook?.url) {
      this.discord = new SleepingDiscord(this.settings);
    }
  };

  getSettings = () => {
    return this.settings;
  };

  launchMinecraftProcess = async (onProcessClosed: () => void) => {
    this.logger.info(
      `----------- [v${version}] Starting Minecraft : ${this.settings.minecraftCommand} ----------- `
    );

    if (this.settings.webPort && !this.settings.webStopOnStart) {
      const cmdArgs = this.settings.minecraftCommand.split(" ");
      const exec = cmdArgs.splice(0, 1)[0];

      this.mcProcess = spawn(exec, cmdArgs, {
        // To receive stop from kill on Windows
        stdio: isWindows ? ["overlapped", "inherit", "inherit"] : "inherit",
        cwd: getMinecraftDirectory(this.settings),
      });

      this.mcProcess.on("close", (code) => {
        this.logger.info(
          `----------- [v${version}] Minecraft stopped ${code} -----------`
        );
        onProcessClosed();
      });
    } else {
      execSync(this.settings.minecraftCommand, {
        stdio: "inherit",
        cwd: getMinecraftDirectory(this.settings),
      });
      this.logger.info(
        `----------- [v${version}] Minecraft stopped -----------`
      );
      onProcessClosed();
    }
  };

  killMinecraft = (restartAsked?: boolean) => {
    if (this.settings.preventStop) {
      this.logger.info(`[Container] killMinecraft: preventStop is set.`);
      return;
    }

    if (isWindows) {
      const result = this.mcProcess?.stdin?.write("stop\n");
      this.logger.info(`[Container] killMinecraft`, result);
    } else {
      this.mcProcess?.kill();
    }
    this.restartAsked = restartAsked;
  };

  close = async (isThisTheEnd = false) => {
    this.logger.info("[Container] Cleaning up the place.");

    if (this.sleepingMcServer) {
      await this.sleepingMcServer.close();
    }

    if (this.brServer) {
      await this.brServer.close();
    }

    if (isThisTheEnd || this.settings.webStopOnStart) {
      if (this.webServer) {
        this.webServer.close();
      }
    }
  };

  playerConnectionCallBack: PlayerConnectionCallBackType = async (
    player: Player
  ) => {
    const accessStatus = isAccessAllowed(
      player,
      this.settings,
      this.accessSettings
    );
    if (!accessStatus.allowed) {
      this.logger.info(`[Container] ${player}: ${accessStatus.reason}.`);
      return;
    }

    if (this.isClosing) {
      this.logger.info(`[Container] ${player}: Server is already closing.`);
      return;
    }
    this.isClosing = true;

    if (this.settings.discordWebhookUrl && this.discord) {
      await this.discord.onPlayerLogging(player.playerName);
    }

    await this.close();
    this.isClosing = false;

    if (this.settings.startMinecraft) {
      this.startMinecraft();
    }
  };

  startMinecraft = () => {
    const onMcClosed = async () => {
      if (this.settings.discordWebhookUrl && this.discord) {
        await this.discord.onServerStop();
      }

      this.logger.info(
        `[Container] ...Time to kill me if you want (${
          this.settings.restartDelay / 1000
        } secs)...`
      );

      setTimeout(async () => {
        if (this.restartAsked) {
          this.restartAsked = false;
          this.logger.info(`[Container] Restart asked. Launching MC...`);
          this.launchMinecraftProcess(onMcClosed);
          return;
        }

        this.reloadSettings();
        this.logger.info("[Container] ...Too late !...");
        await this.init();
      }, this.settings.restartDelay); // restart sss server
    };

    this.launchMinecraftProcess(onMcClosed);
  };

  reloadSettings = () => {
    this.settings = getSettings();
    this.accessSettings = getAccessSettings(this.settings);
  };

  getStatus = async () => {
    let status = ServerStatus.Stopped;
    if (this.sleepingMcServer) {
      status = this.sleepingMcServer?.getStatus();
    }
    if (status !== ServerStatus.Sleeping) {
      const portTaken = await isPortTaken(this.settings.serverPort);
      if (portTaken) {
        status = ServerStatus.Running;
      } else {
        status = ServerStatus.Starting;
      }
    }
    return status;
  };
}
