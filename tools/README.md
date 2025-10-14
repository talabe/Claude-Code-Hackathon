# SlideRx Development Tools

This directory contains utility scripts and tools for development and debugging.

## Contents

### browse_s3.py
Python script for browsing S3 buckets during development and testing.

**Usage:**
```bash
python3 tools/browse_s3.py
```

### fix_openrouter_node.py
Utility script to fix OpenRouter API node configurations in N8N workflows.

**Usage:**
```bash
python3 tools/fix_openrouter_node.py
```

### Dockerfile.s3browser
Dockerfile for running the S3 browser in a containerized environment.

**Usage:**
```bash
docker build -f tools/Dockerfile.s3browser -t sliderx-s3browser .
docker run -p 8080:8080 sliderx-s3browser
```

## Note

These are development utilities and are not required for production deployment. See the main project documentation in `/CLAUDE.md` for production setup instructions.
