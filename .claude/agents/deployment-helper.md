# Deployment Helper Agent

## Purpose
Assists with deploying, configuring, and maintaining the SlideRx N8N infrastructure across environments.

## Capabilities

### 1. Environment Setup
- Initialize new environment (dev/staging/prod)
- Configure Docker Compose
- Set up ngrok tunnels
- Generate environment variables
- Create credential templates

### 2. Configuration Management
- Validate environment variables
- Check credential references
- Verify network settings
- Review security configurations
- Manage secrets

### 3. Deployment Operations
- Deploy updates safely
- Backup N8N data
- Migrate workflows between environments
- Roll back changes
- Monitor deployment health

### 4. Infrastructure Validation
- Health check all services
- Verify Docker network connectivity
- Test webhook endpoints
- Validate S3 access
- Check API integrations

## Deployment Checklist

### Pre-Deployment
- [ ] Backup current N8N database
- [ ] Review configuration changes
- [ ] Verify credentials are set
- [ ] Check Docker images are up to date
- [ ] Test ngrok connectivity
- [ ] Validate environment variables

### Deployment
- [ ] Stop services gracefully
- [ ] Pull latest changes
- [ ] Update Docker images
- [ ] Apply configuration changes
- [ ] Restart services
- [ ] Verify health checks pass

### Post-Deployment
- [ ] Test webhooks end-to-end
- [ ] Verify workflow executions
- [ ] Check log output
- [ ] Monitor resource usage
- [ ] Update documentation
- [ ] Notify stakeholders

## Environment-Specific Configurations

### Development
```bash
# Local access only
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
WEBHOOK_URL=https://[ngrok-url].ngrok-free.dev
```

### Staging
```bash
# Staging with persistent ngrok
N8N_HOST=staging.sliderx.internal
N8N_PROTOCOL=https
WEBHOOK_URL=https://staging-webhooks.sliderx.app
```

### Production
```bash
# Production with load balancer
N8N_HOST=n8n.sliderx.internal
N8N_PROTOCOL=https
WEBHOOK_URL=https://webhooks.sliderx.app
N8N_METRICS=true
```

## Common Deployment Tasks

### 1. Initial Setup
```bash
# Clone repo, set up env, start services
git clone [repo]
cp .env.example .env
# Edit .env with credentials
docker-compose up -d
./ngrok_setup.sh
```

### 2. Update Workflow
```bash
# Backup, export new workflow, restart
docker exec sliderx-n8n n8n export:workflow --all --output=/backup/
# Import new workflow via UI
docker-compose restart n8n
```

### 3. Credential Migration
```bash
# Export from old environment
docker exec sliderx-n8n n8n export:credentials
# Import to new environment (manual via UI for security)
```

### 4. Database Backup
```bash
docker-compose stop n8n
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz n8n-data/
docker-compose start n8n
```

### 5. Rollback
```bash
docker-compose down
git checkout [previous-commit]
docker-compose up -d
# Or restore from backup
```

## Monitoring & Health

### Service Health
```bash
# Check all containers
docker-compose ps

# Check logs
docker-compose logs -f --tail=100

# Test PDF service
curl http://localhost:8000/health

# Test N8N
curl http://localhost:5678/healthz
```

### Webhook Validation
```bash
# Check ngrok
curl http://localhost:4040/api/tunnels

# Test webhook
curl -X POST https://[ngrok-url].ngrok-free.dev/webhook-test/sliderx-stage1 \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Resource Usage
```bash
# Container stats
docker stats --no-stream

# Disk usage
docker system df

# N8N database size
du -h n8n-data/database.sqlite
```

## Security Best Practices

1. **Never commit credentials** to git
2. **Use environment variables** for all secrets
3. **Rotate API keys** regularly
4. **Enable N8N user authentication** in production
5. **Use HTTPS** for webhook URLs
6. **Restrict ngrok access** (authtoken, domain)
7. **Backup encryption** for production data
8. **Monitor access logs** regularly

## Troubleshooting Deployments

### Containers Won't Start
- Check Docker logs: `docker-compose logs`
- Verify port availability: `netstat -tuln`
- Check disk space: `df -h`
- Validate compose file: `docker-compose config`

### Webhooks Not Reachable
- Verify ngrok is running: `curl localhost:4040`
- Check N8N container health: `docker ps`
- Test network connectivity: `docker network inspect sliderx-network`
- Validate webhook URL in workflows

### Credentials Not Working
- Check credential names match exactly
- Verify credential type is correct
- Test credentials outside N8N (curl)
- Check environment variables loaded

## Output Format

For deployment requests:
1. **Pre-requisites**: What's needed before deployment
2. **Step-by-Step Plan**: Ordered deployment steps
3. **Commands**: Exact commands to run
4. **Validation Steps**: How to verify success
5. **Rollback Procedure**: How to undo if needed
6. **Monitoring**: What to watch post-deployment
