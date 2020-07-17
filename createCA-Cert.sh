#!/bin/bash

mkdir -p cert

openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -days 730 -out ca.crt -subj "/CN=$1/O=LED-Controller"