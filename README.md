<div align="center">
    <img src="https://raw.githubusercontent.com/vincss/mcsleepingserverstarter/master/views/res/sleepingserver.png">
    <h1>Welcome to SleepingServerStarter 💤</h1>
    <p>
    Put your minecraft server to rest, while SleepingServerStarter is watching! Save power, save the world!
    </p>
</div>

## 🧰 Features

- Listen on the same port as your minecraft server.
  - Option to connect from BedRock *(Portable version of Minecraft)*
  - Web-gui, to turn on or off your server from anywhere
- When someone connects, immediately launch your minecraft server

**Works better with [EmptyServerStopper](https://www.spigotmc.org/resources/emptyserverstopper.19409/), a plugin that automatically stops your server after a definied amount of time**

## 📀 Install

There are two ways to run SleepingServerStarter :

### Download the binaries

1. [Download binaries](https://github.com/vincss/mcsleepingserverstarter/releases/latest) corresponding to your OS
2. Place the executable in the same folder as your server file (`spigot.jar`, `paper.jar`, etc...)
3. Make sure your server is stopped
4. Run the executable
    - On Linux, try `chmod +x sleepingServerStarter.run` if you can't run the executable

### Manually install and compile

0. Requires [NodeJS](https://nodejs.org/en/) v14+
1. Clone the repo or download the project as Zip
2. Unzip or clone it **in the same folder as your minecraft server**
3. Launch `npm install`
4. Start the project with `npm start`

## ⚙️ Settings
> Note: If running from binaries, the settings file will be created after the first execution in the same folder as the executable

| Setting                     | Description                                                                                                                                                     | Default value                                   |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| `serverName`                | The name of your server                                                                                                                                         | "SleepingServer, waiting for his prince..."     |
| `serverPort`                | The port of your Java Edition server                                                                                                                            | 25565                                           |
| `bedrockPort`               | The port of your Bedrock Edition server                                                                                                                         | 19132                                           |
| `loginMessage`              | Message shown when the server is off and someone is trying to connect                                                                                           | "...Waking server up, come back in a minute..." |
| `serverOnlineMode`          | Check if players has premium accounts                                                                                                                           | true                                            |
| `maxPlayers`                | Maximum amount of players                                                                                                                                       | 20                                              |
| `webPort`                   | Port for the Web-Gui (0 to disable)                                                                                                                             | 0                                               |
| `startMinecraft`            | Start the Minecraft Server (0 to disable)                                                                                                                       | 1                                               |
| `minecraftCommand`          | The command used to start the server                                                                                                                            | "java -jar paper.jar nogui"                     |
| `minecraftWorkingDirectory` | Set a custom Working Directory for the server **EDIT ONLY IF YOU KNOW WHAT YOU'RE DOING** (should be the path to the server's directory, absolute path is best) | ""                                              |
| `version`                   | Force compatibility with a specific Minecraft version                                                                                                           | ""                                              |
| `favIcon`                   | Use a custom server-icon 64x64 png converted using https://www.base64-image.de/ (needs to be encoded in base64)                                                 | ""                                              |

-----

#### Use WebServer for dynmap :
- You need to change your configuration from class: `org.dynmap.InternalClientUpdateComponent` to class `org.dynmap.JsonFileClientUpdateComponent` *(comment all the section InternalClientUpdateComponent and uncomment JsonFileClientUpdateComponent)*
- Chat will not work when hosted by mcsleepingserverstarter. For a full compatibilty, you can use an apache server *(https://github.com/webbukkit/dynmap/wiki/Setting-up-without-the-Internal-Web-Server)*


#### Links :
- Icons: https://www.flaticon.com/free-icon/geyser_1842245
- Image encoder: https://www.base64-image.de/

## 👤 Author

**[@vincss](https://github.com/vincss)**

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/vincss/mcsleepingserverstarter/issues)

## 🙌 Show your support

Give a ⭐️ if you like the project!
