# Quick Fix: Webhook Response Syntax Error

## The Problem

The "Webhook Response - Success" node has invalid syntax in its response body expression. N8N cannot parse multiline expressions with the current syntax.

**Current (BROKEN):**
```javascript
={={
  success: true,
  projectId: $node['Parse API Payload'].json.projectId,
  s3Key: $json.s3Key,
  message: 'Stage 2 completed - PDF uploaded to S3',
  status: 'ready'
}}
```

## The Fix (Choose ONE method)

### Method 1: Use N8N Expression Editor (RECOMMENDED - 2 minutes)

1. **Open N8N:** http://localhost:5678

2. **Open the workflow:**
   - Click "Workflows" in left sidebar
   - Find "SlideRx Stage 2 - Final Presentation Generation"
   - Click to open it

3. **Edit the node:**
   - Click on "Webhook Response - Success" node (near the end)
   - You'll see the node parameters on the right

4. **Fix the Response Body:**
   - Find the "Response Body" field
   - Click into it and **delete everything**
   - Copy and paste this **EXACT** expression:

   ```javascript
   ={{ { success: true, projectId: $node['Parse API Payload'].json.projectId, s3Key: $json.s3Key, message: 'Stage 2 completed - PDF uploaded to S3', status: 'ready' } }}
   ```

   **IMPORTANT:**
   - Make sure it's all on ONE LINE
   - Must start with `={{` (two curly braces)
   - Must end with `}}` (two curly braces)
   - There's a space after the first `{` and before the last `}`

5. **Save:**
   - Press Ctrl+S or click "Save" button
   - Workflow will auto-save

6. **Test:**
   - The webhook is now ready to test!

---

### Method 2: Use JSON Expression (ALTERNATIVE)

If Method 1 doesn't work, try this alternative syntax:

1. In the "Webhook Response - Success" node
2. Delete the Response Body content
3. Use this expression instead:

```javascript
={{ JSON.stringify({ success: true, projectId: $node['Parse API Payload'].json.projectId, s3Key: $json.s3Key, message: 'Stage 2 completed - PDF uploaded to S3', status: 'ready' }) }}
```

---

### Method 3: Use Function Node Instead (WORKAROUND)

If expressions don't work, replace the response node:

1. Delete "Webhook Response - Success" node
2. Add a "Respond to Webhook" node
3. Set "Respond With" to "Using 'Respond to Webhook' Node"
4. Add a "Set" node before it with this configuration:
   - Set "success" = true
   - Set "projectId" = `{{$node['Parse API Payload'].json.projectId}}`
   - Set "s3Key" = `{{$json.s3Key}}`
   - Set "message" = 'Stage 2 completed - PDF uploaded to S3'
   - Set "status" = 'ready'

---

## Testing the Fix

After applying the fix, test with:

```bash
# Quick test
curl -X POST "http://localhost:5678/webhook/sliderx-stage2" \
  -H "Content-Type: application/json" \
  -d '{
    "body": {
      "projectId": "quick-test-001",
      "userId": "user-001",
      "s3Key": "test.pdf",
      "projectBrief": {"successMetric": "test", "industry": "test", "problemSolved": "test"},
      "summary": {"slides": [{"index": 1, "title": "Test", "bullets": ["test"]}]},
      "reviewAndRefine": [
        {"id": "targetAudience", "userAnswer": "test"},
        {"id": "coreMessage", "userAnswer": "test"},
        {"id": "businessGoal", "userAnswer": "test"}
      ]
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "projectId": "quick-test-001",
  "s3Key": "outputs/user-001/quick-test-001/result.pdf",
  "message": "Stage 2 completed - PDF uploaded to S3",
  "status": "ready"
}
```

---

## Why This Happened

N8N's expression parser doesn't handle multiline object literals well in some contexts. The original syntax had:
- Extra `=` after the opening `={{`
- Newlines that confused the parser

The fix uses a single-line expression with proper spacing.

---

## Verification

After fixing, check the N8N execution list:
- Executions should show "Success" (green checkmark)
- No more "invalid syntax" errors
- Response is returned properly

---

## If It Still Doesn't Work

The active workflow in N8N database might need manual update. Here's a SQL fix:

```bash
# Backup first
cp n8n-data/database.sqlite n8n-data/database.sqlite.backup

# Update the node parameter
sqlite3 n8n-data/database.sqlite "
UPDATE workflow_entity
SET nodes = json_set(
  nodes,
  '\$[8].parameters.responseBody',
  '={{ { success: true, projectId: \$node[''Parse API Payload''].json.projectId, s3Key: \$json.s3Key, message: ''Stage 2 completed - PDF uploaded to S3'', status: ''ready'' } }}'
)
WHERE name LIKE '%Stage 2%Final%';
"

# Restart N8N
docker-compose restart n8n
```

**Only use this if the UI method fails!**

---

## Need Help?

Run the debug tools:

```bash
# Check workflow status
python3 check_workflow_status.py

# Test full workflow
python3 debug_stage2.py --test-full

# Check logs
docker-compose logs -f n8n | grep -i error
```
