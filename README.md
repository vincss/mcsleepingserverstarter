# mcsleepingserverstarter
Put your minecraft server to rest, while SleepingServerStarter is watching ! Save power, save the world !

What it does :
* Listen on the same port as your minecraft server.
* When someone connects, exit and launch your minecraft server.
* When server is stopping (by EmptyServerStopper by example), watch until someone reconnects.

Tutorial Video :
https://youtu.be/WqvQISpr6-s

Based on : 
https://github.com/PrismarineJS/node-minecraft-protocol

With an original idea from https://github.com/tustin2121/MCSignOnDoor

Require (if install from source) :
NodeJs (^14.*) & NPM
  * Windows : https://nodejs.org/en/download/ 
  * Linux : https://github.com/nodesource/distributions#debinstall
  * EmptyServerStopper to stop your server when nobody is there : https://github.com/vincss/mcEmptyServerStopper

* Install :
    * From Source
        * Download this repository as zip.
        * Unzip it at your minecraft's root.
        * Launch "npm install", to restore the needed package.
        * Start using "npm start".
    * From Binaries
        * Download binaries depending on your system.
        * Place the executable next to your server file (rename it to spigot.jar ).
        * (For linux, maybe a "chmod +x sleepingServerStarter.run", will be required, play tell me if it's work :-) ).
        * Make sure your server is stopped.
        * Run the executable.
 
Update :
 * Run "npm update" to update packages (minecraft protocol could need some updates).

Use WebServer for dynmap :
 * You need to change your configuration from class: org.dynmap.InternalClientUpdateComponent to class: org.dynmap.JsonFileClientUpdateComponent (comment all the section InternalClientUpdateComponent and uncomment JsonFileClientUpdateComponent).
 * Chat will not work when hosted by mcsleepingserverstarter. For a full compatibilty, you can use an apache server. https://github.com/webbukkit/dynmap/wiki/Setting-up-without-the-Internal-Web-Server
