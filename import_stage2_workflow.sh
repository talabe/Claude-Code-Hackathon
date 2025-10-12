#!/bin/bash
# Import Stage 2 workflow into N8N

set -e

WORKFLOW_FILE="/home/talab/sliderx-n8n/workflows/stage2_complete_workflow.json"
N8N_CONTAINER="sliderx-n8n"

echo "========================================="
echo "Stage 2 Workflow Import Tool"
echo "========================================="
echo ""

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi
echo "✓ Workflow file found"

# Check if N8N container is running
if ! docker ps | grep -q "$N8N_CONTAINER"; then
    echo "❌ N8N container not running"
    exit 1
fi
echo "✓ N8N container is running"

# Copy workflow file into container
echo ""
echo "Copying workflow file into N8N container..."
docker cp "$WORKFLOW_FILE" "$N8N_CONTAINER:/tmp/stage2_workflow.json"
echo "✓ Workflow copied"

# Import using N8N CLI
echo ""
echo "Importing workflow via N8N CLI..."
docker exec "$N8N_CONTAINER" n8n import:workflow --input=/tmp/stage2_workflow.json --separate 2>&1 | head -20

# Check if webhook is active
echo ""
echo "Checking webhook registration..."
sleep 2
curl -s http://localhost:5678/webhook/sliderx-stage2 -X POST -H "Content-Type: application/json" -d '{"test":"test"}' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Webhook endpoint is responding"
else
    echo "⚠ Webhook endpoint may not be active yet"
fi

echo ""
echo "========================================="
echo "Import complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Open N8N UI: http://localhost:5678"
echo "2. Find 'SlideRx Stage 2 - Final Presentation Generation' workflow"
echo "3. Activate the workflow"
echo "4. Configure credentials if needed:"
echo "   - AWS S3 credentials"
echo "   - OpenRouter API credentials"
echo ""
echo "Test with:"
echo "  python3 debug_stage2.py --test-full"
