#!/bin/bash

echo "📦 Installing all dependencies for AI Rate Limit project..."
echo ""

cd "$(dirname "$0")/.."

# Backend
echo "🔧 Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ Backend installation failed"
  exit 1
fi
echo "✅ Backend dependencies installed"
echo ""

# Dashboard
echo "🎨 Installing dashboard dependencies..."
cd dashboard
npm install
if [ $? -ne 0 ]; then
  echo "❌ Dashboard installation failed"
  exit 1
fi
cd ..
echo "✅ Dashboard dependencies installed"
echo ""

echo "🎉 All dependencies installed!"
echo ""
echo "📝 Next steps:"
echo "   1. Copy env.example to .env and configure it"
echo "   2. Start PostgreSQL: docker run --name ai-proxy-db -e POSTGRES_PASSWORD=\$(openssl rand -base64 24) -e POSTGRES_DB=ai_proxy -p 5433:5432 -d postgres:15"
echo "   3. Start all servers: npm run start"
echo ""

