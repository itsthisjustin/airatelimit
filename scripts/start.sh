#!/bin/bash

echo "🚀 Starting AI Rate Limit servers..."

# ====================================
# SECURITY: Check for required environment
# ====================================
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "⚠️  No .env file found!"
  echo "   Copy env.example to .env and configure it:"
  echo "   cp env.example .env"
  exit 1
fi

# Source .env for local checks (filter out comments and empty lines)
set -a
source <(grep -v '^#' .env | grep -v '^$' | sed 's/\r$//')
set +a

# Warn about missing security configs
if [ -z "$JWT_SECRET" ]; then
  echo "⚠️  WARNING: JWT_SECRET not set in .env"
  echo "   Generate one with: openssl rand -hex 32"
fi

if [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-this" ]; then
  echo "❌ ERROR: You're using the example JWT_SECRET!"
  echo "   Generate a real one with: openssl rand -hex 32"
  exit 1
fi

# Create logs directory
mkdir -p logs

# Check if PostgreSQL is running
if ! docker ps | grep -q ai-proxy-db; then
  echo "⚠️  PostgreSQL container not running. Starting it..."
  docker start ai-proxy-db 2>/dev/null || {
    echo "❌ PostgreSQL container not found."
    echo ""
    echo "   To create a new container with a SECURE password:"
    echo ""
    echo "   # Generate a secure password"
    echo "   export DB_PASSWORD=\$(openssl rand -base64 24)"
    echo "   echo \"DB_PASSWORD: \$DB_PASSWORD\""
    echo ""
    echo "   # Create the container"
    echo "   docker run --name ai-proxy-db \\"
    echo "     -e POSTGRES_PASSWORD=\$DB_PASSWORD \\"
    echo "     -e POSTGRES_DB=ai_proxy \\"
    echo "     -p 5433:5432 \\"
    echo "     -d postgres:15"
    echo ""
    echo "   # Update your .env file with:"
    echo "   DATABASE_URL=postgresql://postgres:\$DB_PASSWORD@localhost:5433/ai_proxy"
    exit 1
  }
  echo "✅ PostgreSQL started"
  sleep 2
else
  echo "✅ PostgreSQL already running"
fi

# Start backend in background
echo "🔧 Starting backend API..."
npm run dev > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend.pid
echo "✅ Backend started (PID: $BACKEND_PID)"

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..30}; do
  if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    sleep 1  # Give it one more second to fully initialize
    break
  fi
  if [ $i -eq 30 ]; then
    echo "⚠️  Backend startup timeout. Check logs/backend.log"
  fi
  sleep 1
done

# Start dashboard in background
echo "🎨 Starting dashboard..."
cd dashboard
npm run dev > ../logs/dashboard.log 2>&1 &
DASHBOARD_PID=$!
echo $DASHBOARD_PID > ../.dashboard.pid
echo "✅ Dashboard started (PID: $DASHBOARD_PID)"

echo ""
echo "🎉 All servers started successfully!"
echo ""
echo "📊 Backend API:  http://localhost:3000"
echo "🖥️  Dashboard:    http://localhost:3001"
echo ""
echo "📝 Logs:"
echo "   Backend:   tail -f logs/backend.log"
echo "   Dashboard: tail -f logs/dashboard.log"
echo ""
echo "🛑 To stop: npm run stop"

