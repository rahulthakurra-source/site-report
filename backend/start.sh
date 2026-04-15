#!/bin/bash

# Site Monitoring Software - Quick Start Script

echo "================================================"
echo "  🏗️  Site Monitoring Software - Quick Start"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found!"
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env file and add your Anthropic API key!"
    echo "Get your API key from: https://console.anthropic.com/"
    echo ""
    read -p "Press Enter to continue (make sure to set your API key first)..."
fi

# Start the server
echo "🚀 Starting backend server..."
echo ""
npm start
