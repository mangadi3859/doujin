#!/bin/sh
#==Install Node V.14==
service apache2 stop
apt install curl -y
apt install nginx -y
apt install nano -y
curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt install nodejs -y
#==Install Package==
npm i
npm i -g pm2
cp /root/doujin/default /etc/nginx/sites-available/default
echo 'Setup Done,Run pm2 start index.js --name Doujin'
