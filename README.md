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
├── pdf_services.py              # 🔧 FastAPI PDF microservice
├── ngrok_setup.sh              # 🌐 Webhook exposure setup
│
├── workflows/                   # ✅ Production workflows
│   ├── README.md               # Workflow documentation hub
│   ├── QUICK_START.md          # 5-minute setup guide
│   ├── WORKFLOW_GUIDE.md       # Complete reference
│   ├── TESTING_CHECKLIST.md    # Testing procedures
│   ├── stage1_complete_workflow.json  # Stage 1: PDF extraction
│   └── stage2_complete_workflow.json  # Stage 2: Final generation
│
├── .claude/                     # 🤖 Claude AI agent configs
│   ├── README.md
│   ├── agents/                 # Custom agents
│   └── commands/               # Slash commands
│
├── docs/
│   ├── project-specs/          # 📋 Original specs & planning
│   │   ├── plan/              # Initial project plans
│   │   └── update/            # Updated specifications
│   └── legacy/                 # 🗄️ Historical debugging docs
│
├── tools/                       # 🛠️ Development utilities
│   ├── README.md
│   ├── browse_s3.py
│   ├── fix_openrouter_node.py
│   └── Dockerfile.s3browser
│
├── AI Prompt Improvements/      # 🎯 Enhanced AI prompts
│   ├── README_PROMPTS.md       # Quick start
│   ├── IMPROVEMENTS_SUMMARY.md # Before/after comparison
│   ├── QUICK_IMPLEMENTATION.md # Code snippets
│   └── AI_PROMPT_IMPROVEMENTS_GUIDE.md # Complete guide
│
├── n8n-data/                    # 💾 N8N runtime data (gitignored)
└── n8n-logs/                    # 📝 N8N logs (gitignored)
```

## 🏗️ Architecture

### Two-Stage Processing Flow

**Stage 1 - Initial Processing:**
1. AWS Lambda triggers N8N webhook after S3 upload
2. N8N downloads PDF from S3 and extracts text
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

- **N8N**: Workflow engine running in Docker
- **PDF Services**: FastAPI microservice for PDF extraction and generation
- **AWS S3**: File storage (uploads and outputs)
- **OpenRouter**: Claude Sonnet 4.5 AI API
- **ngrok**: Public webhook exposure for AWS Lambda integration

## 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [CLAUDE.md](CLAUDE.md) | **Main documentation** - architecture, commands, configuration | Everyone |
| [workflows/QUICK_START.md](workflows/QUICK_START.md) | 5-minute setup guide | New developers |
| [workflows/WORKFLOW_GUIDE.md](workflows/WORKFLOW_GUIDE.md) | Complete workflow reference | Workflow developers |
| [workflows/TESTING_CHECKLIST.md](workflows/TESTING_CHECKLIST.md) | Testing procedures | QA & testers |
| [README_PROMPTS.md](README_PROMPTS.md) | **NEW!** AI prompt improvements | AI/Prompt engineers |
| [tools/README.md](tools/README.md) | Development utilities | Advanced developers |

## 🎯 Recent Updates

### AI Prompt Improvements (Latest)
We've significantly enhanced both Stage 1 and Stage 2 AI prompts:
- **Stage 1**: Enhanced analysis with slide categorization, narrative extraction, and key metrics
- **Stage 2**: Audience-specific tone, detailed visuals, 10-20 word power sentences
- **Expected results**: +70-90% better output quality, -60-80% fewer retries

See [README_PROMPTS.md](README_PROMPTS.md) for implementation guide.

## 🔧 Common Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart N8N
docker-compose restart n8n

# Stop all services
docker-compose down

# Setup ngrok tunnel
./ngrok_setup.sh

# Test PDF service
curl http://localhost:8000/health
```

## 📋 Requirements

- Docker 20.10+
- docker-compose 1.29+
- ngrok 3.0+ (for webhook access)
- AWS S3 credentials
- OpenRouter API key

## 🔐 Configuration

### Required Credentials

1. **AWS S3** - For PDF storage
   - Access Key ID
   - Secret Access Key
   - Region: eu-central-1

2. **OpenRouter API** - For Claude AI access
   - API Key (Bearer token)

### Environment Setup

Create `.env` file:
```env
# Never commit this file!
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
OPENROUTER_API_KEY=your_key
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:8000/health

# Test PDF extraction
curl -X POST http://localhost:8000/extract-text -F "file=@test.pdf"

# Run full test suite
# See workflows/TESTING_CHECKLIST.md
```

## 🚢 Deployment

See [workflows/DEPLOYMENT_SUMMARY.md](workflows/DEPLOYMENT_SUMMARY.md) for production deployment guide.

## 🐛 Troubleshooting

### Common Issues

**Issue**: N8N not accessible at localhost:5678
- **Solution**: Check `docker-compose ps` and logs

**Issue**: Workflows not found
- **Solution**: Import JSON files from `/workflows` directory

**Issue**: PDF service unhealthy
- **Solution**: Wait 40s for initialization or check logs

**Full troubleshooting guide**: See [CLAUDE.md](CLAUDE.md)

## 📈 Monitoring

- **N8N UI**: http://localhost:5678
- **PDF Service**: http://localhost:8000/health
- **ngrok Dashboard**: http://localhost:4040

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
1. Read [CLAUDE.md](CLAUDE.md) for architecture overview
2. Follow [workflows/QUICK_START.md](workflows/QUICK_START.md) for setup
3. Import and activate workflows
4. Check out [README_PROMPTS.md](README_PROMPTS.md) for AI improvements
5. Run tests from [workflows/TESTING_CHECKLIST.md](workflows/TESTING_CHECKLIST.md)
