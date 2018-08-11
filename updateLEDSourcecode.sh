#!/bin/bash

shopt -s extglob
rm -r /led/js/!(node_modules)

wget -q -r ftp://led_dev:led@192.168.178.25/ -P /led/js/

mv /led/js/192.168.178.25/* /led/js/
rm -r /led/js/192.168.178.25/

echo "Wget Done"

chmod +x ./LED-Controller.js
chmod +x ./buffertest.js

cp ./LED-Controller.service /etc/systemd/system/
echo "Service copied"

systemctl daemon-reload
echo "Systemd Services reloaded"
echo "Done"