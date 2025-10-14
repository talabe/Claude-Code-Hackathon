Create or modify N8N workflows following SlideRx patterns and best practices.

Usage: `/build-workflow [description]`

Examples:
- `/build-workflow add notification on failure`
- `/build-workflow create stage 3 for presentation editing`
- `/build-workflow optimize stage 1 performance`
- `/build-workflow add retry logic to S3 upload`

The agent will:
1. Understand requirements
2. Design node sequence
3. Provide configuration details for each node
4. Include error handling
5. Follow SlideRx workflow patterns (webhook → process → callback)
6. Generate JSON structure or modification instructions
7. Suggest testing strategy

Output includes:
- Workflow overview and purpose
- Node-by-node configuration
- Error handling approach
- Integration points (S3, AI, PDF service)
- Testing recommendations
