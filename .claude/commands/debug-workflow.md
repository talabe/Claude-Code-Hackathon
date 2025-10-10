Debug N8N workflow execution issues and integration failures.

Usage: `/debug-workflow [workflow-name or issue-description]`

Examples:
- `/debug-workflow stage1` - Debug stage 1 workflow
- `/debug-workflow webhook not triggering`
- `/debug-workflow pdf generation failing`

The agent will:
1. Check N8N logs for errors
2. Verify service health (N8N, PDF services, ngrok)
3. Test integrations (S3, OpenRouter, PDF service)
4. Analyze workflow configuration
5. Identify root cause
6. Provide solution steps and prevention tips

Common issues diagnosed:
- Webhook not triggering (ngrok/network)
- PDF processing failures (service/format)
- AI generation errors (API/rate limits)
- S3 upload/download issues (credentials/permissions)
- Docker network connectivity
- Timeout and performance problems
