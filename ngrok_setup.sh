#!/bin/bash
# setup-ngrok.sh - Expose N8N to internet via ngrok

echo "=========================================="
echo "Setting up ngrok for SlideRx N8N"
echo "=========================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "Installing ngrok..."
    
    # Download ngrok
    wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
    
    # Extract
    tar -xzf ngrok-v3-stable-linux-amd64.tgz
    
    # Move to bin
    sudo mv ngrok /usr/local/bin/
    
    # Clean up
    rm ngrok-v3-stable-linux-amd64.tgz
    
    echo "✅ ngrok installed"
fi

# Check if authtoken is set
echo ""
echo "Setting up ngrok authtoken..."
echo "Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken"
echo ""
read -p "Enter your ngrok authtoken: " NGROK_TOKEN

if [ -z "$NGROK_TOKEN" ]; then
    echo "❌ No token provided. Please run: ngrok authtoken YOUR_TOKEN"
    exit 1
fi

# Set authtoken
ngrok authtoken $NGROK_TOKEN

echo ""
echo "✅ ngrok configured"
echo ""

# Create ngrok config for multiple tunnels
cat > ~/ngrok.yml << EOF
version: "2"
authtoken: $NGROK_TOKEN
tunnels:
  n8n:
    proto: http
    addr: 5678
  pdf-services:
    proto: http
    addr: 8000
EOF

echo "Created ngrok config at ~/ngrok.yml"
echo ""
echo "=========================================="
echo "Starting ngrok tunnels..."
echo "=========================================="
echo ""
echo "This will create public URLs for:"
echo "  - N8N (port 5678)"
echo "  - PDF Services (port 8000)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start ngrok with both tunnels
ngrok start --all --config ~/ngrok.yml
