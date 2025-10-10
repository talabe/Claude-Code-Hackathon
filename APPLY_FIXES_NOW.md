# 🔧 Apply Workflow Fixes - Action Required

## ✅ Fix 1: Trust Proxy - COMPLETED

**Status**: ✅ Done automatically
- Added `N8N_PROXY_HOPS=1` to docker-compose.yml
- Restarted N8N
- X-Forwarded-For errors resolved

---

## ⚠️ Fix 2: Workflow Function - MANUAL ACTION REQUIRED

### Problem
The "Parse Lambda Payload" function crashes with:
```
Cannot read properties of undefined (reading 'split') [Line 11]
```

### Solution
**You need to update the function in N8N UI**

### Steps:

1. **Open N8N**: http://localhost:5678

2. **Open Workflow**:
   - Click on "SlideRx Stage 1 - PDF Extraction & Review Questions"

3. **Find the Node**:
   - Look for node named: **"Parse Lambda Payload"**
   - It's the 2nd node after "Webhook Trigger"

4. **Edit Function**:
   - Click the "Parse Lambda Payload" node
   - You'll see the function code editor
   - **Select ALL code** (Ctrl+A)
   - **Delete it**

5. **Paste New Code**:
   Copy this entire code block:

```javascript
// Parse incoming Lambda payload with safety checks
const input = $input.item.json;

// Handle both direct payload and wrapped in body
const payload = input.body || input;

// Extract parameters with defaults
const projectId = payload.projectId;
const s3Bucket = payload.s3Bucket || 'sliderx-uploads-dev';
const s3Key = payload.s3Key;
const projectBrief = payload.projectBrief || {};

// Validate required fields
if (!projectId) {
  throw new Error('Missing required field: projectId');
}
if (!s3Key) {
  throw new Error('Missing required field: s3Key');
}

// Extract userId from s3Key path: uploads/{userId}/{projectId}/...
const pathParts = s3Key.split('/');
const userId = pathParts[1] || 'unknown-user';

return {
  json: {
    projectId,
    userId,
    s3Bucket,
    s3Key,
    projectBrief,
    timestamp: new Date().toISOString()
  }
};
```

6. **Save**:
   - Click "Save" button (top right)
   - The workflow should save successfully

7. **Verify**:
   - No red errors on the node
   - Node should show green checkmark

---

## 🧪 Test After Fix 2

Run this test:

```bash
curl -X POST https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage1 \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-fixed-123",
    "s3Bucket": "sliderx-uploads-dev",
    "s3Key": "uploads/test-user/test-fixed-123/test.pdf",
    "projectBrief": {
      "successMetric": "Test after fix",
      "industry": "Tech",
      "problemSolved": "Testing"
    }
  }'
```

**Expected Result**:
- Webhook executes without crashing
- May fail at S3 download (file doesn't exist) - that's OK!
- The important part: no "Cannot read properties of undefined" error

---

## 📊 Check Execution

1. In N8N UI, click **"Executions"** tab
2. Find the latest execution
3. Click on it
4. You should see:
   - ✅ Green: "Webhook Trigger"
   - ✅ Green: "Parse Lambda Payload"
   - ❌ Red: "S3 Download PDF" (expected - file doesn't exist)

**This is SUCCESS!** The parsing works, only S3 fails because test file doesn't exist.

---

## 🎯 After Both Fixes

Your workflow will:
1. ✅ Accept ngrok webhook requests (Fix 1)
2. ✅ Parse Lambda payload correctly (Fix 2)
3. ✅ Handle both direct and body-wrapped payloads
4. ✅ Validate required fields
5. ✅ Extract userId from S3 path
6. ✅ Continue to S3 download (will work when real file exists)

---

## 💡 Why Manual Fix?

N8N stores workflow code in its database. I can't directly edit it via CLI without risking database corruption. The UI is the safe way to update workflow nodes.

---

## ⚡ Quick Reference

**Function Location**:
- Workflow: "SlideRx Stage 1 - PDF Extraction & Review Questions"
- Node: "Parse Lambda Payload" (2nd node)

**Code to Paste**: See FIXED_PARSE_FUNCTION.js in this directory

**Test Command**: See above curl command

---

## 📞 If You Need Help

1. Can't find the node? Look for Function icon (ƒx) after Webhook
2. Can't save? Check for syntax errors in code
3. Still crashing? Check N8N logs: `docker-compose logs n8n | tail -20`

---

**Estimated Time**: 2 minutes to apply Fix 2

**After this**: Both workflows will be fully functional! 🎉
