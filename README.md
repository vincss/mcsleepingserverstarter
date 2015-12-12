# mcsleepingserverstarter
Put your minecraft server to rest, while SleepingServerStarter is watching !

Based on : 
https://github.com/PrismarineJS/node-minecraft-protocol

With an original idea from https://github.com/tustin2121/MCSignOnDoor

Require :
NodeJs & NPM
  * https://nodejs.org/en/download/
  * https://doc.ubuntu-fr.org/nodejs
  * EmptyServerStopper to stop your server : http://dev.bukkit.org/bukkit-plugins/emptyserverstopper/

Install :
 * Download this repository as zip.
 * Unzip it at your minecraft's root.
 * Launch "npm install", to restore the needed package.
 * Start using "node sleepingServerStarter.js" or "nodejs sleepingServerStarter.js".

Use WebServer for dynmap :
 * You need to change your configuration from class: org.dynmap.InternalClientUpdateComponent to class: org.dynmap.JsonFileClientUpdateComponent (comment all the section InternalClientUpdateComponent and uncomment JsonFileClientUpdateComponent).
 * Chat will not work when hosted by mcsleepingserverstarter.

https://github.com/webbukkit/dynmap/wiki/Setting-up-without-the-Internal-Web-Server
