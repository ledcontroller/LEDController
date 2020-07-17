#!/bin/bash

openssl genrsa -out device.key 2048
openssl req -new -sha256 -key device.key -out device.csr -subj "/CN=$1/O=LED-Controller"
openssl x509 -sha256 -req -in device.csr -CA ca.crt -CAkey ca.key -days 730 -out device.crt -CAcreateserial