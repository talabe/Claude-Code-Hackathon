Review the current changes or specified files using the SlideRx code review agent.

If files are specified as arguments (e.g., `/review pdf_services.py docker-compose.yml`), review those specific files.

If no arguments provided, review recent git changes (staged or unstaged).

Follow the code review checklist from `.claude/agents/code-reviewer.md` and provide:
1. Summary assessment
2. Critical issues (security/architecture)
3. Major issues (bugs/problems)
4. Minor issues (style/optimization)
5. Positive observations
6. Actionable recommendations

Focus on SlideRx-specific concerns:
- Two-stage workflow integrity
- Docker service communication
- AWS/S3 integration contracts
- N8N workflow patterns
- Security (no hardcoded credentials)
- FastAPI best practices
