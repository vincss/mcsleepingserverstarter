import express, { Express } from 'express';
import { existsSync } from 'fs';
import { engine } from 'express-handlebars';
import * as http from 'http';
import path from 'path';
import { SleepingContainer } from './sleepingContainer';
import { getFavIcon, getMOTD, ServerStatus } from './sleepingHelper';
import { getLogger, LoggerType } from './sleepingLogger';
import { ISleepingServer } from './sleepingServerInterface';
import { Settings } from './sleepingSettings';
import { PlayerConnectionCallBackType } from './sleepingTypes';

export class SleepingWeb implements ISleepingServer {
  settings: Settings;
  sleepingContainer: SleepingContainer;
  playerConnectionCallBack: PlayerConnectionCallBackType;
  logger: LoggerType;
  app: Express;
  server?: http.Server;
  webPath = '';

  constructor(settings: Settings, playerConnectionCallBack: PlayerConnectionCallBackType, sleepingContainer: SleepingContainer) {
    this.settings = settings;
    if (this.settings.webSubPath) {
      this.webPath = this.settings.webSubPath;
    }
    this.playerConnectionCallBack = playerConnectionCallBack;
    this.sleepingContainer = sleepingContainer;
    this.logger = getLogger();
    this.app = express();
  }

  init = async () => {

    this.app.engine('hbs', engine({
      defaultLayout: 'main',
      layoutsDir: path.join(__dirname, './views/layouts/'),
      extname: '.hbs',
      helpers: {
        title: () => { return getMOTD(this.settings, 'plain') },
        motd: () => { return getMOTD(this.settings, 'html') },
        favIcon: () => { return getFavIcon(this.settings) },
        stylesheet: () => { return `${this.webPath}/layouts/main.css` },
      }
    }));

    this.app.set('view engine', 'hbs');
    this.app.use(`${this.webPath}/layouts`, express.static(path.join(__dirname, './views/layouts')));
    this.app.use(`${this.webPath}/res`, express.static(path.join(__dirname, './views/res')));

    if (this.settings.webServeDynmap) {
      let dynmapPath;
      if (typeof this.settings.webServeDynmap === 'string') {
        dynmapPath = this.settings.webServeDynmap;
      } else {
        const mcPath = this.settings.minecraftWorkingDirectory ?? process.cwd();
        dynmapPath = path.join(mcPath, 'plugins/dynmap/web');
      }
      this.logger.info(`[WebServer] Serving dynmap: ${dynmapPath}`);
      if (existsSync(dynmapPath)) {
        this.app.use(`${this.webPath}/dynmap`, express.static(dynmapPath));
      } else {
        this.logger.error(`Dynmap directory at ${dynmapPath} does not exist!`);
      }
    }

    this.app.get(`${this.webPath}/`, (req, res) => {
      res.render(path.join(__dirname, './views/home'), { message: this.settings.loginMessage });
    });

    this.app.post(`${this.webPath}/wakeup`, async (req, res) => {
      res.send('received');

      const currentStatus = await this.sleepingContainer.getStatus();
      switch (currentStatus) {
        case ServerStatus.Sleeping: {
          this.logger.info(`[WebServer](${req.socket.remoteAddress}) Wake up server was ${currentStatus}`);
          this.playerConnectionCallBack('A WebUser');
        }
          break;
        case ServerStatus.Running: {
          this.logger.info(`[WebServer](${req.socket.remoteAddress}) Stopping server was ${currentStatus}`);
          this.sleepingContainer.killMinecraft();
        }
          break;
        case ServerStatus.Starting: {
          this.logger.info(`[WebServer](${req.socket.remoteAddress}) Doing nothing server was ${currentStatus}`);
        }
          break;
        default: {
          this.logger.warn(`[WebServer](${req.socket.remoteAddress}) Server is ?! ${currentStatus}`);
        }
      }


    })

    this.app.get(`${this.webPath}/status`, async (req, res) => {
      const status = await this.sleepingContainer.getStatus()
      res.json({ status, dynmap: this.settings.webServeDynmap });
    });

    this.server = this.app.listen(this.settings.webPort, () => {
      this.logger.info(`[WebServer] Starting web server on *: ${this.settings.webPort}`);
    })
  };

  close = async () => {
    if (this.server) {
      this.server.close();
    }
  };

}