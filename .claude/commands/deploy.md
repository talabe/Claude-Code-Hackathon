Deploy, configure, or maintain SlideRx N8N infrastructure.

Usage: `/deploy [task-description]`

Examples:
- `/deploy setup new staging environment`
- `/deploy update workflows to production`
- `/deploy backup current state`
- `/deploy rollback to previous version`
- `/deploy health check all services`
- `/deploy migrate credentials to new environment`

The agent will:
1. Assess current state
2. Plan deployment steps
3. Provide exact commands to run
4. Include validation steps
5. Offer rollback procedure
6. Suggest monitoring strategy

Handles:
- Environment setup (dev/staging/prod)
- Service deployment and updates
- Configuration management
- Credential migration
- Backup and restore
- Health checks and monitoring
- Troubleshooting deployment issues
