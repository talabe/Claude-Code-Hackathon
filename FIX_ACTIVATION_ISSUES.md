# Fix N8N Workflow Activation Issues

## Common Issues & Solutions

### Issue 1: Credentials Not Set

**Symptoms**: Red warning on nodes, "Credential required" error

**Solution**:

#### For Stage 1 Workflow:

1. **S3 Download PDF Node**
   - Click the node
   - Look for "Credential to connect with" field
   - If it says "Please select..." or shows red warning:
     - Click dropdown
     - If "AWS S3 SlideRx" doesn't exist, create it:
       - Click "Create New"
       - Select "AWS" credential type
       - Fill in Access Key, Secret Key, Region: `eu-central-1`
       - Name it: `AWS S3 SlideRx`
       - Click "Save"
     - Select "AWS S3 SlideRx"

2. **AI Analysis - OpenRouter Node**
   - Click the node
   - Look for authentication section
   - If OpenRouter credential doesn't exist:
     - Click "Create New Credential"
     - Select "HTTP Header Auth"
     - Name: `Authorization`
     - Value: `Bearer YOUR_OPENROUTER_API_KEY`
     - Credential Name: `OpenRouter API`
     - Click "Save"
     - Select it in the node

#### For Stage 2 Workflow:

1. **S3 Upload Result PDF Node**
   - Same as above, select "AWS S3 SlideRx"

2. **AI Generate 3 Slides Node**
   - Same as above, select "OpenRouter API"

---

### Issue 2: Missing Required Fields

**Symptoms**: Orange/yellow warning on nodes

**Solution**: Click each node with warning and fill in any empty required fields.

---

### Issue 3: Webhook Path Conflict

**Symptoms**: "Webhook path already in use" error

**Solution**:

1. Go to "Executions" → "Active Workflows"
2. Check if another workflow uses the same webhook path
3. If yes, deactivate the old one or change the path

For our workflows:
- Stage 1 should use: `/webhook/sliderx-stage1`
- Stage 2 should use: `/webhook/sliderx-stage2`

---

### Issue 4: Invalid Node Configuration

**Symptoms**: Red exclamation mark on specific nodes

**Solution**: Click the node and check:

1. **Function Nodes** - Code should be valid JavaScript
2. **HTTP Request Nodes** - URL should be valid
3. **IF Nodes** - Conditions should be properly configured

---

## Step-by-Step Activation Checklist

### For Stage 1:

- [ ] Open "SlideRx Stage 1" workflow
- [ ] Click "Webhook Trigger" node - path should be `sliderx-stage1`
- [ ] Click "Parse Lambda Payload" node - function code present
- [ ] Click "S3 Download PDF" node - credential assigned
- [ ] Click "PDF Service - Extract Text" node - URL: `http://pdf-services:8000/extract-text`
- [ ] Click "Prepare AI Input" node - function code present
- [ ] Click "AI Analysis - OpenRouter" node - credential assigned
- [ ] Click "Format API Callback" node - function code present
- [ ] Click "POST to API Callback" node - URL present
- [ ] Click "Webhook Response - Success" node - configured
- [ ] All error handling nodes - should be connected
- [ ] Click "Save"
- [ ] Toggle "Active" switch

### For Stage 2:

- [ ] Open "SlideRx Stage 2" workflow
- [ ] Click "Webhook Trigger Stage 2" node - path should be `sliderx-stage2`
- [ ] Click "Parse API Payload" node - function code present
- [ ] Click "Prepare AI Prompt" node - function code present
- [ ] Click "AI Generate 3 Slides" node - credential assigned
- [ ] Click "Format Slides for PDF" node - function code present
- [ ] Click "PDF Service - Generate PDF" node - URL present
- [ ] Click "Prepare S3 Upload" node - function code present
- [ ] Click "S3 Upload Result PDF" node - credential assigned
- [ ] Click "Webhook Response - Success" node - configured
- [ ] All error handling nodes - should be connected
- [ ] Click "Save"
- [ ] Toggle "Active" switch

---

## Quick Fix: Use Test Workflow First

If you're having trouble, let's test with a simpler version first:

### Create Test Webhook (1 minute)

1. In N8N, click "+ Add workflow"
2. Add "Webhook" node
   - HTTP Method: POST
   - Path: `test-webhook`
3. Add "Respond to Webhook" node
   - Response: `{"status": "success"}`
4. Connect them
5. Click "Save"
6. Toggle "Active"

**Test it:**
```bash
curl -X POST https://gainful-nonvibrating-renay.ngrok-free.dev/webhook/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

If this works, the issue is with the workflow configuration, not N8N itself.

---

## What N8N Checks Before Activation

N8N validates:

1. ✅ All required credentials are set
2. ✅ All required node parameters are filled
3. ✅ Webhook paths are unique
4. ✅ All nodes are properly connected
5. ✅ No nodes have configuration errors

---

## Get Specific Error Details

To see the exact error:

1. Try to activate the workflow
2. Look at the error message that appears
3. Click the node(s) highlighted in red
4. Read the error details in the node panel

Common errors:
- **"Credential required"** → Create and assign credentials
- **"Parameter required"** → Fill in missing fields
- **"Webhook path in use"** → Change path or deactivate conflicting workflow
- **"Invalid URL"** → Check URL format
- **"Invalid JSON"** → Check JSON syntax in parameters

---

## Alternative: Import Pre-configured Workflow

If the workflows have issues, let me create a minimal working version:

### Minimal Stage 1 Test Workflow

1. Webhook Trigger (path: `test-stage1`)
2. Function Node (just return `{success: true}`)
3. Respond to Webhook (return the function output)

This will at least get the webhook working, then we can add complexity.

---

## Check N8N Logs for Errors

```bash
# View N8N logs
docker-compose logs -f n8n | tail -50

# Look for errors when activating
```

---

## Screenshot Workflow Status

In N8N UI, take a screenshot showing:
1. The workflow canvas with all nodes
2. Any red/yellow warning indicators
3. The error message when you try to activate

This will help identify the specific issue.

---

## Nuclear Option: Start Fresh

If nothing works:

1. **Backup current workflows** (export to JSON)
2. **Stop N8N**: `docker-compose stop n8n`
3. **Backup database**: `cp n8n-data/database.sqlite n8n-data/database.sqlite.backup`
4. **Clear N8N data** (optional): `rm n8n-data/database.sqlite`
5. **Restart N8N**: `docker-compose up -d n8n`
6. **Re-import workflows**

---

## Contact Me

If you're still stuck, tell me:

1. **Which workflow** (Stage 1 or Stage 2)?
2. **What's the exact error message**?
3. **Which node** has the red/yellow indicator?
4. **Have you created the credentials**?

I'll create a fixed version for you!

---

## Quick Credential Setup

### AWS S3 Credential

In N8N UI:
1. Credentials → Add Credential → AWS
2. Name: `AWS S3 SlideRx`
3. Access Key ID: `AKIA...` (your key)
4. Secret Access Key: `...` (your secret)
5. Region: `eu-central-1`
6. Save

### OpenRouter Credential

1. Credentials → Add Credential → HTTP Header Auth
2. Credential Name: `OpenRouter API`
3. Header Name: `Authorization`
4. Header Value: `Bearer sk-or-v1-...` (your key)
5. Save

**Get OpenRouter Key**: https://openrouter.ai/keys

---

## Test Your Credentials

### Test AWS S3:
```bash
aws s3 ls s3://sliderx-uploads-dev/ --profile your-profile
```

### Test OpenRouter:
```bash
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

If these work, the credentials are valid.

---

**Most Common Fix**: Just create the two credentials (AWS S3 + OpenRouter) and assign them to the respective nodes. That resolves 90% of activation issues!
