# Claude Agents for SlideRx N8N

This directory contains specialized Claude agents and commands for working with the SlideRx N8N workflow orchestration system.

## Quick Start

### Available Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/review` | Review code changes | `/review pdf_services.py` |
| `/review-pr` | Review pull request | `/review-pr feature/new-endpoint` |
| `/debug-workflow` | Debug workflow issues | `/debug-workflow stage1` |
| `/build-workflow` | Create/modify workflows | `/build-workflow add retry logic` |
| `/deploy` | Deploy and configure | `/deploy health check all services` |

### Quick Examples

```bash
# Review your current changes
/review

# Debug why webhook isn't working
/debug-workflow webhook not triggering

# Build a new workflow feature
/build-workflow add email notifications

# Deploy updates
/deploy update workflows to production

# Review before creating PR
/review-pr my-feature-branch
```

## Agents

### 1. Code Review Agent
**File**: [agents/code-reviewer.md](agents/code-reviewer.md)
**Commands**: `/review`, `/review-pr`

Reviews code for:
- Security issues (hardcoded secrets, injection vulnerabilities)
- Architecture alignment (SlideRx two-stage flow, Docker networking)
- Code quality (error handling, type hints, documentation)
- Best practices (FastAPI, N8N, Docker)

**When to use:**
- Before committing code
- Before creating pull requests
- After addressing review feedback
- When refactoring

**Example:**
```bash
# Review current uncommitted changes
/review

# Review specific files
/review docker-compose.yml pdf_services.py

# Review all changes in a branch
/review-pr feature/add-notifications
```

### 2. Workflow Debugger Agent
**File**: [agents/workflow-debugger.md](agents/workflow-debugger.md)
**Command**: `/debug-workflow`

Diagnoses and troubleshoots:
- Workflow execution failures
- Webhook connectivity issues
- Integration problems (S3, OpenRouter, PDF service)
- Docker network issues
- Performance and timeout problems

**When to use:**
- Workflow executions failing
- Webhooks not triggering
- Integration errors (S3, AI, PDF)
- After deployment issues
- Performance problems

**Example:**
```bash
# Debug specific workflow
/debug-workflow stage1

# Debug by symptom
/debug-workflow webhook not triggering
/debug-workflow pdf generation timing out
```

### 3. Workflow Builder Agent
**File**: [agents/workflow-builder.md](agents/workflow-builder.md)
**Command**: `/build-workflow`

Creates and modifies workflows:
- Design new workflow stages
- Add features to existing workflows
- Optimize performance
- Implement best practices
- Configure integrations

**When to use:**
- Creating new workflows
- Adding features (retry logic, notifications)
- Optimizing existing workflows
- Implementing error handling
- Setting up new integrations

**Example:**
```bash
# Create new workflow
/build-workflow create stage 3 for presentation editing

# Add feature to existing
/build-workflow add retry logic to S3 operations

# Optimize
/build-workflow reduce stage1 execution time
```

### 4. Deployment Helper Agent
**File**: [agents/deployment-helper.md](agents/deployment-helper.md)
**Command**: `/deploy`

Manages deployment and operations:
- Environment setup (dev/staging/prod)
- Deploy updates safely
- Backup and restore
- Configuration management
- Health monitoring
- Troubleshooting

**When to use:**
- Setting up new environments
- Deploying updates
- Backing up data
- Migrating credentials
- Health checks
- Rollback scenarios

**Example:**
```bash
# Setup new environment
/deploy setup staging environment

# Deploy updates
/deploy update to latest version

# Backup
/deploy backup n8n data

# Health check
/deploy health check all services
```

## Directory Structure

```
.claude/
├── README.md                          # This file
├── CODE_REVIEW_GUIDE.md              # Detailed code review guide
├── settings.local.json                # Claude permissions
├── agents/                            # Agent configurations
│   ├── code-reviewer.md              # Code review agent
│   ├── workflow-debugger.md          # Debugging agent
│   ├── workflow-builder.md           # Workflow creation agent
│   └── deployment-helper.md          # Deployment agent
└── commands/                          # Slash commands
    ├── review.md                      # Code review command
    ├── review-pr.md                   # PR review command
    ├── debug-workflow.md              # Debug command
    ├── build-workflow.md              # Build workflow command
    └── deploy.md                      # Deployment command
```

## Common Workflows

### 1. Adding a New Feature

```bash
# 1. Build the workflow/code
/build-workflow add user notification system

# 2. Implement the changes
# (write code based on agent suggestions)

# 3. Review your work
/review

# 4. Fix any issues identified
# (address review feedback)

# 5. Test locally
/deploy health check all services

# 6. Create PR
/review-pr feature/notifications
```

### 2. Debugging Production Issue

```bash
# 1. Diagnose the problem
/debug-workflow stage2 failing in production

# 2. Review recent changes
/review-pr main...production

# 3. Plan fix
/build-workflow fix stage2 timeout issue

# 4. Test deployment
/deploy health check all services

# 5. Deploy fix
/deploy update production with hotfix
```

### 3. Setting Up New Environment

```bash
# 1. Deploy infrastructure
/deploy setup staging environment

# 2. Verify health
/deploy health check all services

# 3. Test workflows
/debug-workflow test stage1 and stage2

# 4. Review configuration
/review docker-compose.yml .env
```

## Best Practices

### Using Agents Effectively

1. **Be Specific**: Provide context and specific file names when possible
2. **Chain Commands**: Use multiple agents for complex tasks
3. **Review Often**: Run `/review` before commits
4. **Debug First**: Use `/debug-workflow` before modifying code
5. **Document Changes**: Agents help, but you should understand changes

### Agent Limitations

- Agents provide **suggestions**, not absolute truth—use judgment
- Always **test** before deploying
- Agents understand SlideRx architecture but **verify** critical changes
- For complex issues, **combine** multiple agents
- Agents can't access production logs—provide relevant **context**

### Customization

All agents can be customized by editing their markdown files:

```bash
# Edit agent behavior
nano .claude/agents/code-reviewer.md

# Edit command description
nano .claude/commands/review.md

# Add new agent
nano .claude/agents/my-custom-agent.md

# Add new command
nano .claude/commands/my-command.md
```

## Troubleshooting

### Commands Not Showing Up

Check that files are in correct locations:
- Commands: `.claude/commands/*.md`
- Agents: `.claude/agents/*.md`

Restart Claude if needed.

### Agent Giving Generic Responses

Provide more context:
- Specify file names
- Include error messages
- Describe what you've tried
- Reference specific workflows

### Need Different Review Criteria

Edit [.claude/agents/code-reviewer.md](agents/code-reviewer.md) checklist

### Permission Issues

Check [.claude/settings.local.json](settings.local.json) for allowed commands

## Resources

- [SlideRx Architecture](../CLAUDE.md) - Project overview and architecture
- [Code Review Guide](CODE_REVIEW_GUIDE.md) - Detailed review documentation
- [Docker Compose](../docker-compose.yml) - Service configuration
- [PDF Services](../pdf_services.py) - FastAPI microservice
- [N8N Workflows](../plan/) - Workflow definitions

## Contributing

To add new agents or commands:

1. Create agent config: `.claude/agents/my-agent.md`
2. Define capabilities and output format
3. Create command: `.claude/commands/my-command.md`
4. Document usage in this README
5. Test with real scenarios

## Support

- Ask Claude: "Explain how to use [agent/command]"
- Check documentation in each agent file
- Review examples in this README
- Experiment with different command variations

---

**Remember**: These agents are tools to help you work faster and more safely. Always review their suggestions, test thoroughly, and use your judgment.
