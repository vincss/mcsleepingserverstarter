# mcsleepingserverstarter
Put your minecraft server to rest, while SleepingServerStarter is watching ! 
Save power, save the world !

What it does :
* Listen on the same port as your minecraft server.
  * Added an option to connect from BedRock (Console version of minecraft)
  * Add a web-gui, to connect from anywhere.
* When someone connects, exit and launch your minecraft server.
* When server is stopping (by EmptyServerStopper by example), watch until someone reconnects.

![alt text](./views/res/sleepingserver.png?raw=true "SleepingWeb")

Tutorial Video :
https://youtu.be/WqvQISpr6-s

Based on : 
https://github.com/JSPrismarine/JSPrismarine

With an original idea from https://github.com/tustin2121/MCSignOnDoor

You can use :  
  * EmptyServerStopper to stop your server when nobody is there : https://github.com/vincss/mcEmptyServerStopper

## Install :
  * From Binaries
      * Download binaries depending on your system.
      * Place the executable next to your server file (rename it to spigot.jar / paper.jar ).
      * (For linux, maybe a "chmod +x sleepingServerStarter.run", will be required, tell me if it's work :-) ).
      * Make sure your server is stopped.
      * Run the executable.
  * From Source
      * Requirements
        * NodeJs (^14.*) & NPM
          * Windows : https://nodejs.org/en/download/ 
          * Linux : https://github.com/nodesource/distributions#debinstall
      * Download this repository as zip.
      * Unzip it at your minecraft's root.
      * Launch "npm install", to restore the needed package.
      * Start using "npm start".

## Settings :
 * If running from Binaries, the settings file will be created on the first run next to the executable.
 * [See sleepingSettings.yml](./sleepingSettings.yml) 

## Update :
 * Run "npm update" to update packages (minecraft protocol could need some updates).

## Use WebServer for dynmap :
 * You need to change your configuration from class: org.dynmap.InternalClientUpdateComponent to class: org.dynmap.JsonFileClientUpdateComponent (comment all the section InternalClientUpdateComponent and uncomment JsonFileClientUpdateComponent).
 * Chat will not work when hosted by mcsleepingserverstarter. For a full compatibilty, you can use an apache server. https://github.com/webbukkit/dynmap/wiki/Setting-up-without-the-Internal-Web-Server


## Links :
* Icons : https://www.flaticon.com/free-icon/geyser_1842245
* Image encoder : https://www.base64-image.de/

## ChangeLog  
  * 1.0.4 - 1.17.1 : 
    * update node-minecraft-protocol ^1.26.1
  * 1.0.3 - 1.16.5 : 
    * update security
  * 1.0.2 - 1.16.5 : 
    * add maxPlayers in settings 
  * 1.0.1 - 1.16.5 : 
    * Include version in log.
  * 1.0.0 - 1.16.5 : 
    * Add web-gui
  * 1.16.4 :
    * Add bedrock support.
  * ...
