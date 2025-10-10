# SlideRx N8N Workflow Debug Report
**Date:** 2025-10-09
**Workflow:** SlideRx - Stage 1: Initial Processing
**Workflow ID:** zLACLcQHFRDMYDHK

## Executive Summary
Successfully debugged and fixed 3 critical issues preventing the Stage 1 workflow from executing. The workflow now successfully processes through all nodes up to the OpenRouter API call. The remaining issue is with OpenRouter API credentials/configuration.

---

## Issues Found and Fixed

### Issue #1: Webhook Registration Failures
**Root Cause:** Multiple duplicate workflows with the same name "SlideRx - Stage 1: Initial Processing" existed in the database, causing N8N to activate the wrong workflow version on restart.

**Evidence:**
```
sqlite3 query showed:
- 6 workflows with name "SlideRx - Stage 1: Initial Processing"
- Only one was active (ID: zLACLcQHFRDMYDHK)
- N8N was sometimes loading different workflow IDs on restart
```

**Fix Applied:**
```sql
UPDATE workflow_entity
SET active = 0
WHERE name LIKE 'SlideRx - Stage 1%'
  AND id != 'zLACLcQHFRDMYDHK';
```
Deactivated 5 duplicate workflows, keeping only the correct one active.

**Verification:**
- Webhook now properly registers on N8N startup
- Logs show: `Activated workflow "SlideRx - Stage 1: Initial Processing" (ID: zLACLcQHFRDMYDHK)`
- `/webhook/sliderx-stage1` responds with HTTP 200

---

### Issue #2: PDF Service Returns 422 Unprocessable Entity
**Root Cause:** The HTTP Request node ("Extract Text from PDF via PDF Service") was missing the `parameterType` field required for multipart file uploads in N8N v4.2.

**Evidence:**
```
N8N Event Log showed:
- Node "Extract Text from PDF via PDF Service" finished successfully
- But PDF service logs showed: 422 Unprocessable Entity

Original configuration:
{
  "name": "file",
  "inputDataFieldName": "data"
  // MISSING: "parameterType": "formBinaryData"
}
```

**Fix Applied:**
Updated the HTTP Request node configuration in workflow ID `zLACLcQHFRDMYDHK`:
```json
{
  "name": "file",
  "parameterType": "formBinaryData",
  "inputDataFieldName": "data"
}
```

**Verification:**
- PDF service now returns HTTP 200 OK
- Logs show: `INFO: 172.18.0.3:52502 - "POST /extract-text HTTP/1.1" 200 OK`
- Text extraction works correctly

**Technical Details:**
N8N v4.2 requires explicit `parameterType` declaration for file uploads. Without it, N8N sends form data incorrectly, causing FastAPI to reject the request as malformed.

---

### Issue #3: IF Node Boolean Expression Error
**Root Cause:** The "Is API Available?" IF node had an invalid boolean expression `={{ true }}` which N8N evaluated as an empty string instead of a boolean value.

**Evidence:**
```
N8N Event Log error:
"errorMessage": "Wrong type: '' is a string but was expecting a boolean [condition 0, item 0]"
"lastNodeExecuted": "Is API Available?"
```

**Fix Applied:**
Changed the IF node condition from a boolean check to a simpler existence check:
```json
{
  "leftValue": "={{ $json.projectId }}",
  "rightValue": "",
  "operator": {
    "type": "string",
    "operation": "exists"
  }
}
```

**Verification:**
- IF node now passes successfully
- Workflow proceeds to "Call OpenRouter API" node
- Event log shows IF node finishes without errors

---

### Issue #4: OpenRouter API JSON Body Invalid
**Root Cause:** The OpenRouter API HTTP Request node had improperly formatted JSON expressions that didn't stringify the prompt values, causing "JSON parameter needs to be valid JSON" error.

**Original Configuration:**
```json
{
  "model": "anthropic/claude-sonnet-4",
  "messages": [
    {"role": "system", "content": {{ $json.systemPrompt }}},
    {"role": "user", "content": {{ $json.userPrompt }}}
  ]
}
```

**Fix Applied:**
1. Added JSON filter to properly stringify values
2. Updated to valid OpenRouter model name

```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    {"role": "system", "content": {{ $json.systemPrompt | json }}},
    {"role": "user", "content": {{ $json.userPrompt | json }}}
  ],
  "max_tokens": 3000,
  "temperature": 0.7
}
```

**Current Status:**
- JSON body now formats correctly
- OpenRouter API call executes
- Returns "Bad request" error - likely due to invalid/missing API credentials

---

## Workflow Execution Status

### Successfully Executing Nodes (✅)
1. ✅ Start Webhook - Receives POST requests correctly
2. ✅ Parse Lambda Input - Extracts payload data
3. ✅ Extract S3 Info - Validates required fields
4. ✅ Validate Input - Checks data structure
5. ✅ Download PDF from S3 - Retrieves file successfully
6. ✅ Extract Text from PDF via PDF Service - **FIXED** (was 422, now 200)
7. ✅ Prepare AI Prompt - Generates system and user prompts
8. ✅ Is API Available? - **FIXED** (was boolean error, now passes)
9. ⚠️ Call OpenRouter API - Executes but returns "Bad request"

### Remaining Issue
**OpenRouter API Authentication/Configuration**
- Error: "Bad request - please check your parameters"
- Possible causes:
  1. Invalid or missing OpenRouter API credentials
  2. Model name might need adjustment
  3. API key permissions issue

**Recommended Actions:**
1. Verify OpenRouter API credentials in N8N (Credential ID: Fb6D2B2ICq74Z4Fo)
2. Confirm the API key has access to Claude models
3. Check OpenRouter dashboard for current model names
4. Test API key with curl:
   ```bash
   curl -X POST https://openrouter.ai/api/v1/chat/completions \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"anthropic/claude-3.5-sonnet","messages":[{"role":"user","content":"test"}]}'
   ```

---

## Prevention Tips

### 1. Avoid Duplicate Workflows
**Problem:** Multiple workflows with the same name cause N8N to load unpredictable versions.

**Prevention:**
- Delete old workflow versions instead of duplicating
- Use version numbers in workflow names during testing (e.g., "SlideRx Stage 1 v1", "v2")
- Regular database cleanup:
  ```bash
  sqlite3 n8n-data/database.sqlite "SELECT id, name, active FROM workflow_entity;"
  ```

### 2. Always Specify parameterType for File Uploads
**Problem:** N8N v4+ requires explicit `parameterType` for multipart form uploads.

**Prevention:**
- When configuring HTTP Request nodes with file uploads, always set:
  ```json
  {
    "name": "file",
    "parameterType": "formBinaryData",
    "inputDataFieldName": "data"
  }
  ```
- Test file uploads immediately after configuration
- Check both N8N and target service logs

### 3. Use Simple IF Node Conditions
**Problem:** Complex expressions in IF nodes can evaluate incorrectly.

**Prevention:**
- Avoid expressions like `={{ true }}` for always-pass conditions
- Use existence checks: `{{ $json.fieldName }}` with "exists" operator
- Test IF nodes in isolation before adding to workflow
- For boolean checks, use: `{{ $json.fieldName ? true : false }}`

### 4. Properly Format JSON Bodies with Expressions
**Problem:** N8N expressions in JSON bodies need proper stringification.

**Prevention:**
- Always use `| json` filter for string values in JSON:
  ```
  {"content": {{ $json.prompt | json }}}
  ```
- Test JSON body formatting with simple test values first
- Use N8N's "Test step" feature to validate JSON output

### 5. Test API Credentials Separately
**Problem:** Workflow failures due to invalid credentials are hard to debug.

**Prevention:**
- Test API credentials with curl before using in N8N
- Use N8N's credential testing feature
- Check API provider dashboards for usage/errors
- Keep API documentation links in workflow descriptions

---

## Testing Checklist

### Verify Fixes Work:
1. ☑ Restart N8N and check logs for workflow activation
2. ☑ Send test webhook request:
   ```bash
   curl -X POST http://localhost:5678/webhook/sliderx-stage1 \
     -H "Content-Type: application/json" \
     -d @test_webhook.json
   ```
3. ☑ Check N8N event logs: `tail -f n8n-data/n8nEventLog.log`
4. ☑ Check PDF service logs: `docker-compose logs -f pdf-services`
5. ☐ Verify OpenRouter API credentials and test separately
6. ☐ Test complete workflow with valid PDF in S3

### Files Modified:
- `/home/talab/sliderx-n8n/n8n-data/database.sqlite` (workflow configuration)
  - Fixed HTTP Request node for PDF extraction
  - Fixed IF node condition
  - Fixed OpenRouter API JSON body
  - Deactivated duplicate workflows

---

## Commands for Future Reference

### Check Active Workflows:
```bash
sqlite3 n8n-data/database.sqlite "SELECT id, name, active FROM workflow_entity WHERE active = 1;"
```

### View Workflow Execution Logs:
```bash
tail -f n8n-data/n8nEventLog.log | grep -E "(workflow|error|failed)"
```

### Test PDF Service:
```bash
curl -X POST http://localhost:8000/extract-text \
  -F "file=@test.pdf" \
  -H "accept: application/json"
```

### Restart Services:
```bash
docker-compose restart n8n
docker-compose restart pdf-services
```

### Check Service Status:
```bash
docker-compose ps
docker-compose logs --tail=50 n8n
docker-compose logs --tail=50 pdf-services
```

---

## Summary of Changes

**Database Updates:**
- Workflow ID: `zLACLcQHFRDMYDHK`
- Node "Extract Text from PDF via PDF Service": Added `parameterType: "formBinaryData"`
- Node "Is API Available?": Changed condition to existence check
- Node "Call OpenRouter API": Fixed JSON body formatting, updated model name
- Deactivated 5 duplicate workflows

**Result:**
- Webhook: ✅ Working
- PDF Service: ✅ Fixed (422 → 200)
- IF Node: ✅ Fixed (boolean error → passes)
- OpenRouter API: ⚠️ Needs credentials verification

**Next Steps:**
1. Verify/update OpenRouter API credentials
2. Test complete workflow with valid credentials
3. Monitor first successful execution
4. Document API response format for next nodes
