import express, {Express} from 'express';
import eta from 'eta';

import { ISleepingServer } from "./sleepingServerInterface";
import { Settings } from "./sleepingSettings";
import { getLogger, LoggerType } from './sleepingLogger';

export class SleepingWeb implements ISleepingServer {
    settings: Settings;
    logger: LoggerType;
    playerConnectionCallBack: () => void;
    app: Express;



    constructor(settings: Settings, playerConnectionCallBack: () => void) {
        this.settings = settings;
        this.playerConnectionCallBack = playerConnectionCallBack;
        this.logger = getLogger();
        this.app = express();
    }

    init = async() => { 
        this.app.engine("eta", eta.renderFile)
        this.app.set("view engine", "eta")
        this.app.set("views", "./views")


        this.app.get("/", function (req, res) {
            res.render("template", {
              favorite: "Eta",
              name: "Ben",
              reasons: ["fast", "lightweight", "simple"]
            })
          })
          
          this.app.listen(this.settings.webPort,  () => {
            this.logger.info(`Starting web server on *:${this.settings.webPort} webDir: ${this.settings.webDir}`); 
          })

        /* 
        connect().use(serveStatic(this.settings.webDir)).listen(
            this.settings.webPort);
        this.logger.info(`Starting web server on *:${this.settings.webPort} webDir: ${this.settings.webDir}`); */

    };

    close = async() => {

    };

}