<div align="center">
    <img src="https://raw.githubusercontent.com/vincss/mcsleepingserverstarter/master/docs/sleepingserver.png">
    <h1>💤 Welcome to SleepingServerStarter 💤</h1>
    <p>
    Put your minecraft server to rest, while SleepingServerStarter is watching! Save power, save the world!
    </p>
    <p>

[Tutorial Video](https://youtu.be/WqvQISpr6-s) | [Based on minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) | [Based on JSPrismarine](https://github.com/JSPrismarine/JSPrismarine) | [Original idea](https://github.com/tustin2121/MCSignOnDoor)
</p>
</div>

## 🧰 Features

- Listen on the same port as your minecraft server.
    - Option to connect from BedRock *(Portable version of Minecraft)*
    - Web-gui, to turn on or off your server from anywhere
- When someone connects, immediately launch your minecraft server.
    - You can also type 'quit' in your console to start minecraft's server.

**Works better with [EmptyServerStopper](https://github.com/vincss/mcEmptyServerStopper), a plugin that automatically
stops your server after a definied amount of time**

## 📀 Install

There are two ways to run SleepingServerStarter :

### Download the binaries

1. [Download binaries](./releases/latest) corresponding to your OS
2. Place the executable in the same folder as your server file (`spigot.jar`, `paper.jar`, etc...)
3. Make sure your server is stopped
4. Run the executable
    - On Linux, try `chmod +x mcsleepingserverstarter-linux-x64` if you can't run the executable

### Manually install and compile

0. Requires [NodeJS](https://nodejs.org/en/) v16+
1. Clone the repo or download the project as Zip
2. Unzip or clone it **in the same folder as your minecraft server**
3. Launch `npm install`
4. Start the project with `npm start`

### 🐡 PufferPanel

If you're using PufferPanel, you can import [this template](./docs/pufferpanel.json) as JSON to use Paper Spigot with
Sleeping Server Starter via PufferPanel

### 🐦 Pterodactyl

If you're using Pterodactyl, you can import [this egg](./docs/egg-paper-mcsleepingserverstarter.json) as JSON to use
Paper Spigot with Sleeping Server Starter OR you can also
import [this egg](./docs/egg-vanilla-minecraft-mcsleepingserverstarter.json) as JSON to use Vanilla Minecraft with
Sleeping Server Starter on Pterodactyl

Pterodactyl can be installed
via [Unofficial pterodactyl-installer](https://github.com/vilhelmprytz/pterodactyl-installer)

## ⚙️ Settings

> Note: If running from binaries, the settings file will be created after the first execution in the same folder as the
> executable

| Setting                     | Description                                                                                                                                                                                                     | Default value                                   |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| `serverName`                | The name of your server                                                                                                                                                                                         | "SleepingServer, waiting for his prince..."     |
| `serverPort`                | The port of your Java Edition server (0 to disable)                                                                                                                                                             | 25565                                           |
| `bedrockPort`               | The port of your Bedrock Edition server (0 to disable)                                                                                                                                                          | 19132                                           |
| `loginMessage`              | Message shown when the server is off and someone is trying to connect                                                                                                                                           | "...Waking server up, come back in a minute..." |
| `serverOnlineMode`          | Check if players has premium accounts                                                                                                                                                                           | true                                            |
| `maxPlayers`                | Maximum amount of players                                                                                                                                                                                       | 20                                              |
| `webPort`                   | Port for the Web-Gui (0 to disable)                                                                                                                                                                             | 0                                               |
| `webStopOnStart`            | Stop the web-server when minecraft starts                                                                                                                                                                       | false                                           |
| `webServeDynmap`            | true or an absolute path to enable it, by default it will serve './plugins/dynmap/web/'. You can specify an absolute path to serve instead. [How use with dynamp](./wiki/Use-internal-SSS-WebServer-for-dynmap) | false                                           |
| `startMinecraft`            | Start the Minecraft Server (false to disable)                                                                                                                                                                   | true                                            |
| `minecraftCommand`          | The command used to start the server                                                                                                                                                                            | "java -jar paper.jar nogui"                     |
| `preventStop`          | Prevent the user to stop the server (trought web-server or cli).                                                                                                                                                                            | false                     |
| `minecraftWorkingDirectory` | Set a custom Working Directory for the server **EDIT ONLY IF YOU KNOW WHAT YOU'RE DOING** (should be the path to the server's directory, absolute path is best)                                                 | ""                                              |
| `version`                   | Force compatibility with a specific Minecraft version                                                                                                                                                           | ""                                              |
| `favIcon`                   | Use a custom server-icon 64x64 png converted using https://www.base64-image.de/ (needs to be encoded in base64)                                                                                                 | ""                                              |
| `discordWebhookUrl`         | Setup a [Discord WebHook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) to your channel                                                                                            | "REPLACE_ME"                                    |
| `blackListedAddress`        | Prevent connections from thoses addresses to wake up the server                                                                                                                                                 | ["127.0.0.1"]                                   |

> Note: if you need to shutdown the program, simply input a `ctrl + c`, the program will shut down normally afterwards

-----

#### Use WebServer for dynmap

- [How use with dynamp](https://github.com/vincss/mcsleepingserverstarter/wiki/Use-internal-SSS-WebServer-for-dynmap)

#### Links :

- Icons: https://www.flaticon.com/free-icon/geyser_1842245
- Image encoder: https://www.base64-image.de/

## 🕸 Bungeecord

While SleepingServerStarter is made to run on a single server, it can be integrated to a Bungeecord network. **But
please note that you'll need to install and configure SleepingServerStarter on every servers you want to be affected by
the program.**

Installing SleepingServerStarter only on your proxy server <u>**will NOT work**</u>

For each server you're installing SleepingServerStarter on :

- the `serverPort` should be the port of the server you're installing the program on, not the proxy's port
- make sure `serverOnlineMode` is set to `false` to avoid any problems with Bungee when switching between servers

We know this can be a little bit time consuming, but this solution is working great

#### In action :

When trying to join a sleeping server, you get this kind of message by Bungee<br/>
Basically, it keeps kicking the player with `loginMessage` as reason, telling the player the server is being started

![](./docs/bungeeStartingExample.png)

## 👤 Author

**[@vincss](https://github.com/vincss)**

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](./issues)

## 🙌 Show your support

Give a ⭐️ if you like the project!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/vincss)

## 📜 ChangeLog

* 1.3.0 - 1.19.3 :
    - add blackListedAddress parameters
    - add dynmap
    - add preventStop
    - update minecraft-protocol: 1.40.3
* 1.2.6 - 1.19.3 :
    - update third-parties
* 1.2.5 - 1.19.3 :
    - update minecraft-protocol for MC 1.19.3
* 1.2.4 - 1.19.2 :
    - update minecraft-protocol for MC 1.19.2 (no 1.19.3 yet)
* 1.2.3 - 1.19 :
    - update to Node18
* 1.2.2 - 1.19 :
    - add arm64 builds (Raspberry Pi)
* 1.2.1 - 1.19 :
    - update node-minecraft-protocol for MC 1.19 (no 1.19.1 & 1.19.2 yet)
* 1.2.0 - 1.18.2 :
    * Add settings webStopOnStart
    * Change settings startMinecraft to boolean
* 1.1.5 - 1.18.2 :
    * Add more logs when it fails to retreive settings
    * update node-minecraft-protocol ^1.34.0
* 1.1.4 - 1.18.2 :
    * update node-minecraft-protocol ^1.32.0
* 1.1.3 - 1.18.1 :
    * Fixed concurent wake up : ./issues/68
    * update node-minecraft-protocol ^1.30.0
* 1.1.2 - 1.18.1 :
    * Compress binaries ( GZip )
* 1.1.1 - 1.18.1 :
    * update node-minecraft-protocol ^1.29.0 -> 1.18.1
* 1.1.0 - 1.17.1 :
    * **Feature** Add Discord Notification
    * Update dependencies (node16, npm8, typescript,...)
* 1.0.4 - 1.17.1 :
    * update node-minecraft-protocol ^1.26.1
* 1.0.3 - 1.16.5 :
    * update security
* 1.0.2 - 1.16.5 :
    * add maxPlayers in settings
* 1.0.1 - 1.16.5 :
    * Include version in log.
* 1.0.0 - 1.16.5 :
    * **Feature** Add web-gui
* 1.16.4 :
    * Add bedrock support.
* ...
