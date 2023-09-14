#!/bin/bash

USERNAME="minecraft"

cp /sleepingSettings.yml /mcsleepingserverstarter

# give control over to the non-root user
chown -R $USERNAME /mcsleepingserverstarter
chown -R $USERNAME /minecraft

# run mcsleeperstarter as non-root
cd /mcsleepingserverstarter
exec runuser -u $USERNAME ./mcsleepingserverstarter-bin
