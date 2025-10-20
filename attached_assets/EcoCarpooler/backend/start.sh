#!/bin/bash

# Create MongoDB data directory
mkdir -p /tmp/mongodb

# Start MongoDB if not already running
if ! pgrep -x "mongod" > /dev/null; then
    mongod --dbpath /tmp/mongodb --bind_ip 127.0.0.1 --port 27017 --fork --logpath /tmp/mongodb/mongodb.log
    echo "MongoDB started"
    sleep 2
else
    echo "MongoDB already running"
fi

# Start Node.js server
npm install
node server.js
