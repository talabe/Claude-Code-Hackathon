# GitHub Copilot Instructions - SlideRx N8N

## Project Overview

SlideRx N8N is a **two-stage AI-powered PDF presentation processing system** using N8N workflows, FastAPI microservices, and AWS integration. It converts uploaded presentations into condensed 3-slide executive summaries through automated AI analysis.

## Architecture & Key Components

### Core Service Network
- **N8N Workflow Engine** (`sliderx-n8n` container): Orchestrates two-stage processing
- **PDF Services** (`sliderx-pdf-services` container): FastAPI microservice at `http://pdf-services:8000`
- **Docker Network**: `sliderx-network` enables container-to-container communication
- **ngrok**: Exposes N8N webhooks publicly for AWS Lambda integration

### Two-Stage Processing Flow
1. **Stage 1**: PDF extraction → AI analysis → review questions (status: `needs_review`)
2. **Stage 2**: User answers → final 3-slide generation → S3 upload (status: `ready`)

### Critical Service URLs
- N8N UI: `http://localhost:5678` (Basic Auth: admin/sliderx123)
- PDF Services: `http://localhost:8000` (internal: `http://pdf-services:8000`)
- Webhooks: `https://YOUR-NGROK-URL.ngrok-free.dev/webhook/sliderx-stage{1|2}`

## Developer Workflows

### Service Management
```bash
# Standard startup sequence
docker-compose up -d                    # Start both services
nohup ngrok http 5678 > ngrok.log 2>&1 & # Expose N8N publicly
curl -s http://localhost:4040/api/tunnels | grep public_url # Get webhook URL

# Debug workflows
docker-compose logs -f n8n              # N8N logs
docker exec -it sliderx-n8n bash        # Access N8N container
```

### Workflow Import/Export Pattern
- **Import Location**: N8N UI → "Import from file" 
- **Source Files**: `workflows/stage{1|2}_complete_workflow.json`
- **Backup Pattern**: `tar -czf n8n-backup-$(date +%Y%m%d).tar.gz n8n-data/`

## Project-Specific Patterns

### N8N Credential Configuration
- **AWS S3**: Named "AWS S3 SlideRx" (region: eu-central-1)
- **OpenRouter API**: HTTP Header Auth with `Authorization: Bearer API_KEY`
- **Update After Import**: All S3 nodes and OpenRouter HTTP Request nodes need credential reassignment

### Docker Network Communication
- N8N → PDF Services: Use `pdf-services:8000` (NOT localhost)
- PDF Services shows "unhealthy" initially (curl install delay) but functions correctly
- Resource limits: N8N (4GB/2CPU), PDF Services (2GB/1CPU)

### Environment Variables (docker-compose.yml)
```yaml
# Essential for local development
N8N_SECURE_COOKIE=false        # Required for HTTP access
N8N_PROTOCOL=http              # Local protocol
WEBHOOK_URL=https://...ngrok... # Must match ngrok public URL
```

### Data Flow Contracts
- **Stage 1 Input**: `{projectId, s3Bucket, s3Key, projectBrief}` from AWS Lambda
- **Stage 1 Output**: POST to `/projects/{projectId}/review` with questions array
- **Stage 2 Input**: Includes `projectBrief + reviewAndRefine + userAnswers`
- **Stage 2 Output**: POST to `/projects/{projectId}/complete` with downloadUrl

## File Structure Conventions

### Persistent Data
- `n8n-data/`: N8N database, workflows, credentials (SQLite-based)
- `n8n-data/database.sqlite`: Core N8N state (backup before resets)
- `workflows/`: Production-ready workflow definitions and documentation

### Configuration Files
- `docker-compose.yml`: Service orchestration with network/resource definitions
- `pdf_services.py`: FastAPI endpoints for `/extract-text` and `/generate-pdf`
- `ngrok_setup.sh`: ngrok installation and multi-tunnel configuration script

## Integration Points

### AWS Lambda → N8N
- Triggers via ngrok webhook URLs
- S3 path pattern: `uploads/{userId}/{projectId}/presentation.pdf`
- Webhook payload includes projectBrief object with business context

### N8N → External Services
- **AWS S3**: Download/upload operations via AWS S3 nodes
- **OpenRouter AI**: HTTP Request nodes with Claude Sonnet 4 model
- **Backend API**: POST results to API Gateway endpoints

### Error Handling Patterns
- N8N workflows use try/catch with error response nodes
- PDF services return structured `{success: boolean, error?: string}` responses
- Container health checks with retry logic for PDF services

## Testing & Debugging

### Service Health Checks
```bash
curl http://localhost:8000/health                    # PDF services
docker-compose ps                                    # Container status
curl http://localhost:5678                           # N8N accessibility
```

### Workflow Testing Endpoints
- Use `TESTING_CHECKLIST.md` for comprehensive test procedures
- Test files available in `plan/` directory for Postman collections
- Stage isolation: Test each workflow independently before integration