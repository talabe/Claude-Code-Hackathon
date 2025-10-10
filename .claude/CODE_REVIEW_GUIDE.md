# Code Review Agent Guide

## Overview

The SlideRx N8N Code Review Agent helps maintain code quality, security, and architectural consistency across the project.

## Usage

### Quick Review of Current Changes

```bash
/review
```

Reviews all staged or unstaged git changes in your working directory.

### Review Specific Files

```bash
/review pdf_services.py docker-compose.yml
```

Reviews the specified files individually.

### Review a Pull Request or Branch

```bash
/review-pr feature/new-workflow
/review-pr main...feature/new-workflow
```

Reviews all changes in a branch comparison.

## What Gets Reviewed

### 1. Security Checks
- No hardcoded credentials, API keys, or secrets
- Proper input validation (especially for file uploads)
- SQL injection prevention
- Path traversal protection
- CORS configuration
- Authentication/authorization

### 2. Architecture Compliance
- **Two-stage workflow integrity**: Changes don't break stage1→stage2 flow
- **Docker networking**: Services communicate via `pdf-services:8000`
- **AWS contracts**: Input/output JSON matches Lambda and API Gateway expectations
- **S3 patterns**: Correct bucket names and key structures
- **ngrok webhooks**: Proper webhook URL configuration

### 3. Code Quality
- Clear naming conventions
- Comprehensive error handling
- Type hints in Python code
- Docstrings for functions/classes
- No code duplication
- Edge case handling

### 4. Docker/Infrastructure
- Environment variables properly used
- Health checks configured
- Volume mounts correct
- Network setup appropriate
- Container dependencies handled

### 5. N8N Workflow Validation
- Webhook URLs match ngrok patterns
- Error handling nodes present
- Credential references valid
- JSON structures match contracts
- Status transitions (needs_review → ready)

### 6. Performance
- No unnecessary operations
- Efficient PDF processing
- Proper async/await in FastAPI
- Resource cleanup (files, connections)

## Review Output Format

Each review provides:

1. **Summary**: Overall assessment
   - ✅ Approved: Ready to merge
   - ⚠️ Needs Changes: Issues to address
   - 🚫 Blocked: Critical problems

2. **Critical Issues**: Must fix before merging
   - Security vulnerabilities
   - Breaking architectural changes
   - Data loss risks

3. **Major Issues**: Should fix
   - Bugs or logical errors
   - Performance problems
   - Missing error handling

4. **Minor Issues**: Nice to have
   - Style improvements
   - Optimization opportunities
   - Documentation gaps

5. **Positive Observations**: What was done well

6. **Recommendations**: Actionable next steps

## Examples

### Example 1: Review PDF Service Changes

```bash
/review pdf_services.py
```

The agent will check:
- FastAPI route definitions
- PDF extraction/generation logic
- Error handling for malformed PDFs
- File cleanup after processing
- Health check endpoint
- Type hints and validation

### Example 2: Review Docker Configuration

```bash
/review docker-compose.yml
```

The agent will verify:
- Service dependencies correct
- Environment variables set properly
- Network configuration
- Volume mounts
- Port mappings
- Health checks

### Example 3: Review N8N Workflow

```bash
/review plan/n8n_workflow_stage1.json
```

The agent will validate:
- Webhook node configuration
- AWS S3 credential references
- OpenRouter API call structure
- Error handling paths
- JSON output format
- Status field values

## Integration with Development Workflow

### Before Committing

```bash
/review
```

Quick check of your changes before creating a commit.

### Before Creating PR

```bash
/review-pr feature/my-changes
```

Comprehensive review of all branch changes.

### After Code Changes Requested

```bash
/review [specific-files]
```

Re-review only the files you modified.

## Customization

The review agent configuration is stored in:
- [.claude/agents/code-reviewer.md](.claude/agents/code-reviewer.md): Agent behavior and checklist
- [.claude/commands/review.md](.claude/commands/review.md): Review command definition
- [.claude/commands/review-pr.md](.claude/commands/review-pr.md): PR review command definition

You can modify these files to adjust review criteria, add project-specific checks, or change output format.

## Tips for Best Results

1. **Commit often**: Smaller changesets get better reviews
2. **Be specific**: Use file-specific reviews for targeted feedback
3. **Context matters**: The agent understands SlideRx architecture—mention if changes relate to specific stages
4. **Fix critical first**: Address security and architecture issues before style
5. **Ask questions**: If review feedback is unclear, ask Claude to explain

## Common Review Scenarios

### Adding a New Endpoint

The agent will check:
- Route definition and HTTP method
- Input validation (Pydantic models)
- Error responses (400, 500, etc.)
- Integration with existing services
- Documentation/docstring

### Modifying N8N Workflow

The agent will verify:
- Backward compatibility with existing data
- Webhook contracts unchanged (or coordinated with backend)
- Credential migrations needed
- Testing strategy for workflow changes

### Updating Docker Setup

The agent will review:
- Service restart implications
- Data persistence (volumes)
- Network connectivity impacts
- Environment variable changes
- Rollback strategy

## Troubleshooting

**Q: Review says "No changes to review"**
- Ensure you have unstaged changes or specify files explicitly

**Q: Agent doesn't understand project-specific patterns**
- Check that [CLAUDE.md](../CLAUDE.md) is up to date with current architecture

**Q: Want different review criteria**
- Edit [.claude/agents/code-reviewer.md](.claude/agents/code-reviewer.md)

**Q: Need to review non-code files**
- The agent can review any text file—just specify it explicitly

## Related Resources

- [CLAUDE.md](../CLAUDE.md): Project architecture and conventions
- [Docker Compose](../docker-compose.yml): Service configuration
- [PDF Services](../pdf_services.py): FastAPI microservice
- [N8N Workflows](../plan/): Workflow definitions and contracts
