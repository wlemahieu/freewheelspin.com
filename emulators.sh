#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 20

# Function to gracefully stop Firebase emulators on exit
cleanup() {
  echo "🛑 Stopping Firebase emulators..."
  kill $EMULATOR_PID
  wait $EMULATOR_PID 2>/dev/null
  echo "✅ Emulators stopped gracefully."
  exit 0
}

# Function to wait until a specific port is open
wait_for_port() {
  local host=$1
  local port=$2
  echo "⏳ Waiting for $host:$port to be available..."
  while ! nc -z $host $port; do   
    sleep 1 # Wait for 1 second before checking again
  done
  echo "✅ $host:$port is now available!"
}

# Trap CTRL+C (SIGINT) for a clean shutdown
trap cleanup SIGINT SIGTERM

# Navigate to the functions directory and build
#cd ./functions
#npm run build
#cd ../

# Start Firebase emulators in the background
firebase emulators:start --project=freewheelspin-com &
EMULATOR_PID=$!

# Wait for Firestore Emulator (127.0.0.1:8086) & Authentication Emulator (127.0.0.1:9099)
wait_for_port "127.0.0.1" 8086
wait_for_port "127.0.0.1" 9099

# Seed Firestore database
# echo "🏗️  Seeding Firestore Database..."
# node populate-firestore.js

# Create Firebase Auth test user
# echo "🏗️  Creating Firebase Auth test user..."
# node populate-auth.js

# Keep script running until terminated
wait $EMULATOR_PID
