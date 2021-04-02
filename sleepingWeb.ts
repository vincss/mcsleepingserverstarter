import express, { Express } from 'express';
import exphbs from 'express-handlebars';
import * as http from 'http';

import { ISleepingServer } from "./sleepingServerInterface";
import { DefaultFavIconString, Settings } from "./sleepingSettings";
import { getLogger, LoggerType } from './sleepingLogger';

export class SleepingWeb implements ISleepingServer {
  settings: Settings;
  logger: LoggerType;
  playerConnectionCallBack: () => void;
  app: Express;
  server?: http.Server;

  constructor(settings: Settings, playerConnectionCallBack: () => void) {
    this.settings = settings;
    this.playerConnectionCallBack = playerConnectionCallBack;
    this.logger = getLogger();
    this.app = express();
  }

  init = async () => {

    this.app.engine('hbs', exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
      helpers: {
        title: () => { return this.settings.serverName },
        favIcon: () => { return this.settings.favIcon || DefaultFavIconString },
      }
    }));

    this.app.set('view engine', 'hbs');
    this.app.use(express.static('views'));

    this.app.get('/', (req, res) => {
      res.render('home', { message: this.settings.loginMessage });
    });

    this.app.post('/wakeup', (req, res) => {
      this.playerConnectionCallBack();
      res.send('received');
    })

    this.server = this.app.listen(this.settings.webPort, () => {
      this.logger.info(`Starting web server on *:${this.settings.webPort} webDir: ${this.settings.webDir}`);
    })

    /* 
    connect().use(serveStatic(this.settings.webDir)).listen(
        this.settings.webPort);
    this.logger.info(`Starting web server on *:${this.settings.webPort} webDir: ${this.settings.webDir}`); 
    */

  };

  close = async () => {
    if (this.server) {
      this.server.close();
    }
  };

}