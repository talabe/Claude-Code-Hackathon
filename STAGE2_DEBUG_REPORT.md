# Stage 2 Workflow Debugging Report

**Date:** October 12, 2025
**Status:** Issues Identified and Solutions Provided

## Executive Summary

The Stage 2 workflow is **active** in N8N but has a critical bug in the "Parse API Payload" function node that causes it to fail when processing incoming webhooks. The workflow fails at line 13 of the parsing function with:

```
"Cannot read properties of undefined (reading 'find') [Line 13]"
```

## Issues Found

### 1. Parse API Payload Function - Missing Validation (CRITICAL)

**Location:** [workflows/stage2_complete_workflow.json:20](workflows/stage2_complete_workflow.json#L20)

**Problem:**
The function assumes `reviewAndRefine` is always an array, but doesn't validate this before calling `.find()`.

**Original Code:**
```javascript
const reviewAndRefine = body.reviewAndRefine;

// Extract user answers from reviewAndRefine
const targetAudience = reviewAndRefine.find(q => q.id === 'targetAudience')?.userAnswer || '';
```

**Fixed Code:**
```javascript
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
```

## Services Status

All services are **healthy and running**:

- ✅ N8N: Active on http://localhost:5678
- ✅ PDF Services: Active on http://localhost:8000
- ✅ ngrok: Active at https://gainful-nonvibrating-renay.ngrok-free.dev
- ✅ Webhook: Accessible at `{ngrok-url}/webhook/sliderx-stage2`

### Service Test Results

```bash
# PDF Service Health Check
curl http://localhost:8000/health
# ✓ Response: {"status":"healthy","service":"SlideRx PDF Services"}

# PDF Generation Test
python3 debug_stage2.py --test-pdf
# ✓ PDF generated successfully (3,306 bytes)
# ✓ Test PDF saved to /tmp/test-stage2-*.pdf

# N8N Health Check
curl http://localhost:5678/healthz
# ✓ Response: {"status":"ok"}
```

## Workflow Status

The workflow "SlideRx Stage 2 - Final Presentation Generation" is:
- ✅ **ACTIVE** in N8N (ID: OaoFNZqV0G03T5Z4)
- ✅ Webhook endpoint registered
- ❌ Failing on incoming requests due to parsing bug

### Execution History

Recent executions (from N8N event log):
- Execution 113-116: All failed at "Parse API Payload" node
- Error: `Cannot read properties of undefined (reading 'find')`

## Expected Payload Format

The workflow expects this structure:

```json
{
  "body": {
    "projectId": "string",
    "userId": "string",
    "s3Key": "string",
    "projectBrief": {
      "successMetric": "string",
      "industry": "string",
      "problemSolved": "string"
    },
    "summary": {
      "slides": [
        {
          "index": 1,
          "title": "string",
          "bullets": ["string"]
        }
      ]
    },
    "reviewAndRefine": [
      {
        "id": "targetAudience",
        "question": "string",
        "userAnswer": "string"
      },
      {
        "id": "coreMessage",
        "question": "string",
        "userAnswer": "string"
      },
      {
        "id": "businessGoal",
        "question": "string",
        "userAnswer": "string"
      }
    ]
  }
}
```

## How to Fix

### Option 1: Update via N8N Web UI (RECOMMENDED)

1. Open N8N: http://localhost:5678
2. Find workflow: "SlideRx Stage 2 - Final Presentation Generation"
3. Click on "Parse API Payload" node
4. Replace the function code with the fixed version from above
5. Click "Save" (Ctrl+S)
6. The workflow will auto-save and the fix is immediately active

### Option 2: Re-import Updated Workflow

1. Make sure N8N is running: `docker-compose ps`
2. In N8N UI (http://localhost:5678):
   - Delete or deactivate the existing Stage 2 workflow
   - Click "Import from File"
   - Select: `/home/talab/sliderx-n8n/workflows/stage2_complete_workflow.json`
   - Configure credentials (should be preserved):
     - AWS S3: "AWS S3 SlideRx"
     - OpenRouter API: "OpenRouter account"
   - Activate the workflow

## Testing Tools

### Comprehensive Debugger

Created: [debug_stage2.py](debug_stage2.py)

**Features:**
- Service health checks
- Payload validation
- Direct PDF generation testing
- Full workflow end-to-end testing
- N8N log viewing
- Interactive debugging menu

**Usage:**
```bash
# Interactive mode
python3 debug_stage2.py

# Quick tests
python3 debug_stage2.py --check-services  # Check all services
python3 debug_stage2.py --test-pdf        # Test PDF generation
python3 debug_stage2.py --test-full       # Full workflow test
python3 debug_stage2.py --validate-only   # Validate payload
python3 debug_stage2.py --logs            # View N8N logs
```

### Workflow Status Checker

Created: [check_workflow_status.py](check_workflow_status.py)

**Usage:**
```bash
python3 check_workflow_status.py
```

Shows:
- All workflows in N8N database
- Active/inactive status
- Webhook registrations
- Stage 2 workflow status

## Verification Steps

After applying the fix:

1. **Check workflow is active:**
   ```bash
   python3 check_workflow_status.py
   ```

2. **Test payload validation:**
   ```bash
   python3 debug_stage2.py --validate-only
   ```

3. **Test webhook with minimal payload:**
   ```bash
   curl -X POST "http://localhost:5678/webhook/sliderx-stage2" \
     -H "Content-Type: application/json" \
     -d '{
       "body": {
         "projectId": "test-001",
         "userId": "user-001",
         "s3Key": "test/path.pdf",
         "projectBrief": {
           "successMetric": "Test",
           "industry": "Test",
           "problemSolved": "Test"
         },
         "summary": {
           "slides": [
             {"index": 1, "title": "Slide 1", "bullets": ["Point 1"]}
           ]
         },
         "reviewAndRefine": [
           {"id": "targetAudience", "userAnswer": "Test audience"},
           {"id": "coreMessage", "userAnswer": "Test message"},
           {"id": "businessGoal", "userAnswer": "Test goal"}
         ]
       }
     }'
   ```

4. **Run full workflow test:**
   ```bash
   python3 debug_stage2.py --test-full
   ```

   **Note:** This will call OpenRouter AI API (costs ~$0.01) and require AWS S3 credentials.

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ AWS API Gateway → N8N Webhook                                   │
│   POST /webhook/sliderx-stage2                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Node 1: Parse API Payload ⚠️  (BUG HERE!)                       │
│   - Extract projectId, userId, s3Key                            │
│   - Parse projectBrief, summary, reviewAndRefine                │
│   - ❌ FAILS: reviewAndRefine.find() on undefined               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Node 2: Prepare AI Prompt                                       │
│   - Build comprehensive prompt from context                     │
│   - Include slide summaries, business context, user guidance    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Node 3: AI Generate 3 Slides                                    │
│   - POST to OpenRouter API (Claude Sonnet 4.5)                  │
│   - Generate Problem/Solution/Ask slides                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Node 4: Format Slides for PDF                                   │
│   - Parse AI JSON response                                      │
│   - Validate slide structure                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Node 5: PDF Service - Generate PDF                              │
│   - POST to http://pdf-services:8000/generate-pdf               │
│   - Returns binary PDF data                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Node 6: Prepare S3 Upload                                       │
│   - Format S3 key: outputs/{userId}/{projectId}/result.pdf      │
│   - Preserve binary PDF data                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Node 7: S3 Upload Result PDF                                    │
│   - Upload to sliderx-outputs-dev bucket                        │
│   - Set contentType: application/pdf                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│ Node 8: Webhook Response - Success                              │
│   - Return {success: true, projectId, s3Key, status: 'ready'}   │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling

The workflow includes error checking nodes at each major step:
- Check API Error (after Parse)
- Check AI Generation Error (after AI call)
- Check PDF Generation Error (after PDF service)
- Check S3 Upload Error (after S3 upload)

All errors route to "Handle Stage 2 Error" → "Webhook Response - Error"

## Additional Notes

### Credentials Configuration

Required N8N credentials:

1. **AWS S3 SlideRx** (ID: 1)
   - Type: AWS
   - Access Key ID: `[from env]`
   - Secret Access Key: `[from env]`
   - Region: eu-central-1

2. **OpenRouter account** (ID: Fb6D2B2ICq74Z4Fo)
   - Type: HTTP Header Auth
   - Header: `Authorization`
   - Value: `Bearer [API_KEY]`

### ngrok Tunnel

Current public webhook URL:
```
https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage2
```

This URL changes each time ngrok restarts. To get current URL:
```bash
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool | grep public_url
```

### Docker Network

Both services run on `sliderx-network`:
- N8N can access PDF services via: `http://pdf-services:8000`
- External access via: `http://localhost:8000`

## Recommendations

1. **Immediate:** Fix the Parse API Payload function via N8N UI
2. **Testing:** Run `python3 debug_stage2.py --test-full` after fix
3. **Monitoring:** Add better error logging to all function nodes
4. **Validation:** Consider adding JSON schema validation for incoming payloads
5. **Documentation:** Update API contract docs with exact payload format

## Files Modified/Created

- ✅ Created: `debug_stage2.py` - Comprehensive debugging tool
- ✅ Created: `check_workflow_status.py` - Workflow status checker
- ✅ Created: `import_stage2_workflow.sh` - Workflow import helper
- ✅ Updated: `workflows/stage2_complete_workflow.json` - Fixed parsing code
- ✅ Created: `STAGE2_DEBUG_REPORT.md` - This report

## Next Steps

1. Open N8N UI: http://localhost:5678
2. Edit "Parse API Payload" node in Stage 2 workflow
3. Apply the fixed function code
4. Save the workflow
5. Test with: `python3 debug_stage2.py --test-full`
6. Monitor N8N logs: `docker-compose logs -f n8n`

---

**Debug Tools Location:** `/home/talab/sliderx-n8n/`

- `debug_stage2.py` - Main debugging tool
- `check_workflow_status.py` - Workflow checker
- `STAGE2_DEBUG_REPORT.md` - This report
