#!/bin/bash

envsubst '$PROXY_ADDRESS' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
nginx -g 'daemon off;'