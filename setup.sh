#!/bin/bash
echo "========================================"
echo " Spotify Vinyl Viz - Project Setup"
echo "========================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/2] Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    exit 1
fi

echo
echo "[2/2] Setup complete!"
echo
echo "========================================"
echo " To start the development server, run:"
echo "   npm run dev"
echo "========================================"
