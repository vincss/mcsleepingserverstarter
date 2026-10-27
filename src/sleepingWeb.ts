import express, { Express } from "express";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { engine } from "express-handlebars";
import * as http from "http";
import path from "path";
import { getAsset, getAssetKeys, isSea } from "node:sea";
import { tmpdir } from "node:os";
import { SleepingContainer } from "./sleepingContainer";
import {
  getFavIcon,
  getMOTD,
  getMinecraftDirectory,
  ServerStatus,
} from "./sleepingHelper";
import { getLogger, LoggerType } from "./sleepingLogger";
import { ISleepingServer } from "./sleepingServerInterface";
import { Settings } from "./sleepingSettings";
import { Player, PlayerConnectionCallBackType } from "./sleepingTypes";
import { Socket } from "node:net";

let seaViewsDirectory: string | undefined;

export class SleepingWeb implements ISleepingServer {
  settings: Settings;
  sleepingContainer: SleepingContainer;
  playerConnectionCallBack: PlayerConnectionCallBackType;
  logger: LoggerType;
  app: Express;
  server?: http.Server;
  webPath = "";

  constructor(
    settings: Settings,
    playerConnectionCallBack: PlayerConnectionCallBackType,
    sleepingContainer: SleepingContainer,
  ) {
    this.settings = settings;
    if (this.settings.webSubPath) {
      this.webPath = this.settings.webSubPath;
    }
    this.playerConnectionCallBack = playerConnectionCallBack;
    this.sleepingContainer = sleepingContainer;

    this.logger = getLogger();
    this.app = express();
  }

  getIp = (socket: Socket) => {
    return this.settings.hideIpInLogs ? "" : `(${socket.remoteAddress})`;
  };

  init = async () => {
    const viewsDirectory = getViewsDirectory();

    this.app.engine(
      "hbs",
      engine({
        defaultLayout: "main",
        layoutsDir: path.join(viewsDirectory, "layouts"),
        extname: ".hbs",
        helpers: {
          title: () => {
            return getMOTD(this.settings, "plain", true);
          },
          motd: () => {
            return getMOTD(this.settings, "html", true);
          },
          favIcon: () => {
            return getFavIcon(this.settings);
          },
          stylesheet: () => {
            return `${this.webPath}/layouts/main.css`;
          },
        },
      }),
    );

    this.app.set("view engine", "hbs");
    this.app.use(
      `${this.webPath}/layouts`,
      express.static(path.join(viewsDirectory, "layouts")),
    );

    this.app.use(
      `${this.webPath}/res`,
      express.static(path.join(viewsDirectory, "res")),
    );

    this.configureDynmap();

    this.app.get(`${this.webPath}/`, (req, res) => {
      res.render(path.join(viewsDirectory, "home"), {
        message: this.settings.loginMessage,
      });
    });

    this.app.post(`${this.webPath}/wakeup`, async (req, res) => {
      res.send("received");

      const currentStatus = await this.sleepingContainer.getStatus();
      switch (currentStatus) {
        case ServerStatus.Sleeping:
          {
            this.logger.info(
              `[WebServer]${this.getIp(
                req.socket,
              )} Wake up server was ${currentStatus}`,
            );
            this.playerConnectionCallBack(Player.web());
          }
          break;
        case ServerStatus.Running:
          {
            this.logger.info(
              `[WebServer]${this.getIp(
                req.socket,
              )} Stopping server was ${currentStatus}`,
            );
            this.sleepingContainer.killMinecraft();
          }
          break;
        case ServerStatus.Starting:
          {
            this.logger.info(
              `[WebServer]${this.getIp(
                req.socket,
              )} Doing nothing server was ${currentStatus}`,
            );
          }
          break;
        default: {
          this.logger.warn(
            `[WebServer]${this.getIp(req.socket)} Server is ?! ${currentStatus}`,
          );
        }
      }
    });

    this.app.post(`${this.webPath}/restart`, async (req, res) => {
      res.send("received");

      this.logger.info(`[WebServer]${this.getIp(req.socket)} Restart server`);

      this.sleepingContainer.killMinecraft(true);
    });

    this.app.get(`${this.webPath}/status`, async (req, res) => {
      const status = await this.sleepingContainer.getStatus();
      res.json({
        status,
        dynmap: this.settings.webServeDynmap,
        settings: {
          preventStop: this.settings.preventStop ?? false,
          webAllowRestart: this.settings.webAllowRestart,
        },
      });
    });

    this.server = this.app.listen(this.settings.webPort, () => {
      this.logger.info(
        `[WebServer] Starting web server on *: ${this.settings.webPort}`,
      );
    });
  };

  configureDynmap = () => {
    if (this.settings.webServeDynmap) {
      let dynmapPath;
      if (typeof this.settings.webServeDynmap === "string") {
        dynmapPath = this.settings.webServeDynmap;
        if (dynmapPath.includes("http")) {
          return;
        }
      } else {
        dynmapPath = path.join(
          getMinecraftDirectory(this.settings),
          "plugins/dynmap/web",
        );
      }
      this.logger.info(`[WebServer] Serving dynmap: ${dynmapPath}`);
      if (existsSync(dynmapPath)) {
        this.app.use(`${this.webPath}/dynmap`, express.static(dynmapPath));
      } else {
        this.logger.error(`Dynmap directory at ${dynmapPath} does not exist!`);
      }
    }
  };

  close = async () => {
    if (this.server) {
      this.server.close();
    }
  };
}

const getViewsDirectory = () => {
  if (!isSea()) {
    return path.join(__dirname, "views");
  }
  if (seaViewsDirectory) {
    return seaViewsDirectory;
  }

  const viewsDirectory = mkdtempSync(
    path.join(tmpdir(), "mcsleepingserverstarter-"),
  );
  for (const assetKey of getAssetKeys()) {
    if (!assetKey.startsWith("views/")) {
      continue;
    }

    const relativePath = assetKey.slice("views/".length);
    const assetPath = path.resolve(viewsDirectory, relativePath);
    if (!assetPath.startsWith(`${viewsDirectory}${path.sep}`)) {
      throw new Error(`Invalid embedded view path: ${assetKey}`);
    }
    mkdirSync(path.dirname(assetPath), { recursive: true });
    writeFileSync(assetPath, Buffer.from(getAsset(assetKey)));
  }

  process.once("exit", () => {
    rmSync(viewsDirectory, { recursive: true, force: true });
  });
  seaViewsDirectory = viewsDirectory;
  return viewsDirectory;
};
