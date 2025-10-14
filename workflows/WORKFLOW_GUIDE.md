# SlideRx N8N Workflows - Complete Implementation Guide

## Overview

This guide covers the complete implementation of both Stage 1 and Stage 2 workflows for the SlideRx system, including error handling, testing, and deployment.

---

## 📋 Table of Contents

1. [Workflow Files](#workflow-files)
2. [Stage 1: PDF Extraction & Review](#stage-1-pdf-extraction--review)
3. [Stage 2: Final Generation](#stage-2-final-generation)
4. [Error Handling](#error-handling)
5. [Configuration Requirements](#configuration-requirements)
6. [Import Instructions](#import-instructions)
7. [Testing Guide](#testing-guide)
8. [Troubleshooting](#troubleshooting)

---

## Workflow Files

- `stage1_complete_workflow.json` - Stage 1 workflow with error handling
- `stage2_complete_workflow.json` - Stage 2 workflow with error handling

---

## Stage 1: PDF Extraction & Review

### Purpose
Extracts text from uploaded PDF, generates AI summary, and creates review questions for the user.

### Node Sequence

#### 1. **Webhook Trigger**
- **Path**: `/webhook/sliderx-stage1`
- **Method**: POST
- **Input**: Lambda payload with projectId, s3Key, projectBrief

#### 2. **Parse Lambda Payload** (Function)
```javascript
// Extracts: projectId, userId, s3Bucket, s3Key, projectBrief
// userId extracted from s3Key path: uploads/{userId}/{projectId}/...
```

#### 3. **S3 Download PDF** (AWS S3 Node)
- **Operation**: Download
- **Bucket**: From input (`sliderx-uploads-dev`)
- **Key**: From input
- **Credentials**: "AWS S3 SlideRx"

#### 4. **PDF Service - Extract Text** (HTTP Request)
- **URL**: `http://pdf-services:8000/extract-text`
- **Method**: POST
- **Body**: Form data with PDF file
- **Timeout**: 60 seconds

#### 5. **Prepare AI Input** (Function)
```javascript
// Combines extracted text with projectBrief context
// Outputs: projectId, userId, extractedText, projectBrief
```

#### 6. **AI Analysis - OpenRouter** (HTTP Request)
- **URL**: `https://openrouter.ai/api/v1/chat/completions`
- **Method**: POST
- **Model**: `anthropic/claude-3.5-sonnet`
- **Headers**:
  - `Authorization: Bearer {API_KEY}`
  - `Content-Type: application/json`
- **Timeout**: 120 seconds
- **Prompt**: Analyzes presentation and generates slide-by-slide summary

#### 7. **Format API Callback** (Function)
```javascript
// Creates the exact payload structure from Postman:
{
  userId: "string",
  summary: {
    slides: [
      {
        index: 1,
        title: "Title",
        bullets: ["point1", "point2", "point3"]
      }
    ]
  },
  reviewAndRefine: [
    // 3 predefined questions with empty userAnswer fields
  ]
}
```

#### 8. **POST to API Callback** (HTTP Request)
- **URL**: `https://f9yntj41f4.execute-api.eu-central-1.amazonaws.com/dev/projects/{projectId}/ai/callback`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `x-user-id: {userId}`
- **Body**: Formatted callback payload
- **Timeout**: 30 seconds

#### 9. **Webhook Response - Success** (Respond to Webhook)
```json
{
  "success": true,
  "projectId": "...",
  "message": "Stage 1 completed successfully",
  "status": "needs_review"
}
```

### Error Handling Nodes

- **Check S3 Error** → Detects S3 download failures
- **Check Extract Error** → Detects PDF extraction failures
- **Check AI Error** → Detects AI analysis failures
- **Handle Error** → Logs and formats error response
- **Webhook Response - Error** → Returns error to Lambda (HTTP 500)

### Expected Output

**Success**: API receives callback with summary + 3 questions, DynamoDB updated to `needs_review`

**Error**: Lambda receives error details with failedAt step information

---

## Stage 2: Final Generation

### Purpose
Receives user answers, generates 3-slide presentation using AI, creates PDF, and uploads to S3.

### Node Sequence

#### 1. **Webhook Trigger Stage 2**
- **Path**: `/webhook/sliderx-stage2`
- **Method**: POST
- **Input**: API payload with full context (projectBrief, summary, reviewAndRefine with userAnswers)

#### 2. **Parse API Payload** (Function)
```javascript
// Extracts all data from API request
// Parses user answers from reviewAndRefine array
// Outputs: projectId, userId, s3Key, projectBrief, summary, reviewAndRefine
```

#### 3. **Prepare AI Prompt** (Function)
```javascript
// Creates comprehensive prompt with:
// - Original slide summaries
// - Business context
// - User guidance (target audience, core message, business goal)
// - Task: Generate 3 slides (PROBLEM/SOLUTION/ASK)
// Output format: JSON with slide1, slide2, slide3
```

#### 4. **AI Generate 3 Slides** (HTTP Request)
- **URL**: `https://openrouter.ai/api/v1/chat/completions`
- **Method**: POST
- **Model**: `anthropic/claude-3.5-sonnet`
- **Temperature**: 0.7
- **Timeout**: 120 seconds

#### 5. **Format Slides for PDF** (Function)
```javascript
// Parses AI response JSON
// Validates structure (slide1, slide2, slide3)
// Ensures correct titles: THE PROBLEM, THE SOLUTION, THE ASK
// Outputs: projectId, slide1, slide2, slide3
```

#### 6. **PDF Service - Generate PDF** (HTTP Request)
- **URL**: `http://pdf-services:8000/generate-pdf`
- **Method**: POST
- **Body**: JSON with projectId + 3 slides
- **Response**: Binary PDF file
- **Timeout**: 60 seconds

#### 7. **Prepare S3 Upload** (Function)
```javascript
// Prepares S3 parameters
// s3Key format: outputs/{userId}/{projectId}/result.pdf
// Bucket: sliderx-outputs-dev
```

#### 8. **S3 Upload Result PDF** (AWS S3 Node)
- **Operation**: Upload
- **Bucket**: `sliderx-outputs-dev`
- **Key**: `outputs/{userId}/{projectId}/result.pdf`
- **Content-Type**: `application/pdf`
- **Credentials**: "AWS S3 SlideRx"

#### 9. **Webhook Response - Success** (Respond to Webhook)
```json
{
  "success": true,
  "projectId": "...",
  "s3Key": "outputs/.../result.pdf",
  "message": "Stage 2 completed - PDF uploaded to S3",
  "status": "ready"
}
```

### Error Handling Nodes

- **Check API Error** → Detects payload parsing errors
- **Check AI Generation Error** → Detects AI generation failures
- **Check PDF Generation Error** → Detects PDF service failures
- **Check S3 Upload Error** → Detects S3 upload failures
- **Handle Stage 2 Error** → Logs and formats error response
- **Webhook Response - Error** → Returns error to API (HTTP 500)

### Expected Output

**Success**: PDF uploaded to S3, S3 trigger updates DynamoDB to `ready`

**Error**: API receives error details with failedAt step information

---

## Error Handling

### Error Detection Strategy

Each critical step has a corresponding "Check Error" node that:
1. Examines output for error fields
2. Routes to error handler if error detected
3. Continues to next step if successful

### Error Response Format

```json
{
  "success": false,
  "projectId": "uuid",
  "error": "Error message",
  "failedAt": "Node name where error occurred",
  "timestamp": "ISO 8601 timestamp"
}
```

### Error Scenarios Covered

#### Stage 1:
- ❌ **Failed Download** - S3 file not accessible
- ❌ **Extract Error** - PDF corrupted or text extraction failed
- ❌ **AI Analysis Failed** - OpenRouter API error or timeout
- ❌ **Format Failed** - AI response parsing error

#### Stage 2:
- ❌ **API Error** - Invalid payload or missing data
- ❌ **Stage2 Failed** - General workflow error
- ❌ **Gen Error** - AI generation failed
- ❌ **PDF Gen Fail** - PDF service error
- ❌ **S3 Upload Fail** - S3 upload error
- ❌ **Status Update Error** - DynamoDB update failed

### Retry Logic (Future Enhancement)

Current workflows do NOT automatically retry. Consider adding:
- Exponential backoff for transient failures
- Max 3 retry attempts
- Different retry strategies per error type

---

## Configuration Requirements

### Required N8N Credentials

#### 1. AWS S3 Credentials (ID: 1, Name: "AWS S3 SlideRx")
```
Type: AWS
Access Key ID: <from AWS IAM>
Secret Access Key: <from AWS IAM>
Region: eu-central-1
```

**Required Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::sliderx-uploads-dev/*",
        "arn:aws:s3:::sliderx-outputs-dev/*"
      ]
    }
  ]
}
```

#### 2. OpenRouter API (ID: 2, Name: "OpenRouter API")
```
Type: HTTP Header Auth
Header Name: Authorization
Header Value: Bearer sk-or-v1-YOUR_API_KEY_HERE
```

Get your API key from: https://openrouter.ai/keys

### Environment Variables (docker-compose.yml)

```yaml
environment:
  - N8N_PROTOCOL=http
  - N8N_HOST=localhost
  - N8N_PORT=5678
  - WEBHOOK_URL=https://YOUR-NGROK-URL.ngrok-free.dev
  - N8N_SECURE_COOKIE=false
```

### ngrok Configuration

**Required for webhook access:**
```bash
ngrok http 5678
```

**Webhook URLs to share with backend team:**
- Stage 1: `https://YOUR-NGROK-URL.ngrok-free.dev/webhook/sliderx-stage1`
- Stage 2: `https://YOUR-NGROK-URL.ngrok-free.dev/webhook/sliderx-stage2`

---

## Import Instructions

### Step 1: Start N8N
```bash
cd /home/talab/sliderx-n8n
docker-compose up -d n8n
```

### Step 2: Access N8N UI
```
http://localhost:5678
```

### Step 3: Import Stage 1 Workflow
1. Click "Add workflow" → "Import from file"
2. Select `workflows/stage1_complete_workflow.json`
3. Click "Import"

### Step 4: Configure Stage 1 Credentials
1. Open "S3 Download PDF" node
2. Select credential: "AWS S3 SlideRx"
3. Open "AI Analysis - OpenRouter" node
4. Select credential: "OpenRouter API"
5. Click "Save" (top right)

### Step 5: Activate Stage 1
1. Toggle "Active" switch (top right)
2. Verify webhook is listening

### Step 6: Import Stage 2 Workflow
1. Click "Add workflow" → "Import from file"
2. Select `workflows/stage2_complete_workflow.json`
3. Click "Import"

### Step 7: Configure Stage 2 Credentials
1. Open "S3 Upload Result PDF" node
2. Select credential: "AWS S3 SlideRx"
3. Open "AI Generate 3 Slides" node
4. Select credential: "OpenRouter API"
5. Click "Save"

### Step 8: Activate Stage 2
1. Toggle "Active" switch
2. Verify webhook is listening

### Step 9: Start ngrok
```bash
ngrok http 5678
```

### Step 10: Update Backend Team
Send the ngrok webhook URLs to Victor for Lambda configuration.

---

## Testing Guide

### Test Stage 1

#### Using Postman or curl:

```bash
curl -X POST https://YOUR-NGROK-URL.ngrok-free.dev/webhook/sliderx-stage1 \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-project-123",
    "s3Bucket": "sliderx-uploads-dev",
    "s3Key": "uploads/test-user/test-project-123/presentation.pdf",
    "projectBrief": {
      "successMetric": "Increase ARR by 200%",
      "industry": "SaaS",
      "problemSolved": "Data integration complexity"
    }
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "projectId": "test-project-123",
  "message": "Stage 1 completed successfully",
  "status": "needs_review"
}
```

**Expected API Callback:**
API should receive POST to `/projects/test-project-123/ai/callback` with summary + questions.

#### Verify in N8N:
1. Go to "Executions" tab
2. Click latest execution
3. Verify all nodes are green
4. Check "POST to API Callback" node output

### Test Stage 2

#### Using Postman or curl:

```bash
curl -X POST https://YOUR-NGROK-URL.ngrok-free.dev/webhook/sliderx-stage2 \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-project-123",
    "userId": "test-user",
    "s3Key": "uploads/test-user/test-project-123/presentation.pdf",
    "projectBrief": {
      "successMetric": "Increase ARR by 200%",
      "industry": "SaaS",
      "problemSolved": "Data integration complexity"
    },
    "summary": {
      "slides": [
        {
          "index": 1,
          "title": "Introduction",
          "bullets": ["Point 1", "Point 2", "Point 3"]
        }
      ]
    },
    "reviewAndRefine": [
      {
        "id": "targetAudience",
        "userAnswer": "Investors"
      },
      {
        "id": "coreMessage",
        "userAnswer": "We solve data integration for B2B SaaS"
      },
      {
        "id": "businessGoal",
        "userAnswer": "Fundraising / attracting investors"
      }
    ]
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "projectId": "test-project-123",
  "s3Key": "outputs/test-user/test-project-123/result.pdf",
  "message": "Stage 2 completed - PDF uploaded to S3",
  "status": "ready"
}
```

**Verify PDF in S3:**
```bash
aws s3 ls s3://sliderx-outputs-dev/outputs/test-user/test-project-123/
```

### Test Error Handling

#### Test S3 Download Error (Stage 1):
```bash
# Use invalid s3Key
curl -X POST https://YOUR-NGROK-URL.ngrok-free.dev/webhook/sliderx-stage1 \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-error",
    "s3Bucket": "sliderx-uploads-dev",
    "s3Key": "invalid/path/to/file.pdf",
    "projectBrief": {...}
  }'
```

**Expected**: HTTP 500 with error details

#### Test AI Error (Stage 1):
- Temporarily use invalid OpenRouter API key
- Send valid request
- Should receive "AI Analysis Failed" error

#### Test PDF Generation Error (Stage 2):
- Stop pdf-services container: `docker-compose stop pdf-services`
- Send Stage 2 request
- Should receive "PDF Gen Fail" error

---

## Troubleshooting

### Issue: Webhook not accessible

**Symptoms**: Lambda cannot reach webhook

**Solutions**:
1. Check ngrok is running: `curl http://localhost:4040/api/tunnels`
2. Verify WEBHOOK_URL in docker-compose.yml matches ngrok URL
3. Restart n8n: `docker-compose restart n8n`
4. Check workflow is "Active" in n8n UI

### Issue: S3 Download fails

**Symptoms**: "Failed Download" error

**Solutions**:
1. Verify AWS credentials in n8n
2. Check S3 bucket permissions
3. Verify s3Key format: `uploads/{userId}/{projectId}/filename.pdf`
4. Test AWS CLI access: `aws s3 ls s3://sliderx-uploads-dev/`

### Issue: PDF extraction fails

**Symptoms**: "Extract Error"

**Solutions**:
1. Check pdf-services is running: `docker-compose ps pdf-services`
2. Test PDF service health: `curl http://localhost:8000/health`
3. Check docker network: `docker network inspect sliderx-network`
4. Review pdf-services logs: `docker-compose logs pdf-services`

### Issue: AI calls timeout

**Symptoms**: "AI Analysis Failed" or "Gen Error"

**Solutions**:
1. Verify OpenRouter API key is valid
2. Check OpenRouter account credits: https://openrouter.ai/credits
3. Increase timeout in HTTP Request node (currently 120s)
4. Verify model name: `anthropic/claude-3.5-sonnet`

### Issue: API callback fails

**Symptoms**: "Format Failed" or callback not received by API

**Solutions**:
1. Verify API Gateway URL in "POST to API Callback" node
2. Check payload structure matches Postman exactly
3. Test API endpoint directly with curl
4. Review n8n execution logs for response details

### Issue: S3 upload fails

**Symptoms**: "S3 Upload Fail"

**Solutions**:
1. Verify AWS credentials have PutObject permission
2. Check S3 bucket exists: `aws s3 ls s3://sliderx-outputs-dev/`
3. Verify s3Key format: `outputs/{userId}/{projectId}/result.pdf`
4. Check file size limits (S3 max: 5TB, but check n8n limits)

---

## Performance Optimization

### Current Timeouts
- PDF Extraction: 60s
- AI Analysis: 120s
- AI Generation: 120s
- PDF Generation: 60s
- API Calls: 30s

### Optimization Strategies

1. **Caching** - Cache AI responses for similar inputs
2. **Parallel Processing** - Process multiple projects concurrently
3. **Streaming** - Stream large PDFs instead of loading fully
4. **Compression** - Compress PDFs before S3 upload
5. **Monitoring** - Add execution time logging

---

## Next Steps

### Immediate:
- [ ] Import both workflows to n8n
- [ ] Configure credentials
- [ ] Test with sample PDF
- [ ] Share webhook URLs with backend team

### Short-term:
- [ ] Add retry logic for transient failures
- [ ] Implement monitoring/alerting
- [ ] Add execution time metrics
- [ ] Create test automation suite

### Long-term:
- [ ] Add caching layer for AI responses
- [ ] Implement rate limiting
- [ ] Add webhook authentication
- [ ] Create admin dashboard for workflow monitoring

---

## Support

**Issues**: Report at project repository
**N8N Docs**: https://docs.n8n.io
**OpenRouter Docs**: https://openrouter.ai/docs
**AWS S3 Docs**: https://docs.aws.amazon.com/s3/

---

## Change Log

**Version 1.0** (2025-01-10)
- Initial complete workflow implementation
- Full error handling for both stages
- Comprehensive documentation
- Based on Victor's simplified architecture
