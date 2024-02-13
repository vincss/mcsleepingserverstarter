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

## ✅ Compatible versions

- Minecraft Java: up to
  1.20.2 [node-minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol)
- Bedrock: Waiting for third party compatibility ( you can use the web-gui as a
  workarround ) [JSPrismarine](https://github.com/JSPrismarine/JSPrismarine)

## 🧰 Features

- Listen on the same port as your minecraft server.
    - Option to connect from BedRock _(Portable version of Minecraft)_
    - Web-gui, to turn on or off your server from anywhere
- When someone connects, immediately launch your minecraft server.
    - You can also type 'quit' in your console to start minecraft's server.

**Works better with [EmptyServerStopper](https://github.com/vincss/mcEmptyServerStopper), a plugin
that automatically
stops your server after a definied amount of time**

## 📀 Install

There are multiple ways to run SleepingServerStarter:

### 📦 Download the binaries (easiest)

1. [Download binaries](https://github.com/vincss/mcsleepingserverstarter) corresponding to your OS
2. Place the executable in the same folder as your server file (`spigot.jar`, `paper.jar`, etc...)
3. Make sure your server is stopped
4. Run the executable
    - On Linux, try `chmod +x mcsleepingserverstarter-linux-x64` if you can't run the executable

### 📜 Manually install and compile

0. Requires [NodeJS](https://nodejs.org/en/) v16+
1. Clone the repo or download the project as Zip
2. Unzip or clone it **in the same folder as your minecraft server**
3. Launch `npm ci`
4. Start the project with `npm start`

### 🐋 Docker

SleepingServerStarter is available as a Docker
image: [ghcr.io/vincss/mcsleepingserverstarter](https://github.com/vincss/mcsleepingserverstarter/pkgs/container/mcsleepingserverstarter)

It supports both x64 and arm64 host system architectures.

For detailed examples and instructions for setup via
Docker, [see the wiki page here](https://github.com/vincss/mcsleepingserverstarter/wiki/Docker-Configuration).

### 🐡 PufferPanel

If you're using PufferPanel, you can import [this template](./docs/pufferpanel.json) as JSON to use
Paper Spigot with
Sleeping Server Starter via PufferPanel

### 🐦 Pterodactyl

If you're using Pterodactyl, you can
import [this egg](./docs/egg-paper-mcsleepingserverstarter.json) as JSON to use
Paper Spigot with Sleeping Server Starter OR you can also
import [this egg](./docs/egg-vanilla-minecraft-mcsleepingserverstarter.json) as JSON to use Vanilla
Minecraft with
Sleeping Server Starter on Pterodactyl

Pterodactyl can be installed
via [Unofficial pterodactyl-installer](https://github.com/vilhelmprytz/pterodactyl-installer)

## ⚙️ Settings

> Note: If running from binaries, the settings file will be created after the first execution in the
> same folder as the
> executable

| Setting                     | Description                                                                                                                                                                                                                              | Default value                                   |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| `serverName`                | The name of your server.<br>You can specify [colour codes](https://motd.gg) by using the `§` prefix (Does not work on Bedrock)                                                                                                           | "SleepingServer, waiting for his prince..."     |
| `serverMOTD`                | The MOTD to display for Minecraft Servers.<br>You can specify colour codes just as you can for `serverName`. Defaults to `serverName` if not set. (Still does not work on Bedrock)                                                       | Same as `serverName`                            |
| `serverPort`                | The port of your Java Edition server (0 to disable)                                                                                                                                                                                      | 25565                                           |
| `bedrockPort`               | The port of your Bedrock Edition server (0 to disable)                                                                                                                                                                                   | 19132                                           |
| `loginMessage`              | Message shown when the server is off and someone is trying to connect                                                                                                                                                                    | "...Waking server up, come back in a minute..." |
| `serverOnlineMode`          | Check if players has premium accounts                                                                                                                                                                                                    | true                                            |
| `maxPlayers`                | Maximum amount of players                                                                                                                                                                                                                | 20                                              |
| `useNativeFiles`            | Use Minecraft `server.properties` to overwrite `serverPort`, `maxPlayers`, `serverOnlineMode`, `useWhitelistFile`, and `useBlacklistFiles` properties                                                                                    | false                                           |
| `webPort`                   | Port for the Web-Gui                                                                                                                                                                                                                     | 0                                               |
| `webStopOnStart`            | Stop the web-server when minecraft starts                                                                                                                                                                                                | false                                           |
| `webServeDynmap`            | true or an absolute path to enable it, by default it will serve './plugins/dynmap/web/'. You can specify an absolute path to serve instead or an url to redirect to. [How use with dynamp](./wiki/Use-internal-SSS-WebServer-for-dynmap) | false                                           |
| `webSubPath`                | Set the path to the Web-GUI if serving from behind a reverse proxy                                                                                                                                                                       | ""                                              |
| `webAllowRestart`           | Add a button in the web-ui to restart the minecraft server proxy                                                                                                                                                                         | false                                           |
| `startMinecraft`            | Start the Minecraft Server (false to disable)                                                                                                                                                                                            | true                                            |
| `minecraftCommand`          | The command used to start the server                                                                                                                                                                                                     | "java -jar paper.jar nogui"                     |
| `minecraftAutostart`        | Automatically start the real server instead of the sleeping one                                                                                                                                                                          | false                                           |
| `restartDelay`              | Customise the delay between when the minecraft server stops and the sleeping server restarts ( to ensure conection are closed ) ( in milliseconds )                                                                                      | 5000                                            |
| `preventStop`               | Prevent the user to stop the server (trought web-server or cli).                                                                                                                                                                         | false                                           |
| `minecraftWorkingDirectory` | Set a custom Working Directory for the server **EDIT ONLY IF YOU KNOW WHAT YOU'RE DOING** (should be the path to the server's directory, absolute path is best)                                                                          | ""                                              |
| `version`                   | Force compatibility with a specific Minecraft. If set to false, it should handle any compatible version                                                                                                                                  | ""                                              |
| `favIconPath`               | Path to a PNG file to use as the server icon.<br>If this is set to `server-icon.png` then it will use the same icon as the server.                                                                                                       | ""                                              |
| `favIcon`                   | Use a custom server-icon 64x64 png converted using https://www.base64-image.de/ (needs to be encoded in base64)                                                                                                                          | ""                                              |
| `discordWebhookUrl`         | Setup a [Discord WebHook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) to your channel                                                                                                                     | "REPLACE_ME"                                    |
| `blackListedAddress`        | Prevent connections from those addresses to wake up the server                                                                                                                                                                           | ["127.0.0.1"]                                   |
| `whiteListedNames`          | Only allow people with their name on the white list to wake the server up                                                                                                                                                                | ["vincss"]                                      |
| `useWhitelistFile`          | Use Minecraft `whitelist.json` instead of the `whiteListedNames` property. Checks both username and UUID                                                                                                                                 | false                                           |
| `useBlacklistFiles`         | Use Minecraft `banned-ips.json` and `banned-players.json` to prevent players from waking up the server. Can be used together with `blackListedAddress` property                                                                          | false                                           |
| `hideIpInLogs`              | Hide the ip from the remote player in the logs                                                                                                                                                                                           | false                                           |
| `hideOnConnectionLogs`      | Hide 'A Prince has taken a quick peek' the logs                                                                                                                                                                                          | false                                           |
| `useLegacyLogin`            | use legacy "login" method from [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol/issues/1279#issuecomment-1878866611)                                                                                         | false                                           |

> Note: if you need to shutdown the program, simply input a `ctrl + c`, the program will shut down
> normally afterwards

---

#### Use WebServer for dynmap

- [How use with dynamp](https://github.com/vincss/mcsleepingserverstarter/wiki/Use-internal-SSS-WebServer-for-dynmap)

#### Links :

- Icons: https://www.flaticon.com/free-icon/geyser_1842245
- Image encoder: https://www.base64-image.de/

## 🕸 Bungeecord

While SleepingServerStarter is made to run on a single server, it can be integrated to a Bungeecord
network. **But
please note that you'll need to install and configure SleepingServerStarter on every servers you
want to be affected by
the program.**

Installing SleepingServerStarter only on your proxy server <u>**will NOT work**</u>

For each server you're installing SleepingServerStarter on :

- the `serverPort` should be the port of the server you're installing the program on, not the
  proxy's port
- make sure `serverOnlineMode` is set to `false` to avoid any problems with Bungee when switching
  between servers

We know this can be a little bit time consuming, but this solution is working great

#### In action :

When trying to join a sleeping server, you get this kind of message by Bungee<br/>
Basically, it keeps kicking the player with `loginMessage` as reason, telling the player the server
is being started

![](./docs/bungeeStartingExample.png)

## 👤 Author

**[@vincss](https://github.com/vincss)**

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to
check [issues page](./issues)

## 🙌 Show your support

Give a ⭐️ if you like the project!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/vincss)

## 📜 ChangeLog

- 1.9.1 - 1.20.2 :
    - add useLegacyLogin parameter, to use old login internally
- 1.9.0 - 1.20.1 :
    - add useWhitelistFile parameter to switch to whitelist.json instead of whiteListedNames (thanks
      to spanasiuk)
    - add useBlacklistFiles parameter to use banned-ips.json and banned-players.json (thanks to
      spanasiuk)
    - add useNativeFiles parameter to use server.properties for getting serverPort, maxPlayers,
      serverOnlineMode, useWhitelistFile, and useBlacklistFiles properties (thanks to spanasiuk)
    - change stdio streams on Windows when web-gui is used.
- 1.8.0 - 1.20.1 :
    - add webAllowRestart parameter
    - add minecraftAutostart parameter
    - add restartDelay parameter
- 1.7.1 - 1.20.1 :
    - Run mcsleeperstarter as a non-root user within the docker container
- 1.7.0 - 1.20.1 :
    - [Feature] Added serverMOTD setting ( thanks to gavinhsmith )
    - [UX] Made the Sleep button disappear while server is online when "preventStop" is true (
      thanks to gavinhsmith )
- 1.6.0 - 1.20.1 :
    - add hideOnConnectionLogs parameter
    - update minecraft-protocol: 1.43.2 ( minecraft 1.20.1 )
- 1.5.13 - 1.20.1 :
    - add environement variable DISABLE_FILE_LOGS to disable file logs
- 1.5.12 - 1.20.1 :
    - update minecraft-protocol: 1.43.0 ( minecraft 1.20.1 )
- 1.5.11 - 1.19.4 :
    - update minecraft-protocol: 1.42.0 ( minecraft 1.19.4 )
- 1.5.10 - 1.19.3 :
    - webServeDynmap setting can be set to an url
- 1.5.9 - 1.19.3 :
    - backup config file before setting to default
- 1.5.8 - 1.19.3 :
    - reload settings on restart
- 1.5.7 - 1.19.3 :
    - restart on 'uncaughtException'
- 1.5.6 - 1.19.3 :
    - do not exit on 'uncaughtException'
- 1.5.5 - 1.19.3 :
    - add hideIpInLogs parameter
- 1.5.4 - 1.19.3 :
    - add version number in start/stop minecraft
- 1.5.3 - 1.19.3 :
    - docker: copy only needed binary
- 1.5.2 - 1.19.3 :
    - docker: base image eclipse-temurin:17-jre-jammy
- 1.5.1 - 1.19.3 :
    - add docker generation (@markmetcalfe)
    - fix minecraftDirectory not being used as base path when serving dynmap via web GUI (
      @markmetcalfe)
- 1.5.0 - 1.19.3 :
    - add setting webSubPath
    - add more architectures builds
    - add setting favIconPath to use a png as icon.
    - handle motd in serverName
    - Thanks to markmetcalfe for thoses improvements
    - update minecraft-protocol: 1.41.2
- 1.4.1 - 1.19.3 :
    - update minecraft-protocol: 1.41.1
    - disable bedrock by default
    - add whiteListedNames
- 1.4.0 - 1.19.3 :
    - set option 'version' to false by default (it should handle any compatible version).
- 1.3.1 - 1.19.3 :
    - update minecraft-protocol: 1.41.0
- 1.3.0 - 1.19.3 :
    - add blackListedAddress parameters
    - add dynmap
    - add preventStop
    - update minecraft-protocol: 1.40.3
- 1.2.6 - 1.19.3 :
    - update third-parties
- 1.2.5 - 1.19.3 :
    - update minecraft-protocol for MC 1.19.3
- 1.2.4 - 1.19.2 :
    - update minecraft-protocol for MC 1.19.2 (no 1.19.3 yet)
- 1.2.3 - 1.19 :
    - update to Node18
- 1.2.2 - 1.19 :
    - add arm64 builds (Raspberry Pi)
- 1.2.1 - 1.19 :
    - update node-minecraft-protocol for MC 1.19 (no 1.19.1 & 1.19.2 yet)
- 1.2.0 - 1.18.2 :
    - Add settings webStopOnStart
    - Change settings startMinecraft to boolean
- 1.1.5 - 1.18.2 :
    - Add more logs when it fails to retreive settings
    - update node-minecraft-protocol ^1.34.0
- 1.1.4 - 1.18.2 :
    - update node-minecraft-protocol ^1.32.0
- 1.1.3 - 1.18.1 :
    - Fixed concurent wake up : ./issues/68
    - update node-minecraft-protocol ^1.30.0
- 1.1.2 - 1.18.1 :
    - Compress binaries ( GZip )
- 1.1.1 - 1.18.1 :
    - update node-minecraft-protocol ^1.29.0 -> 1.18.1
- 1.1.0 - 1.17.1 :
    - **Feature** Add Discord Notification
    - Update dependencies (node16, npm8, typescript,...)
- 1.0.4 - 1.17.1 :
    - update node-minecraft-protocol ^1.26.1
- 1.0.3 - 1.16.5 :
    - update security
- 1.0.2 - 1.16.5 :
    - add maxPlayers in settings
- 1.0.1 - 1.16.5 :
    - Include version in log.
- 1.0.0 - 1.16.5 :
    - **Feature** Add web-gui
- 1.16.4 :
    - Add bedrock support.
- ...
