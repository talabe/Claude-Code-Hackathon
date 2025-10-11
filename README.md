# SlideRx N8N Workflow Orchestration

AI-powered presentation processing system that converts long presentation PDFs into condensed 3-slide executive summaries using N8N workflow orchestration.

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
├── tools/                       # ��️ Development utilities
│   ├── README.md
│   ├── browse_s3.py
│   ├── fix_openrouter_node.py
│   └── Dockerfile.s3browser
│
├── n8n-data/                    # 💾 N8N runtime data (gitignored)
└── n8n-logs/                    # 📝 N8N logs (gitignored)
```

## 🏗️ Architecture

### Two-Stage Processing Flow

**Stage 1 - Initial Processing:**
1. AWS Lambda triggers N8N webhook after S3 upload
2. N8N downloads PDF from S3 and extracts text
3. AI analyzes presentation + business context
4. Returns per-slide summary + clarifying questions
5. Posts results back to AWS API Gateway

**Stage 2 - Final Generation:**
1. User submits answers → API triggers N8N webhook
2. AI generates final 3-slide presentation
3. N8N generates PDF via microservice
4. Uploads to S3 and posts completion to API

### Components

- **N8N**: Workflow engine (Docker)
- **PDF Services**: FastAPI microservice for PDF operations
- **AWS S3**: File storage
- **OpenRouter**: Claude Sonnet 4 AI API
- **ngrok**: Public webhook exposure

## 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [CLAUDE.md](CLAUDE.md) | **Main documentation** - architecture, commands, configuration | Everyone |
| [workflows/QUICK_START.md](workflows/QUICK_START.md) | 5-minute setup guide | New developers |
| [workflows/WORKFLOW_GUIDE.md](workflows/WORKFLOW_GUIDE.md) | Complete workflow reference | Workflow developers |
| [workflows/TESTING_CHECKLIST.md](workflows/TESTING_CHECKLIST.md) | Testing procedures | QA & testers |
| [tools/README.md](tools/README.md) | Development utilities | Advanced developers |

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

Create `.env` file (see `.env.example` if provided):
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

This is a workflow orchestration component of the SlideRx project. For contribution guidelines, see the main project repository.

## 📞 Support

- **Documentation**: Start with [CLAUDE.md](CLAUDE.md)
- **N8N Issues**: https://community.n8n.io
- **Project Team**: Internal Slack channel

## 📄 License

Internal SlideRx project. All rights reserved.

---

**🎯 Next Steps:**
1. Read [CLAUDE.md](CLAUDE.md) for architecture overview
2. Follow [workflows/QUICK_START.md](workflows/QUICK_START.md) for setup
3. Import and activate workflows
4. Run tests from [workflows/TESTING_CHECKLIST.md](workflows/TESTING_CHECKLIST.md)
