#!/bin/bash

#################################################################################
# This little scripts will calculate the average startup time of your server	#
# and anounce it to the player that is waking up the server.			#
# It will do so by looking through the logfiles and finding the specific line 	#
# where it sais 'Done!' and some time that was needed for loading all your 	#
# files and chunks. 								#
#################################################################################
# mc_path is the absolute path to the folder containing your server files
mc_path="/opt/minecraft/1.18.1_paper"

# avg_startup_time is looking through the logs and calculating the average startup time
avg_startup_time=$(zgrep 'Done' $mc_path/logs/*.log* | egrep -v Geyser | tail -n 5 | awk '{print $5}' | sed 's/[()!s]//g' | awk '{x+=$1; next} END{printf "%3.1f\n",x/NR}')

# newLoginMessageLine is the line that the current line containing 'loginMessage' will get replaced with
# CAUTION: only change the part behind 'loginMessage: '
newLoginMessageLine="loginMessage: ...Waking server up, come back in ~$avg_startup_time seconds."

# sed replaces the whole line loginMessage is in with the 'newLoginMessageLine'
# CAUTION: only change if you know what you are doing. 
sed -i "s/.*loginMessage.*/$newLoginMessageLine/" $mc_path/sleepingSettings.yml
echo "Updated average startup time to: $avg_startup_time seconds."
