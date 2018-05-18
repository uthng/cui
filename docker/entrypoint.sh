#!/bin/sh

set +x

# Replace ${CONSUL_API_URL}
CONSUL_URL=$(echo ${CONSUL_API_URL} | sed -e 's/\//\\\//g')
sed -i 's/${CONSUL_API_URL}/'${CONSUL_URL}'/g' ./config.js

exec "$@"
