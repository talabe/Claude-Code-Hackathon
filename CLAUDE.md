# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SlideRx N8N is a workflow orchestration system that processes presentation PDFs using AI to generate condensed 3-slide executive summaries. The system uses N8N for workflow orchestration, FastAPI for PDF processing microservices, and integrates with AWS (S3, Lambda, API Gateway) and OpenRouter (Claude Sonnet 4).

## Architecture

### Two-Stage Processing Flow

**Stage 1 - Initial Processing:**

1. AWS Lambda triggers N8N webhook after S3 upload
2. N8N downloads PDF from S3 and extracts text via PDF microservice
3. AI analyzes presentation + business context → returns per-slide summary + clarifying questions
4. N8N posts results back to AWS API Gateway (status: `needs_review`)
5. Frontend displays summary and questions to user

**Stage 2 - Final Generation:**

1. User submits answers → API triggers N8N webhook with full context
2. AI generates final 3-slide presentation (Problem/Solution/Ask)
3. N8N generates PDF via microservice, uploads to S3
4. N8N posts completion to API (status: `ready`)
5. Frontend displays download link

### Components

- **Frontend**: React 18.3 + Vite 5.1 + Tailwind CSS (MVP with mock data)
- **AWS Backend**: Lambda handler (`docs/AWS/handler.mjs`) + API Gateway + DynamoDB + S3 + Cognito
- **N8N**: Workflow engine running in Docker, accessible locally and via ngrok
- **PDF Services**: FastAPI microservice (`pdf_services.py`) for PDF extraction and generation (v2.0 with visual generation)
- **Docker Compose**: Orchestrates N8N and PDF services on shared network
- **ngrok**: Exposes N8N webhooks publicly for AWS Lambda integration

### Service Communication

- Frontend → AWS API Gateway: HTTPS REST calls (currently mock data)
- AWS Lambda → N8N: Public ngrok URL webhooks (Stage 1 & 2 triggers)
- N8N → AWS API Gateway: HTTPS POST (status updates to Lambda handler)
- N8N → PDF Services: `http://pdf-services:8000` (Docker network)
- N8N → OpenRouter AI: External HTTPS calls (Claude Sonnet 4.5)
- N8N → AWS S3: Download/upload PDFs (via AWS SDK)

## Common Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart N8N only
docker-compose restart n8n

# View logs
docker-compose logs -f              # All services
docker-compose logs -f n8n          # N8N only
docker-compose logs -f pdf-services # PDF services only

# Check service status
docker-compose ps
```

### ngrok Setup

```bash
# Start ngrok tunnel for N8N (run in background)
nohup ngrok http 5678 > ngrok.log 2>&1 &

# Get public URL
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool | grep public_url

# View ngrok dashboard
# Open http://localhost:4040 in browser
```

### Testing PDF Services

```bash
# Health check
curl http://localhost:8000/health

# Test PDF extraction
curl -X POST http://localhost:8000/extract-text -F "file=@test.pdf"

# Test PDF generation
curl -X POST http://localhost:8000/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test-123","slide1":{"title":"THE PROBLEM","visual":"Description","sentence":"Short sentence"},"slide2":{"title":"THE SOLUTION","visual":"Description","sentence":"Short sentence"},"slide3":{"title":"THE ASK","visual":"Description","sentence":"Short sentence"}}' \
  --output test-output.pdf
```

### N8N Maintenance

```bash
# Access N8N container shell
docker exec -it sliderx-n8n bash

# Backup N8N data
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz n8n-data/

# Reset N8N database (clears all workflows and credentials)
docker-compose stop n8n
cp n8n-data/database.sqlite n8n-data/database.sqlite.backup
rm n8n-data/database.sqlite
docker-compose up -d n8n

# Check N8N environment variables
docker exec sliderx-n8n printenv | grep N8N_
```

## Workflow Configuration

### Webhook URLs (for AWS Lambda integration)

After starting ngrok, share these URLs with backend team:

- Stage 1: `https://YOUR-NGROK-URL.ngrok-free.dev/webhook/sliderx-stage1`
- Stage 2: `https://YOUR-NGROK-URL.ngrok-free.dev/webhook/sliderx-stage2`

### Required N8N Credentials

1. **AWS S3 Credentials** (named "AWS S3 SlideRx")

   - Access Key ID, Secret Access Key, Region: eu-central-1

2. **OpenRouter API** (named "OpenRouter API")
   - Type: HTTP Header Auth
   - Header: `Authorization`
   - Value: `Bearer YOUR_API_KEY`

### Importing Workflows

Workflows are defined in:

- `plan/n8n_workflow_stage1.json` - Initial processing workflow
- `plan/n8n_workflow_stage2.json` - Final generation workflow

After importing, update credential references in:

- AWS S3 nodes (Download/Upload operations)
- OpenRouter API calls (HTTP Request nodes with AI calls)

## Important Configuration Notes

### docker-compose.yml Environment Variables

- `N8N_SECURE_COOKIE=false` - Required for local HTTP access
- `N8N_PROTOCOL=http` - Local access protocol
- `WEBHOOK_URL` - Must match ngrok public URL for external webhooks
- `N8N_BASIC_AUTH_USER/PASSWORD` - Only active when no owner account exists

### PDF Services Container

The PDF services container shows "unhealthy" initially because `curl` takes time to install, but the service works correctly once `uvicorn` starts.

### Network Configuration

Both services run on the `sliderx-network` Docker network, allowing N8N to access PDF services via container name (`pdf-services:8000`) instead of localhost.

## AWS Integration Contracts

### AWS Lambda Handler

The backend API is implemented at `docs/AWS/handler.mjs` (191 lines, Node.js 20).

**Endpoint:** `PUT/POST /projects/{projectId}/review`

**Environment Variables:**

- `TABLE_NAME` - DynamoDB table name
- `N8N_PHASE2_URL` - Production N8N Stage 2 webhook URL
- `N8N_PHASE2_URL_TEST` - Test N8N Stage 2 webhook URL

**Authentication:** AWS Cognito or `X-User-Id` header

**Allowed Status Values:**
`uploading`, `processing`, `action needed`, `refining`, `ready`, `complete`, `done`, `failed`, `retry`, `ready for download`

### Stage 1 Input (from Lambda to N8N)

```json
{
  "projectId": "uuid",
  "s3Bucket": "sliderx-uploads-dev",
  "s3Key": "uploads/user-id/project-id/presentation.pdf",
  "projectBrief": {
    "businessPurpose": "...",
    "projectPhase": "...",
    "keyMetrics": "...",
    "currentBlockers": "..."
  }
}
```

### Stage 1 Output (N8N to API Gateway Lambda)

POST to `/projects/{projectId}/review` with:

```json
{
  "reviewAndRefine": [
    { "id": "q1", "type": "text", "label": "Question text..." }
  ],
  "status": "action needed"
}
```

Lambda stores in DynamoDB and returns `200 OK`.

### Stage 2 Input (from Lambda to N8N)

When user submits answers, Lambda handler:

1. Updates DynamoDB with answers
2. Fetches full project data from DynamoDB
3. Forwards entire project object to `N8N_PHASE2_URL`

Includes: projectBrief + reviewAndRefine + summary + userAnswers + all metadata

### Stage 2 Output (N8N to API Gateway Lambda)

POST to `/projects/{projectId}/review` with:

```json
{
  "status": "ready",
  "downloadUrl": "https://s3.../output.pdf",
  "slides": {
    "slide1": {...},
    "slide2": {...},
    "slide3": {...}
  }
}
```

## File Structure

- `docker-compose.yml` - Service orchestration
- `pdf_services.py` - FastAPI PDF microservice (Enhanced v2.0 with visual generation)
- `pdf_services.py.backup` - Backup of original text-only version
- `ngrok_setup.sh` - ngrok installation/configuration script
- `frontend/` - React 18.3 + Vite 5.1 UI (6 components, mock data)
- `docs/AWS/handler.mjs` - AWS Lambda API Gateway handler (Node.js 20)
- `n8n-data/` - N8N persistent data (workflows, credentials, database)
- `n8n-logs/` - N8N log files
- `workflows/` - Exported N8N workflow JSON files
  - `SlideRx Stage 1 - PDF Extraction & Review Questions.json`
  - `SlideRx Stage 2 - Final Presentation Generation.json`
- `tools/` - Development utilities (S3 browser, OpenRouter node fixer)
- `prd/` - Product Requirements Documentation
- `content/` - Guides & resources

## PDF Services Enhanced Features (v2.0)

The PDF generation service has been upgraded to interpret AI visual descriptions and generate actual graphics:

### Visual Generation Capabilities

**Automatic Visual Interpretation:**

- Analyzes AI-generated visual descriptions
- Detects keywords (chart, flow, comparison, icon, etc.)
- Generates appropriate graphics based on context

**Supported Visual Types:**

1. **Charts & Graphs**

   - Bar charts (growth/decline patterns)
   - Pie charts (3-segment allocation)
   - Line graphs (trajectory/trend visualization)
   - Automatically styled with axis lines and data points

2. **Flow Diagrams**

   - 3-step process flows with arrows
   - Labeled boxes (e.g., "40 slides → SlideRx AI → 3 slides")
   - Smart label detection from description

3. **Comparisons**

   - Split-screen before/after layouts
   - Red "X" for problems, green checkmark for solutions
   - Contrasting color schemes

4. **Icons**
   - Clock (time/urgency)
   - Rocket/arrow (growth/upward trajectory)
   - Person/user (professional/people)
   - Generic document icons

**Color-Coded by Slide Type:**

- **Problem slides**: Red/pink tones (#EF4444)
- **Solution slides**: Green tones (#10B981)
- **Ask slides**: Blue tones (#2563EB)

**Enhanced Design:**

- Professional header bars with white text
- Color-coded visual backgrounds
- Better typography with proper text wrapping
- SlideRx branding footer
- Slide numbering (1 of 3, 2 of 3, 3 of 3)

### Testing Visuals

```bash
# Test with different visual types
curl -X POST http://localhost:8000/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-visuals",
    "slide1": {
      "title": "THE PROBLEM",
      "visual": "Bar chart showing 40% revenue decline over 3 quarters",
      "sentence": "Revenue dropped 40% while costs remained flat."
    },
    "slide2": {
      "title": "THE SOLUTION",
      "visual": "Flow diagram from problem to SlideRx AI to solution",
      "sentence": "Our AI automates the entire process in seconds."
    },
    "slide3": {
      "title": "THE ASK",
      "visual": "Pie chart showing 60% Product, 30% Marketing, 10% Operations with rocket trajectory",
      "sentence": "We need $2M to scale to 10,000 customers."
    }
  }' --output test-output.pdf
```

### Future Enhancements (Phase 2)

Potential upgrades for more advanced visual generation:

1. **Matplotlib Integration**: Generate actual data-driven charts from extracted metrics
2. **Image Generation APIs**: DALL-E/Stable Diffusion for custom illustrations
3. **SVG Support**: Vector graphics for scalable visuals
4. **Template System**: Pre-designed visual templates by industry
5. **Custom Branding**: Logo upload and color scheme customization
