# 🚀 Import Workflows to N8N - READY TO GO!

## ✅ Services Status

- **N8N**: ✅ Running on http://localhost:5678
- **PDF Services**: ✅ Running  on http://localhost:8000
- **ngrok**: ✅ Running

## 🌐 Your Webhook URLs

**Stage 1:**
```
https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage1
```

**Stage 2:**
```
https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage2
```

---

## 📥 Import Workflows (3 Minutes)

### Step 1: Open N8N
🌐 **Go to: http://localhost:5678**

### Step 2: Import Stage 1 Workflow

1. Click **"+ Add workflow"** (top right corner)
2. Click **"Import from file"** button
3. Browse to: `/home/talab/sliderx-n8n/workflows/stage1_complete_workflow.json`
4. Click **"Import"**
5. You'll see the workflow with 15 nodes
6. Click **"Save"** (top right)

### Step 3: Import Stage 2 Workflow

1. Click **"+ Add workflow"** again (or use browser back)
2. Click **"Import from file"**
3. Browse to: `/home/talab/sliderx-n8n/workflows/stage2_complete_workflow.json`
4. Click **"Import"**
5. You'll see the workflow with 15 nodes
6. Click **"Save"**

---

## 🔑 Configure Credentials (2 Minutes)

### Create AWS S3 Credential

1. In N8N, click **"Credentials"** (left sidebar)
2. Click **"+ Add Credential"**
3. Search for **"AWS"** and select it
4. Fill in:
   - **Credential Name**: `AWS S3 SlideRx`
   - **Access Key ID**: `[YOUR_AWS_ACCESS_KEY]`
   - **Secret Access Key**: `[YOUR_AWS_SECRET_KEY]`
   - **Region**: `eu-central-1`
5. Click **"Save"**

### Create OpenRouter API Credential

1. Click **"+ Add Credential"** again
2. Search for **"Header Auth"** and select **"HTTP Header Auth"**
3. Fill in:
   - **Credential Name**: `OpenRouter API`
   - **Name**: `Authorization`
   - **Value**: `Bearer sk-or-v1-YOUR_API_KEY_HERE`
4. Click **"Save"**

**Get OpenRouter API Key**: https://openrouter.ai/keys

---

## 🔗 Assign Credentials to Nodes

### For Stage 1 Workflow

1. Open **"SlideRx Stage 1"** workflow
2. Click on **"S3 Download PDF"** node
3. Click **"Credential to connect with"** dropdown
4. Select **"AWS S3 SlideRx"**
5. Click on **"AI Analysis - OpenRouter"** node
6. Select credential: **"OpenRouter API"**
7. Click **"Save"** (top right)

### For Stage 2 Workflow

1. Open **"SlideRx Stage 2"** workflow
2. Click on **"S3 Upload Result PDF"** node
3. Select credential: **"AWS S3 SlideRx"**
4. Click on **"AI Generate 3 Slides"** node
5. Select credential: **"OpenRouter API"**
6. Click **"Save"**

---

## ✅ Activate Workflows

### Activate Stage 1
1. Open **"SlideRx Stage 1"** workflow
2. Toggle the **"Active"** switch (top right) to ON
3. You'll see "Workflow activated" message

### Activate Stage 2
1. Open **"SlideRx Stage 2"** workflow
2. Toggle the **"Active"** switch to ON
3. You'll see "Workflow activated" message

---

## 🧪 Test Stage 1 (Optional)

### Quick Test with curl

```bash
curl -X POST https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage1 \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-123",
    "s3Bucket": "sliderx-uploads-dev",
    "s3Key": "uploads/test-user/test-123/presentation.pdf",
    "projectBrief": {
      "successMetric": "Test metric",
      "industry": "Tech",
      "problemSolved": "Test problem"
    }
  }'
```

**Expected**: JSON response with `"success": true` (if S3 file exists)

### Check Execution in N8N

1. Go to **"Executions"** tab in N8N
2. Click on the latest execution
3. You'll see all nodes and their status
4. Green = success, Red = error

---

## 📊 Verify Webhooks Are Active

```bash
# Check ngrok is exposing the right URL
curl http://localhost:4040/api/tunnels | python3 -m json.tool
```

You should see your ngrok URL in the output.

---

## 🎯 Next Steps After Import

1. ✅ Import both workflows
2. ✅ Create 2 credentials (AWS S3 + OpenRouter)
3. ✅ Assign credentials to nodes
4. ✅ Activate both workflows
5. ✅ Test Stage 1 (optional)
6. ✅ Share webhook URLs with Victor/backend team

---

## 🔗 Webhook URLs to Share

Send these to the backend team:

```
Stage 1 Webhook (Lambda trigger):
https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage1

Stage 2 Webhook (API trigger):
https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/sliderx-stage2
```

---

## ❓ Need Help?

- **N8N not opening?** Check: `docker-compose ps`
- **Workflows not importing?** Check file paths are correct
- **Credentials not working?** Verify AWS/OpenRouter keys are valid
- **Webhook not responding?** Check ngrok is running: `curl http://localhost:4040/api/tunnels`

---

## 📚 Documentation

- **Quick Start**: `workflows/QUICK_START.md`
- **Full Guide**: `workflows/WORKFLOW_GUIDE.md`
- **Testing**: `workflows/TESTING_CHECKLIST.md`
- **Flow Diagrams**: `update/FLOW_DIAGRAM.md`

---

**You're almost there! Just import the workflows via the UI and configure credentials.** 🚀
