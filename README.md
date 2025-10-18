# SlideRx/DeckDoctor - N8N Workflow Orchestration

Claude Code Hackathon Project - AI-powered presentation processing system that converts long presentation PDFs into condensed 3-slide executive summaries using N8N workflow orchestration.

## Team Members
- Vitor Correa (UK)
- Talab Elmharek (IST)
- Philipp Kowalski (CET)

## 🚀 Quick Start

```bash
# 1. Start services
docker-compose up -d

# 2. Access N8N
open http://localhost:5678

# 3. Import workflows from /workflows directory
# 4. Configure credentials (AWS S3, OpenRouter API)
# 5. Activate workflows
```

**Complete setup guide:** [workflows/QUICK_START.md](workflows/QUICK_START.md)

## 📁 Project Structure

```
sliderx-n8n/
│
├── CLAUDE.md                    # 📖 Main project documentation (START HERE)
├── README.md                    # This file
├── docker-compose.yml           # 🐳 Service orchestration
├── pdf_services.py              # 🔧 FastAPI PDF microservice (v2.0 with visual generation)
├── pdf_services.py.backup       # Original text-only version
├── ngrok_setup.sh              # 🌐 Webhook exposure setup
│
├── frontend/                    # 🎨 React UI (MVP - mock data)
│   ├── src/
│   │   ├── App.jsx             # React Router main component
│   │   ├── main.jsx            # Entry point
│   │   └── components/
│   │       ├── Dashboard.jsx   # Project listing (482 lines)
│   │       ├── Upload.jsx      # PDF upload form (479 lines)
│   │       ├── Processing.jsx  # Status polling (354 lines)
│   │       ├── FollowUp.jsx    # Review questions (441 lines)
│   │       ├── Results.jsx     # Download results (304 lines)
│   │       └── Logout.jsx      # Auth cleanup (63 lines)
│   ├── package.json            # React 18.3, Vite 5.1, Tailwind CSS 3.4
│   ├── vite.config.js          # Vite configuration
│   └── tailwind.config.js      # Design system config
│
├── workflows/                   # ✅ Production workflows
│   ├── README.md               # Workflow documentation hub
│   ├── QUICK_START.md          # 5-minute setup guide
│   ├── WORKFLOW_GUIDE.md       # Complete reference
│   ├── TESTING_CHECKLIST.md    # Testing procedures
│   ├── DEPLOYMENT_SUMMARY.md   # Production deployment guide
│   ├── SlideRx Stage 1 - PDF Extraction & Review Questions.json
│   └── SlideRx Stage 2 - Final Presentation Generation.json
│
├── tools/                       # 🛠️ Development utilities
│   ├── README.md
│   ├── browse_s3.py            # S3 bucket browser utility
│   ├── fix_openrouter_node.py  # OpenRouter API node fixer
│   └── Dockerfile.s3browser    # Docker for S3 browser
│
├── .claude/                     # 🤖 Claude AI agent configs
│   ├── README.md
│   ├── agents/                 # Custom agents (code-reviewer, workflow-debugger, etc.)
│   └── commands/               # Slash commands (/review, /deploy, etc.)
│
├── AI Prompt Improvements/      # 🎯 Enhanced AI prompts
│   ├── README_PROMPTS.md       # Quick start
│   ├── IMPROVEMENTS_SUMMARY.md # Before/after comparison
│   ├── VISUAL_IMPROVEMENTS_SUMMARY.md  # Visual generation enhancements
│   ├── QUICK_IMPLEMENTATION.md # Code snippets
│   └── AI_PROMPT_IMPROVEMENTS_GUIDE.md # Complete guide
│
├── docs/
│   ├── AWS/                    # ☁️ AWS Lambda handlers
│   │   └── handler.mjs        # API Gateway Lambda function (191 lines)
│   ├── project-specs/          # 📋 Original specs & planning
│   │   ├── plan/              # Initial project plans
│   │   └── update/            # Updated specifications
│   └── legacy/                 # 🗄️ Historical debugging docs
│
├── prd/                         # Product Requirements Documentation
│   └── best-practices/         # Design principles
│
├── content/                     # 📚 Guides & resources
│   ├── ppt_tricks.md           # PowerPoint tips
│   └── citations.md            # Reference citations
│
├── n8n-data/                    # 💾 N8N runtime data (gitignored)
└── n8n-logs/                    # 📝 N8N logs (gitignored)
```

## 🏗️ Architecture

### System Components

- **Frontend UI**: React 18.3 + Vite 5.1 + Tailwind CSS (MVP with mock data - not yet connected to backend)
- **AWS API Gateway + Lambda**: Node.js 20 backend API for project status updates and N8N webhook triggers
  - Handler: [docs/AWS/handler.mjs](docs/AWS/handler.mjs) (191 lines)
  - Database: DynamoDB (project data storage)
  - Auth: AWS Cognito (user authentication)
- **N8N Workflows**: Workflow orchestration engine running in Docker
- **PDF Services**: FastAPI microservice (v2.0) for PDF extraction and generation with intelligent visual generation
- **AWS S3**: File storage (uploads and outputs)
- **AWS Lambda S3 Trigger**: Triggers N8N Stage 1 workflow on PDF upload
- **OpenRouter API**: Claude Sonnet 4.5 AI integration
- **ngrok**: Public webhook exposure for AWS Lambda integration

### Two-Stage Processing Flow

**Stage 1 - Initial Processing & Review Questions:**
1. User uploads PDF via **Frontend** → Sent to **AWS API Gateway**
2. **AWS Lambda** (S3 trigger) detects upload → Calls **N8N Stage 1 webhook** (via ngrok)
3. **N8N** downloads PDF from **S3** and extracts text via **PDF Services**
4. **AI (Claude Sonnet 4.5 via OpenRouter)** analyzes presentation + business context
5. Returns per-slide summary + clarifying questions (reviewAndRefine)
6. **N8N** posts results back to **AWS API Gateway Lambda** ([handler.mjs](docs/AWS/handler.mjs))
   - Lambda updates **DynamoDB** with reviewAndRefine questions
   - Lambda sets status to `"action needed"`
7. **Frontend** polls API Gateway and displays summary + questions to user

**Stage 2 - Final Presentation Generation:**
1. User submits answers via **Frontend** → **API Gateway Lambda**
2. **Lambda** updates DynamoDB with answers and triggers **N8N Stage 2 webhook**
   - Handler auto-sets status to `"generating presentation"` ([handler.mjs:93](docs/AWS/handler.mjs#L93))
   - Forwards full project data (including answers) to N8N Phase 2 URL ([handler.mjs:128-157](docs/AWS/handler.mjs#L128-L157))
3. **N8N** receives full context → **AI** generates final 3-slide presentation with visual descriptions
4. **N8N** calls **PDF Services** to generate PDF with intelligent visuals
5. **N8N** uploads completed PDF to **S3**
6. **N8N** posts completion to **API Gateway Lambda** (status: `"ready"`)
7. **Frontend** polls API and displays download link

### Technology Stack

**Frontend:**
- React 18.3.1 with React Router 6.22
- Vite 5.1.0 (build tool)
- Tailwind CSS 3.4.1 (styling)
- 6 components: Dashboard, Upload, Processing, FollowUp, Results, Logout

**AWS Backend (Cloud):**
- Node.js 20 Lambda functions (API Gateway handlers)
- DynamoDB (NoSQL database for project data)
- AWS Cognito (user authentication)
- S3 (file storage: uploads + generated PDFs)
- Lambda S3 triggers (detect new uploads)
- API Gateway (REST API endpoints)

**N8N Workflow Services (Local/Docker):**
- N8N latest (Node.js workflow engine)
- FastAPI + Uvicorn (Python 3.11 - PDF microservice)
- PyPDF2 (text extraction)
- ReportLab (PDF generation with graphics)
- SQLite database (N8N workflow storage)

**Infrastructure:**
- Docker Compose multi-container orchestration
- ngrok for public webhook tunneling (exposes N8N to AWS)

**External Integrations:**
- OpenRouter API (Claude Sonnet 4.5 AI model)

### AWS Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                               │
│                                                                 │
│  ┌──────────────┐      ┌─────────────────┐    ┌─────────────┐ │
│  │   Cognito    │──────│  API Gateway    │────│  DynamoDB   │ │
│  │ (Auth Pool)  │      │                 │    │  (Projects) │ │
│  └──────────────┘      │  Lambda Handler │    └─────────────┘ │
│                        │  handler.mjs    │                     │
│                        └────────┬────────┘                     │
│                                 │                               │
│  ┌──────────────┐              │                               │
│  │      S3      │              │  N8N_PHASE2_URL               │
│  │   Buckets    │              │  (webhook trigger)            │
│  │ - Uploads    │              │                               │
│  │ - Outputs    │              ▼                               │
│  └──────┬───────┘      ┌───────────────────────────────────┐  │
│         │ trigger      │   ngrok Tunnel (Public URL)       │  │
│         │              └───────────────────────────────────┘  │
│         │                               │                      │
└─────────┼───────────────────────────────┼──────────────────────┘
          │                               │
          │ S3 Event                      │ HTTPS webhook
          │ Notification                  │ (POST JSON)
          ▼                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL/DOCKER ENVIRONMENT                     │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │              N8N Workflow Engine (Port 5678)               ││
│  │                                                            ││
│  │  ┌──────────────────────┐    ┌──────────────────────────┐ ││
│  │  │  Stage 1 Workflow    │    │  Stage 2 Workflow        │ ││
│  │  │  - S3 Download       │    │  - Receive Full Context  │ ││
│  │  │  - Text Extraction   │    │  - AI Generation         │ ││
│  │  │  - AI Analysis       │    │  - PDF Creation          │ ││
│  │  │  - Post to Lambda    │    │  - S3 Upload             │ ││
│  │  └──────────┬───────────┘    └──────────┬───────────────┘ ││
│  │             │                            │                 ││
│  └─────────────┼────────────────────────────┼─────────────────┘│
│                │                            │                  │
│                ▼                            ▼                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │         PDF Services (FastAPI - Port 8000)                 ││
│  │         - extract-text endpoint (PyPDF2)                   ││
│  │         - generate-pdf endpoint (ReportLab v2.0)           ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  External: OpenRouter API (Claude Sonnet 4.5)                  │
└─────────────────────────────────────────────────────────────────┘

DATA FLOW:
1. User uploads PDF → S3
2. S3 triggers Lambda → calls N8N Stage 1 (via ngrok)
3. N8N Stage 1 → AI analysis → posts reviewAndRefine to Lambda
4. Lambda stores in DynamoDB (status: "action needed")
5. User submits answers → Lambda updates DynamoDB
6. Lambda triggers N8N Stage 2 (forwards full project data)
7. N8N Stage 2 → AI generates slides → PDF Services creates PDF
8. N8N uploads to S3 → posts completion to Lambda
9. Lambda updates DynamoDB (status: "ready")
```

## 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [CLAUDE.md](CLAUDE.md) | **Main documentation** - architecture, commands, configuration | Everyone |
| [workflows/QUICK_START.md](workflows/QUICK_START.md) | 5-minute setup guide | New developers |
| [workflows/WORKFLOW_GUIDE.md](workflows/WORKFLOW_GUIDE.md) | Complete workflow reference | Workflow developers |
| [workflows/TESTING_CHECKLIST.md](workflows/TESTING_CHECKLIST.md) | Testing procedures | QA & testers |
| [workflows/DEPLOYMENT_SUMMARY.md](workflows/DEPLOYMENT_SUMMARY.md) | Production deployment guide | DevOps |
| [docs/AWS/handler.mjs](docs/AWS/handler.mjs) | AWS Lambda API Gateway handler (backend) | Backend developers |
| [README_PROMPTS.md](README_PROMPTS.md) | AI prompt improvements guide | AI/Prompt engineers |
| [VISUAL_IMPROVEMENTS_SUMMARY.md](VISUAL_IMPROVEMENTS_SUMMARY.md) | PDF v2.0 visual generation details | Developers |
| [tools/README.md](tools/README.md) | Development utilities (S3 browser, node fixers) | Advanced developers |

## ☁️ AWS Lambda Handler Details

The backend API is implemented as an AWS Lambda function at [docs/AWS/handler.mjs](docs/AWS/handler.mjs).

### Key Features

**Endpoint:** `PUT/POST /projects/{projectId}/review`

**Functionality:**
- Updates project status in DynamoDB
- Stores Stage 1 review questions (reviewAndRefine array)
- Automatically triggers N8N Stage 2 workflow when user submits answers
- Validates project exists before updates
- Supports test environment (separate N8N URL for test user)

**Allowed Status Values:**
```javascript
"uploading", "processing", "action needed", "refining",
"ready", "complete", "done", "failed", "retry", "ready for download"
```

**Environment Variables:**
- `TABLE_NAME` - DynamoDB table for project storage
- `N8N_PHASE2_URL` - Production N8N Stage 2 webhook URL
- `N8N_PHASE2_URL_TEST` - Test environment N8N webhook URL

**Authentication:**
- AWS Cognito user pool (userId from JWT claims)
- Fallback: `X-User-Id` header for testing

**Special Logic:**
- **Auto-status**: When review questions are submitted, automatically sets status to `"generating presentation"` ([line 93](docs/AWS/handler.mjs#L93))
- **N8N Trigger**: Fetches full project data from DynamoDB and forwards to N8N Phase 2 ([lines 128-157](docs/AWS/handler.mjs#L128-L157))
- **Test Mode**: Uses separate N8N URL for user `"test-vitor"` ([line 140](docs/AWS/handler.mjs#L140))

**Error Handling:**
- Returns 404 if project not found
- Returns 422 for invalid status values or malformed review questions
- Returns 502 if N8N webhook call fails

## 🎯 Recent Updates

### PDF Visual Generation v2.0 (October 15, 2024)
Enhanced PDF generation service with intelligent visual interpretation:
- **Automatic Visual Detection**: Analyzes AI descriptions to generate appropriate graphics
- **Supported Visuals**: Charts (bar/pie/line), flow diagrams, before/after comparisons, icons
- **Smart Styling**: Color-coded by slide type (Problem=Red, Solution=Green, Ask=Blue)
- **Professional Design**: ReportLab graphics with proper typography and layout
- See [VISUAL_IMPROVEMENTS_SUMMARY.md](VISUAL_IMPROVEMENTS_SUMMARY.md) for details

### AI Prompt Improvements (October 14, 2024)
Significantly enhanced both Stage 1 and Stage 2 AI prompts:
- **Stage 1**: Enhanced analysis with slide categorization, narrative extraction, key metrics
- **Stage 2**: Audience-specific tone, detailed visual descriptions, 10-20 word power sentences
- **Expected Results**: +70-90% better output quality, -60-80% fewer retries
- See [README_PROMPTS.md](README_PROMPTS.md) for implementation guide

### Frontend UI Flow (October 8-10, 2024)
Complete React frontend implementation:
- **6 Components**: Dashboard, Upload, Processing, FollowUp, Results, Logout
- **Status Polling**: Accepts both "complete" and "completed" status values
- **Current State**: MVP with mock data - ready for backend integration
- **Tech Stack**: React 18.3 + Vite 5.1 + Tailwind CSS 3.4

### N8N Workflows Complete (October 7, 2024)
Production-ready workflow implementations:
- Stage 1: PDF extraction, AI analysis, review questions
- Stage 2: Final presentation generation with S3 upload
- Full AWS integration (Lambda triggers, S3 storage, API Gateway callbacks)

## 🔧 Common Commands

### Docker Services

```bash
# Start all services (N8N + PDF Services)
docker-compose up -d

# View logs
docker-compose logs -f              # All services
docker-compose logs -f n8n          # N8N only
docker-compose logs -f pdf-services # PDF services only

# Restart services
docker-compose restart n8n
docker-compose restart pdf-services

# Stop all services
docker-compose down

# Check service status
docker-compose ps
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### N8N & Webhooks

```bash
# Setup ngrok tunnel for webhooks
./ngrok_setup.sh

# Get ngrok public URL
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool | grep public_url

# Access N8N UI
open http://localhost:5678
# Login: admin / sliderx123
```

### PDF Services Testing

```bash
# Health check
curl http://localhost:8000/health

# Test PDF extraction
curl -X POST http://localhost:8000/extract-text -F "file=@test.pdf"

# Test PDF generation (basic)
curl -X POST http://localhost:8000/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"projectId":"test-123","slide1":{"title":"THE PROBLEM","visual":"Description","sentence":"Short sentence"},"slide2":{"title":"THE SOLUTION","visual":"Description","sentence":"Short sentence"},"slide3":{"title":"THE ASK","visual":"Description","sentence":"Short sentence"}}' \
  --output test-output.pdf
```

## 📋 Requirements

### Core Requirements
- **Docker** 20.10+ and **docker-compose** 1.29+
- **Node.js** 18+ and **npm** 9+ (for frontend development)
- **Python** 3.11+ (for PDF services - included in Docker)
- **ngrok** 3.0+ (for webhook access)

### External Services
- **AWS S3** account with credentials (Access Key ID, Secret Access Key)
- **OpenRouter API** key (for Claude Sonnet 4.5 access)
- **AWS Lambda** and **API Gateway** (for production deployment)

## 🔐 Configuration

### Required Credentials

Configure these credentials in N8N UI (http://localhost:5678 → Credentials):

1. **AWS S3 Credentials** (name: "AWS S3 SlideRx")
   - Type: AWS
   - Access Key ID: `your_access_key_id`
   - Secret Access Key: `your_secret_access_key`
   - Region: `eu-central-1`

2. **OpenRouter API** (name: "OpenRouter API")
   - Type: HTTP Header Auth
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_OPENROUTER_API_KEY`

### Environment Setup

The `.env.example` file shows outdated variables. For actual deployment, configure:

**In N8N Container (docker-compose.yml):**
```yaml
environment:
  - N8N_BASIC_AUTH_USER=admin
  - N8N_BASIC_AUTH_PASSWORD=sliderx123
  - WEBHOOK_URL=https://your-ngrok-url.ngrok-free.dev/
```

**For Frontend (optional - currently mock data):**
```env
VITE_API_URL=https://your-api-gateway-url.amazonaws.com
```

**Note:** The `.env.example` file references legacy variables and should be updated. Current implementation uses N8N credentials manager instead of environment variables for AWS/OpenRouter.

## 🧪 Testing

### PDF Services Testing

```bash
# Health check
curl http://localhost:8000/health

# Test PDF text extraction
curl -X POST http://localhost:8000/extract-text -F "file=@test.pdf"

# Test PDF generation with visual types
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
      "visual": "Flow diagram: 40 slides → SlideRx AI → 3 slides",
      "sentence": "Our AI automates the entire process in seconds."
    },
    "slide3": {
      "title": "THE ASK",
      "visual": "Pie chart: 60% Product, 30% Marketing, 10% Operations",
      "sentence": "We need $2M to scale to 10,000 customers."
    }
  }' --output test-visuals-output.pdf
```

### N8N Workflow Testing

1. **Import Workflows**
   - Open N8N at http://localhost:5678
   - Go to Workflows → Import from File
   - Import `workflows/SlideRx Stage 1 - PDF Extraction & Review Questions.json`
   - Import `workflows/SlideRx Stage 2 - Final Presentation Generation.json`

2. **Configure Credentials**
   - Add AWS S3 credentials (name: "AWS S3 SlideRx")
   - Add OpenRouter API credentials (name: "OpenRouter API")

3. **Test Stage 1**
   - Activate Stage 1 workflow
   - Send test webhook with sample PDF data
   - Verify AI analysis and review questions

4. **Test Stage 2**
   - Activate Stage 2 workflow
   - Send test webhook with sample answers
   - Verify PDF generation and S3 upload

**Full Testing Guide:** See [workflows/TESTING_CHECKLIST.md](workflows/TESTING_CHECKLIST.md)

### Frontend Testing

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
# Test mock data flows through all 6 components
```

## 🚢 Deployment

See [workflows/DEPLOYMENT_SUMMARY.md](workflows/DEPLOYMENT_SUMMARY.md) for production deployment guide.

## 🐛 Troubleshooting

### Common Issues

**Issue:** N8N not accessible at localhost:5678
- **Solution:** Check `docker-compose ps` and `docker-compose logs -f n8n`
- **Verify:** Container is running and no port conflicts

**Issue:** Workflows not found in N8N
- **Solution:** Import the correct workflow files:
  - `workflows/SlideRx Stage 1 - PDF Extraction & Review Questions.json`
  - `workflows/SlideRx Stage 2 - Final Presentation Generation.json`
- **Note:** Old filenames (`stage1_complete_workflow.json`) are deprecated

**Issue:** PDF service shows "unhealthy" status
- **Solution:** Wait 40-60s for initialization (curl installation takes time)
- **Verify:** Check logs with `docker-compose logs -f pdf-services`
- **Test:** Once running, `curl http://localhost:8000/health` should return 200

**Issue:** Frontend can't connect to backend
- **Solution:** Frontend currently uses mock data only
- **Status:** Backend integration not yet implemented
- **Workaround:** Test N8N workflows directly via webhooks

**Issue:** ngrok tunnel not working
- **Solution:** Ensure ngrok is installed and running
- **Check:** Visit http://localhost:4040 for ngrok dashboard
- **Update:** Copy public URL to `docker-compose.yml` WEBHOOK_URL

**Issue:** Credential errors in N8N workflows
- **Solution:** Verify credential names match exactly:
  - AWS S3: "AWS S3 SlideRx"
  - OpenRouter: "OpenRouter API"
- **Fix:** Update credentials in N8N UI or workflow JSON

**Full troubleshooting guide:** See [CLAUDE.md](CLAUDE.md)

## 📈 Monitoring

- **N8N UI**: http://localhost:5678 (admin / sliderx123)
  - View workflow executions
  - Monitor execution logs
  - Check credential status

- **PDF Service Health**: http://localhost:8000/health
  - Returns: `{"status": "healthy", "service": "PDF Services"}`

- **ngrok Dashboard**: http://localhost:4040
  - View webhook requests
  - Inspect request/response payloads
  - Monitor tunnel status

- **Frontend (Development)**: http://localhost:3000
  - React dev server with hot reload
  - Mock data demonstration

## 🤝 Contributing

This is a workflow orchestration component of the SlideRx project for the Claude Code Hackathon.

## 📞 Support

- **Documentation**: Start with [CLAUDE.md](CLAUDE.md)
- **N8N Issues**: https://community.n8n.io
- **Project Team**: Hackathon team members

## 📄 License

Claude Code Hackathon Project. All rights reserved.

---

**🎯 Next Steps:**
1. **Read Documentation**: Start with [CLAUDE.md](CLAUDE.md) for comprehensive overview
2. **Quick Setup**: Follow [workflows/QUICK_START.md](workflows/QUICK_START.md) (5 minutes)
3. **Start Services**: Run `docker-compose up -d` to start N8N and PDF services
4. **Import Workflows**: Load both Stage 1 and Stage 2 workflows into N8N
5. **Configure Credentials**: Add AWS S3 and OpenRouter API credentials
6. **Test PDF Generation**: Try the visual generation examples from Testing section
7. **Optional - Frontend**: Run `cd frontend && npm install && npm run dev` for UI demo
8. **Learn About Improvements**: Check [VISUAL_IMPROVEMENTS_SUMMARY.md](VISUAL_IMPROVEMENTS_SUMMARY.md) and [README_PROMPTS.md](README_PROMPTS.md)

## 🎨 Visual Generation Capabilities

The PDF generation service (v2.0) can intelligently interpret AI descriptions and generate:

- **Charts**: Bar charts (growth/decline), pie charts (allocation), line graphs (trends)
- **Flow Diagrams**: 3-step process flows with labeled boxes and arrows
- **Comparisons**: Before/after split screens with visual indicators
- **Icons**: Clock (time), rocket (growth), person (professional), document icons

All visuals are **color-coded by slide type**: Problem (red), Solution (green), Ask (blue)

**Example:** When AI generates `"Bar chart showing 40% revenue decline"`, the PDF service automatically creates a bar chart graphic with proper styling and data visualization.

See [VISUAL_IMPROVEMENTS_SUMMARY.md](VISUAL_IMPROVEMENTS_SUMMARY.md) for full details and examples.
