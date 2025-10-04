#!/bin/bash
# Quick start script for SlideRx

echo "Starting SlideRx services..."

# Check if .env exists
if [ ! -f "/opt/sliderx/.env" ]; then
    echo "Please create .env file from .env.example"
    exit 1
fi

# Start Redis
sudo systemctl start redis-server

# Start backend
cd /opt/sliderx/backend
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pm2 start "python app.py" --name sliderx-backend

# Start frontend
cd /opt/sliderx/frontend
npm install
pm2 start "npm run dev" --name sliderx-frontend

echo "Services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo ""
echo "Use 'pm2 status' to check services"
echo "Use 'pm2 logs' to view logs"
