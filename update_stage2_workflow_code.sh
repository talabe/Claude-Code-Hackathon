#!/bin/bash
# Update Stage 2 workflow code directly in N8N database

set -e

DB_PATH="/home/talab/sliderx-n8n/n8n-data/database.sqlite"

echo "========================================="
echo "Update Stage 2 Workflow - Parse Function"
echo "========================================="
echo ""

# New function code with proper validation
NEW_FUNCTION_CODE="// Parse incoming API payload with full context
const body = \$input.item.json.body;

// Extract all required data
const projectId = body.projectId;
const userId = body.userId;
const s3Key = body.s3Key;
const projectBrief = body.projectBrief || {};
const summary = body.summary || {};
const reviewAndRefine = body.reviewAndRefine || [];

// Extract user answers from reviewAndRefine with validation
let targetAudience = '';
let coreMessage = '';
let businessGoal = '';

if (Array.isArray(reviewAndRefine)) {
  const targetAudQ = reviewAndRefine.find(q => q.id === 'targetAudience');
  const coreMessageQ = reviewAndRefine.find(q => q.id === 'coreMessage');
  const businessGoalQ = reviewAndRefine.find(q => q.id === 'businessGoal');

  targetAudience = targetAudQ?.userAnswer || '';
  coreMessage = coreMessageQ?.userAnswer || '';
  businessGoal = businessGoalQ?.userAnswer || '';
}

return {
  json: {
    projectId,
    userId,
    s3Key,
    projectBrief,
    summary,
    reviewAndRefine: {
      targetAudience,
      coreMessage,
      businessGoal
    },
    timestamp: new Date().toISOString()
  }
};"

echo "Updating Parse API Payload function in Stage 2 workflow..."
echo ""

# Update the workflow in database
sqlite3 "$DB_PATH" <<SQL
UPDATE workflow_entity
SET nodes = json_set(nodes, '\$[1].parameters.functionCode', '${NEW_FUNCTION_CODE}'),
    updatedAt = datetime('now')
WHERE name LIKE '%Stage 2%' AND name LIKE '%Final Presentation%';
SQL

if [ $? -eq 0 ]; then
    echo "✓ Workflow updated successfully!"
    echo ""
    echo "Restarting N8N to apply changes..."
    docker-compose restart n8n
    echo ""
    echo "✓ Done! N8N is restarting..."
    echo ""
    echo "Wait 10 seconds then test with:"
    echo "  python3 debug_stage2.py --test-full"
else
    echo "❌ Failed to update workflow"
    exit 1
fi
