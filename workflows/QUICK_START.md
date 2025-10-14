# SlideRx Workflows - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites Checklist
- [ ] Docker and docker-compose installed
- [ ] AWS S3 credentials (Access Key + Secret)
- [ ] OpenRouter API key (from https://openrouter.ai/keys)
- [ ] ngrok installed

---

## Step 1: Start Services (2 min)

```bash
cd /home/talab/sliderx-n8n

# Start N8N and PDF services
docker-compose up -d

# Wait 30 seconds for services to start
sleep 30

# Start ngrok in background
nohup ngrok http 5678 > ngrok.log 2>&1 &

# Get ngrok public URL
curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app'
```

**Save the ngrok URL** - you'll need it!

---

## Step 2: Import Workflows (2 min)

1. **Open N8N**: http://localhost:5678

2. **Import Stage 1**:
   - Click "+ Add workflow" → "Import from file"
   - Select: `/home/talab/sliderx-n8n/workflows/stage1_complete_workflow.json`
   - Click "Import"

3. **Import Stage 2**:
   - Click "+ Add workflow" → "Import from file"
   - Select: `/home/talab/sliderx-n8n/workflows/stage2_complete_workflow.json`
   - Click "Import"

---

## Step 3: Configure Credentials (1 min)

### Create AWS S3 Credential

1. Go to "Credentials" → "+ Add Credential"
2. Search for "AWS"
3. Name: `AWS S3 SlideRx`
4. Fill in:
   - **Access Key ID**: `YOUR_AWS_ACCESS_KEY`
   - **Secret Access Key**: `YOUR_AWS_SECRET_KEY`
   - **Region**: `eu-central-1`
5. Click "Save"

### Create OpenRouter API Credential

1. Go to "Credentials" → "+ Add Credential"
2. Search for "Header Auth"
3. Name: `OpenRouter API`
4. Fill in:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer sk-or-v1-YOUR_API_KEY`
5. Click "Save"

---

## Step 4: Activate Workflows (30 sec)

### Activate Stage 1
1. Open "SlideRx Stage 1" workflow
2. Click nodes to assign credentials:
   - "S3 Download PDF" → Select "AWS S3 SlideRx"
   - "AI Analysis - OpenRouter" → Select "OpenRouter API"
3. Click "Save"
4. Toggle "Active" switch (top right)

### Activate Stage 2
1. Open "SlideRx Stage 2" workflow
2. Click nodes to assign credentials:
   - "S3 Upload Result PDF" → Select "AWS S3 SlideRx"
   - "AI Generate 3 Slides" → Select "OpenRouter API"
3. Click "Save"
4. Toggle "Active" switch

---

## Step 5: Share Webhook URLs

**Send these to Victor/backend team:**

```
Stage 1 Webhook:
https://YOUR-NGROK-URL.ngrok-free.app/webhook/sliderx-stage1

Stage 2 Webhook:
https://YOUR-NGROK-URL.ngrok-free.app/webhook/sliderx-stage2
```

Replace `YOUR-NGROK-URL` with the URL from Step 1.

---

## ✅ Verification

### Test Stage 1 (Optional)

```bash
curl -X POST https://YOUR-NGROK-URL.ngrok-free.app/webhook/sliderx-stage1 \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-123",
    "s3Bucket": "sliderx-uploads-dev",
    "s3Key": "uploads/user-123/test-123/presentation.pdf",
    "projectBrief": {
      "successMetric": "Test metric",
      "industry": "Tech",
      "problemSolved": "Test problem"
    }
  }'
```

**Expected**: JSON response with `"success": true`

### Check N8N Executions

1. Go to "Executions" tab in N8N
2. Click latest execution
3. All nodes should be green ✅

---

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# N8N only
docker-compose logs -f n8n

# PDF services only
docker-compose logs -f pdf-services
```

### Check Service Health
```bash
# N8N
curl http://localhost:5678

# PDF Service
curl http://localhost:8000/health

# ngrok
curl http://localhost:4040/api/tunnels
```

---

## 🔥 Common Commands

### Restart Services
```bash
docker-compose restart n8n
docker-compose restart pdf-services
```

### Stop Everything
```bash
docker-compose down
pkill ngrok
```

### View Active Webhooks
```bash
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool
```

---

## 🐛 Quick Troubleshooting

### Webhook not accessible?
```bash
# Restart ngrok
pkill ngrok
nohup ngrok http 5678 > ngrok.log 2>&1 &
# Get new URL and update backend team
curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app'
```

### PDF service not responding?
```bash
docker-compose restart pdf-services
docker-compose logs pdf-services
```

### S3 permission errors?
```bash
# Test AWS CLI access
aws s3 ls s3://sliderx-uploads-dev/
aws s3 ls s3://sliderx-outputs-dev/
```

### AI calls failing?
- Check OpenRouter credits: https://openrouter.ai/credits
- Verify API key is correct in credentials
- Check model name: `anthropic/claude-3.5-sonnet`

---

## 📁 Workflow Files

- **Stage 1**: `workflows/stage1_complete_workflow.json`
- **Stage 2**: `workflows/stage2_complete_workflow.json`
- **Full Guide**: `workflows/WORKFLOW_GUIDE.md`

---

## 🎯 Flow Summary

### Stage 1: PDF → Summary + Questions
```
Lambda → n8n webhook → Download PDF → Extract text → AI analyze →
POST callback → API (status: needs_review)
```

### Stage 2: Answers → Final PDF
```
API → n8n webhook → AI generate slides → Create PDF →
Upload to S3 → DynamoDB (status: ready)
```

---

## ⚡ Performance Specs

| Stage | Avg Time | Max Timeout |
|-------|----------|-------------|
| Stage 1 | ~45-90s | 4 minutes |
| Stage 2 | ~60-120s | 5 minutes |

**Components:**
- PDF Extract: ~5-10s
- AI Analysis: ~30-60s
- PDF Generate: ~10-20s
- S3 Operations: ~2-5s

---

## 🔐 Security Notes

- **AWS Credentials**: Stored encrypted in N8N database
- **API Keys**: Never logged or exposed in responses
- **Webhook Auth**: Currently none - add if needed
- **ngrok**: Free tier resets URL on restart (use paid for persistence)

---

## 📞 Need Help?

1. Check logs: `docker-compose logs -f`
2. Review executions in N8N UI
3. Read full guide: `workflows/WORKFLOW_GUIDE.md`
4. Check diagram: `update/FLOW_DIAGRAM.md`

---

## ✨ You're Ready!

Both workflows are now active and ready to process presentations. The backend team can start sending requests to your webhook URLs.

**Next**: Wait for Lambda to trigger Stage 1, or test manually with curl commands above.
