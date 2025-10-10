Review a specific pull request or branch comparison.

Usage: `/review-pr [branch-name]` or `/review-pr [base]...[compare]`

Examples:
- `/review-pr feature/new-endpoint` - Compare feature branch with current branch
- `/review-pr main...feature/new-endpoint` - Compare specific branch range

Performs comprehensive code review of all changes in the PR/branch:
1. Lists all changed files
2. Reviews each file according to SlideRx code review standards
3. Checks for breaking changes to:
   - Two-stage workflow contracts
   - AWS API integration
   - Docker service communication
   - N8N webhook endpoints
4. Validates security practices
5. Provides PR-level summary with approval recommendation

Output includes:
- Overall PR assessment (Approve/Request Changes/Block)
- File-by-file review
- Breaking changes alert
- Test coverage recommendations
- Deployment considerations
