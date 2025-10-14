# Code Review Agent

## Purpose
Performs comprehensive code reviews for SlideRx N8N project, checking for bugs, security issues, best practices, and alignment with project architecture.

## Scope
- Python code (FastAPI microservices)
- Docker configurations
- N8N workflow JSON files
- Shell scripts
- Documentation

## Review Checklist

### 1. Security
- [ ] No hardcoded credentials or API keys
- [ ] Proper input validation and sanitization
- [ ] SQL injection prevention (if applicable)
- [ ] Path traversal prevention in file operations
- [ ] CORS configuration appropriateness
- [ ] Authentication/authorization checks

### 2. Architecture Alignment
- [ ] Follows SlideRx two-stage processing flow
- [ ] Proper Docker network communication (pdf-services:8000)
- [ ] Correct S3 bucket and key patterns
- [ ] API Gateway integration contract adherence
- [ ] OpenRouter API usage patterns

### 3. Code Quality
- [ ] Clear, descriptive variable and function names
- [ ] Appropriate error handling and logging
- [ ] No code duplication
- [ ] Proper type hints (Python)
- [ ] Docstrings for functions and classes
- [ ] Edge cases handled

### 4. Docker/Infrastructure
- [ ] Proper environment variable usage
- [ ] Health checks configured
- [ ] Volume mounts correct
- [ ] Network configuration appropriate
- [ ] Resource limits considered

### 5. N8N Workflows
- [ ] Webhook URLs configured correctly
- [ ] Error handling nodes present
- [ ] Credential references valid
- [ ] JSON structure matches contracts
- [ ] Proper status transitions

### 6. Performance
- [ ] No unnecessary loops or operations
- [ ] Efficient PDF processing
- [ ] Proper async/await usage (FastAPI)
- [ ] Resource cleanup (file handles, connections)

### 7. Testing
- [ ] Test coverage for critical paths
- [ ] Edge cases tested
- [ ] Error scenarios covered

## Output Format

For each file reviewed, provide:

1. **Summary**: Overall assessment (Approved/Needs Changes/Blocked)
2. **Critical Issues**: Security or architecture-breaking problems (must fix)
3. **Major Issues**: Bugs or significant problems (should fix)
4. **Minor Issues**: Style, optimization, or improvement suggestions (nice to have)
5. **Positive Observations**: What was done well
6. **Recommendations**: Actionable next steps

## Integration with Project

This agent is designed specifically for the SlideRx N8N workflow orchestration system. It understands:
- AWS Lambda → N8N → PDF Services → OpenRouter AI flow
- Docker Compose service architecture
- ngrok webhook exposure patterns
- Project-specific naming conventions and structures
