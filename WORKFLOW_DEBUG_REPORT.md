# N8N Workflow Debug Report
**Date**: 2025-10-10
**Status**: 🔴 Issues Identified - Fixes Required

---

## 🔍 Diagnostic Summary

### ✅ Services Healthy
- **N8N**: ✅ Running (http://localhost:5678)
- **PDF Services**: ✅ Running (http://localhost:8000)
- **ngrok**: ✅ Active (https://gainful-nonvibrating-renay.ngrok-free.dev)
- **Docker Network**: ✅ Connected (172.18.0.0/16)

### ❌ Critical Issues Found

#### Issue 1: X-Forwarded-For Header Error
**Severity**: 🔴 High - Blocks webhook requests
**Error**:
```
ValidationError: The 'X-Forwarded-For' header is set but the Express
'trust proxy' setting is false
```

**Impact**: ngrok sends X-Forwarded-For headers, N8N rejects them

---

#### Issue 2: Workflow Execution Crash
**Severity**: 🔴 High - Workflow fails immediately
**Error**:
```
Cannot read properties of undefined (reading 'split') [Line 11]
```

**Location**: "Parse Lambda Payload" function - Line 11
**Code**: `const pathParts = s3Key.split('/');`
**Root Cause**: `s3Key` is undefined

---

## 🛠️ FIXES (Copy-Paste Ready)

### Fix 1: Enable Trust Proxy

**Edit docker-compose.yml** - Add this line under `n8n` → `environment`:

```yaml
- N8N_PROXY_HOPS=1
```

**Then restart**:
```bash
docker-compose restart n8n
```

---

### Fix 2: Fix Workflow Parsing Error

**In N8N UI:**
1. Open "SlideRx Stage 1" workflow
2. Click "Parse Lambda Payload" node
3. Replace entire function code with:

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

4. Click "Save"

---

## 🧪 Test After Fixes

**Test Command**:
```bash
curl -X POST https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage1 \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-123",
    "s3Bucket": "sliderx-uploads-dev",
    "s3Key": "uploads/user-123/test-123/presentation.pdf",
    "projectBrief": {
      "successMetric": "Test",
      "industry": "Tech",
      "problemSolved": "Test problem"
    }
  }'
```

**Expected Response**:
- Should NOT crash
- Should return JSON (even if S3 file doesn't exist, parsing should work)

---

## 📊 Full Diagnostic Results

### Service Health Checks
```
✅ N8N API: {"status":"ok"}
✅ PDF Service: {"status":"healthy"}
✅ ngrok: 1 tunnel active
✅ Docker Network: Both containers connected
```

### Network Details
```
N8N:         172.18.0.3
PDF Services: 172.18.0.2
Network:     sliderx-n8n_sliderx-network
```

### Webhook Accessibility
```
✅ ngrok URL accessible
⚠️  Returns HTTP 200 but with X-Forwarded-For errors in logs
```

---

## 🐛 Other Warnings (Non-Critical)

### PDF Service "Unhealthy" Status
**Status**: ⚠️ Warning
**Impact**: None - service works fine
**Reason**: `curl` installation delay
**Action**: Can ignore

---

## ✅ Verification Steps

After applying both fixes:

1. **Check logs**: `docker-compose logs n8n | grep -i error`
2. **Test webhook**: Run curl command above
3. **Check execution**: N8N UI → Executions → Latest
4. **Verify**: All nodes green (or S3 error if file doesn't exist)

---

## 📝 Quick Fix Commands

**Apply all fixes**:
```bash
# 1. Stop N8N
docker-compose stop n8n

# 2. Add to docker-compose.yml: N8N_PROXY_HOPS=1
# (Manual edit required)

# 3. Restart
docker-compose up -d n8n

# 4. Wait for startup
sleep 10

# 5. Update workflow code in N8N UI
# (Manual edit required - see Fix 2 above)

# 6. Test
curl -X POST https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage1 \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test","s3Key":"uploads/u/p/f.pdf","s3Bucket":"sliderx-uploads-dev","projectBrief":{}}'
```

---

## 🆘 If Still Failing

1. **Check N8N logs**: `docker-compose logs -f n8n`
2. **Check execution details**: N8N UI → Executions → Click latest
3. **Verify credentials**: N8N UI → Credentials → Test connections
4. **Restart all**: `docker-compose restart`

---

**Next Action**: Apply Fix 1 and Fix 2, then test!
