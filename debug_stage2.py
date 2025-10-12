#!/usr/bin/env python3
"""
Stage 2 Workflow Debugger for SlideRx N8N

This script provides comprehensive debugging and testing for the Stage 2 workflow,
including payload validation, step-by-step execution testing, and detailed logging.

Usage:
    python3 debug_stage2.py                    # Interactive mode
    python3 debug_stage2.py --test-full        # Run full workflow test
    python3 debug_stage2.py --validate-only    # Only validate payload format
    python3 debug_stage2.py --check-services   # Check all service health
"""

import requests
import json
import sys
import time
import argparse
from typing import Dict, Any, Optional
from datetime import datetime

# Configuration
N8N_BASE_URL = "http://localhost:5678"
PDF_SERVICE_URL = "http://localhost:8000"
NGROK_API = "http://localhost:4040/api/tunnels"

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text: str):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

def print_success(text: str):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text: str):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text: str):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def print_warning(text: str):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def print_step(step_num: int, text: str):
    print(f"\n{Colors.OKBLUE}{Colors.BOLD}[Step {step_num}] {text}{Colors.ENDC}")


# Sample test data matching the workflow's expected format
def get_sample_stage2_payload() -> Dict[str, Any]:
    """Generate a valid Stage 2 payload based on workflow expectations"""
    return {
        "projectId": "test-project-" + datetime.now().strftime("%Y%m%d-%H%M%S"),
        "userId": "test-user-123",
        "s3Key": "uploads/test-user-123/test-project/presentation.pdf",
        "projectBrief": {
            "successMetric": "Secure $500K seed funding to scale development",
            "industry": "SaaS / Business Analytics",
            "problemSolved": "SMBs struggle to interpret data and make data-driven decisions"
        },
        "summary": {
            "slides": [
                {
                    "index": 1,
                    "title": "Introduction to AI Analytics",
                    "bullets": [
                        "60% of SMBs struggle with data interpretation",
                        "Traditional analytics tools are too complex",
                        "Market opportunity: $12B addressable market"
                    ]
                },
                {
                    "index": 2,
                    "title": "Our Solution: Smart Dashboard",
                    "bullets": [
                        "AI-powered dashboard with automatic insights",
                        "Built for non-technical business owners",
                        "Proactive alerts and trend predictions"
                    ]
                },
                {
                    "index": 3,
                    "title": "Market Traction & Revenue Model",
                    "bullets": [
                        "85% beta user satisfaction",
                        "$50/month subscription model",
                        "$1.2M ARR projected by end of year one"
                    ]
                }
            ]
        },
        "reviewAndRefine": [
            {
                "id": "targetAudience",
                "question": "Who is your target audience?",
                "userAnswer": "Non-technical small business owners with limited data analysis experience"
            },
            {
                "id": "coreMessage",
                "question": "What is the core message of your presentation?",
                "userAnswer": "AI can make data analytics accessible to everyone, enabling better business decisions"
            },
            {
                "id": "businessGoal",
                "question": "What is your primary business goal?",
                "userAnswer": "Secure $500K seed funding to scale development and acquire first 5000 customers"
            }
        ]
    }


def check_services() -> Dict[str, bool]:
    """Check health of all required services"""
    print_header("Service Health Check")
    services = {}

    # Check PDF Service
    print_step(1, "Checking PDF Service")
    try:
        response = requests.get(f"{PDF_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            print_success(f"PDF Service: {response.json()}")
            services['pdf'] = True
        else:
            print_error(f"PDF Service returned status {response.status_code}")
            services['pdf'] = False
    except Exception as e:
        print_error(f"PDF Service unavailable: {e}")
        services['pdf'] = False

    # Check N8N
    print_step(2, "Checking N8N")
    try:
        response = requests.get(f"{N8N_BASE_URL}/healthz", timeout=5)
        if response.status_code == 200:
            print_success("N8N is running")
            services['n8n'] = True
        else:
            print_error(f"N8N returned status {response.status_code}")
            services['n8n'] = False
    except Exception as e:
        print_error(f"N8N unavailable: {e}")
        services['n8n'] = False

    # Check ngrok
    print_step(3, "Checking ngrok tunnel")
    try:
        response = requests.get(NGROK_API, timeout=5)
        if response.status_code == 200:
            tunnels = response.json().get('tunnels', [])
            if tunnels:
                public_url = tunnels[0]['public_url']
                print_success(f"ngrok tunnel active: {public_url}")
                services['ngrok'] = True
                services['ngrok_url'] = public_url
            else:
                print_warning("ngrok is running but no tunnels found")
                services['ngrok'] = False
        else:
            print_error("ngrok API not accessible")
            services['ngrok'] = False
    except Exception as e:
        print_warning(f"ngrok not running: {e}")
        services['ngrok'] = False

    return services


def validate_payload(payload: Dict[str, Any]) -> tuple[bool, list[str]]:
    """Validate Stage 2 payload structure"""
    print_header("Payload Validation")
    errors = []

    # Required top-level fields
    required_fields = ['projectId', 'userId', 's3Key', 'projectBrief', 'summary', 'reviewAndRefine']
    for field in required_fields:
        if field not in payload:
            errors.append(f"Missing required field: {field}")

    # Validate projectBrief structure
    if 'projectBrief' in payload:
        brief_fields = ['successMetric', 'industry', 'problemSolved']
        for field in brief_fields:
            if field not in payload['projectBrief']:
                errors.append(f"Missing projectBrief field: {field}")

    # Validate summary structure
    if 'summary' in payload:
        if 'slides' not in payload['summary']:
            errors.append("summary must contain 'slides' array")
        elif not isinstance(payload['summary']['slides'], list):
            errors.append("summary.slides must be an array")
        else:
            for idx, slide in enumerate(payload['summary']['slides']):
                if 'title' not in slide:
                    errors.append(f"Slide {idx} missing 'title'")
                if 'bullets' not in slide:
                    errors.append(f"Slide {idx} missing 'bullets'")

    # Validate reviewAndRefine structure
    if 'reviewAndRefine' in payload:
        if not isinstance(payload['reviewAndRefine'], list):
            errors.append("reviewAndRefine must be an array")
        else:
            required_ids = ['targetAudience', 'coreMessage', 'businessGoal']
            found_ids = [q.get('id') for q in payload['reviewAndRefine']]
            for req_id in required_ids:
                if req_id not in found_ids:
                    errors.append(f"Missing required reviewAndRefine question: {req_id}")

            for question in payload['reviewAndRefine']:
                if 'id' not in question:
                    errors.append("reviewAndRefine question missing 'id'")
                if 'userAnswer' not in question:
                    errors.append(f"Question {question.get('id', 'unknown')} missing 'userAnswer'")

    if errors:
        print_error("Payload validation failed:")
        for error in errors:
            print(f"  • {error}")
        return False, errors
    else:
        print_success("Payload validation passed")
        print_info(f"ProjectId: {payload.get('projectId')}")
        print_info(f"UserId: {payload.get('userId')}")
        print_info(f"Slides count: {len(payload.get('summary', {}).get('slides', []))}")
        print_info(f"User answers: {len(payload.get('reviewAndRefine', []))}")
        return True, []


def test_webhook_connectivity(webhook_url: str) -> bool:
    """Test if webhook is accessible"""
    print_header("Webhook Connectivity Test")
    print_info(f"Testing webhook: {webhook_url}")

    try:
        # Simple OPTIONS request to check if endpoint exists
        response = requests.options(webhook_url, timeout=10)
        if response.status_code in [200, 204, 404]:  # 404 is OK, means N8N is responding
            print_success("Webhook endpoint is accessible")
            return True
        else:
            print_warning(f"Unexpected status code: {response.status_code}")
            return True  # Still accessible
    except Exception as e:
        print_error(f"Webhook not accessible: {e}")
        return False


def send_stage2_request(webhook_url: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Send Stage 2 request and return response"""
    print_header("Sending Stage 2 Request")
    print_info(f"Webhook URL: {webhook_url}")
    print_info("Payload preview:")
    print(json.dumps(payload, indent=2)[:500] + "...")

    try:
        print_info("\nSending POST request...")
        response = requests.post(
            webhook_url,
            json={"body": payload},  # Wrap in body as N8N webhook expects
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'SlideRx-Stage2-Debugger/1.0'
            },
            timeout=180  # 3 minutes timeout for AI processing
        )

        print_info(f"Response status: {response.status_code}")

        if response.status_code == 200:
            print_success("Request successful!")
            result = response.json()
            print("\nResponse:")
            print(json.dumps(result, indent=2))
            return result
        else:
            print_error(f"Request failed with status {response.status_code}")
            print("Response body:")
            print(response.text[:1000])
            return None

    except requests.exceptions.Timeout:
        print_error("Request timed out (>180s)")
        print_warning("The workflow might still be processing. Check N8N logs.")
        return None
    except Exception as e:
        print_error(f"Request failed: {e}")
        return None


def test_pdf_generation_directly(slides_data: Dict[str, Any]) -> bool:
    """Test PDF generation service directly"""
    print_header("Direct PDF Service Test")

    test_payload = {
        "projectId": "test-direct-" + datetime.now().strftime("%H%M%S"),
        "slide1": {
            "title": "THE PROBLEM",
            "visual": "Icon showing confused business owner looking at complex dashboard",
            "sentence": "Small businesses waste hours trying to understand their data instead of growing their business."
        },
        "slide2": {
            "title": "THE SOLUTION",
            "visual": "Clean dashboard with AI assistant icon providing insights",
            "sentence": "Our AI translates complex data into plain English insights and actionable recommendations."
        },
        "slide3": {
            "title": "THE ASK",
            "visual": "Growth chart with funding milestone marker",
            "sentence": "We're raising $500K to bring accessible AI analytics to 5,000 small businesses."
        }
    }

    print_info("Testing PDF generation with sample data...")
    print(json.dumps(test_payload, indent=2))

    try:
        response = requests.post(
            f"{PDF_SERVICE_URL}/generate-pdf",
            json=test_payload,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )

        if response.status_code == 200:
            print_success("PDF generated successfully!")
            pdf_size = len(response.content)
            print_info(f"PDF size: {pdf_size:,} bytes")

            # Save test PDF
            test_file = f"/tmp/test-stage2-{datetime.now().strftime('%Y%m%d-%H%M%S')}.pdf"
            with open(test_file, 'wb') as f:
                f.write(response.content)
            print_success(f"Test PDF saved to: {test_file}")
            return True
        else:
            print_error(f"PDF generation failed: {response.status_code}")
            print(response.text[:500])
            return False
    except Exception as e:
        print_error(f"PDF generation test failed: {e}")
        return False


def show_n8n_logs(lines: int = 50):
    """Show recent N8N logs"""
    print_header("Recent N8N Logs")
    import subprocess
    try:
        result = subprocess.run(
            ['docker-compose', 'logs', '--tail', str(lines), 'n8n'],
            capture_output=True,
            text=True,
            cwd='/home/talab/sliderx-n8n'
        )
        print(result.stdout)
    except Exception as e:
        print_error(f"Failed to fetch logs: {e}")


def interactive_menu():
    """Interactive debugging menu"""
    print_header("SlideRx Stage 2 Workflow Debugger")

    while True:
        print("\nOptions:")
        print("  1. Check all services health")
        print("  2. Validate sample payload")
        print("  3. Test PDF generation directly")
        print("  4. Test webhook connectivity")
        print("  5. Run full Stage 2 workflow test")
        print("  6. View N8N logs")
        print("  7. Use custom payload from file")
        print("  8. Exit")

        choice = input("\nSelect option (1-8): ").strip()

        if choice == '1':
            check_services()

        elif choice == '2':
            payload = get_sample_stage2_payload()
            validate_payload(payload)

        elif choice == '3':
            test_pdf_generation_directly({})

        elif choice == '4':
            services = check_services()
            if services.get('ngrok_url'):
                webhook_url = f"{services['ngrok_url']}/webhook/sliderx-stage2"
                test_webhook_connectivity(webhook_url)
            else:
                print_error("ngrok URL not available")

        elif choice == '5':
            run_full_test()

        elif choice == '6':
            show_n8n_logs()

        elif choice == '7':
            file_path = input("Enter JSON file path: ").strip()
            try:
                with open(file_path, 'r') as f:
                    payload = json.load(f)
                validate_payload(payload)
            except Exception as e:
                print_error(f"Failed to load file: {e}")

        elif choice == '8':
            print_info("Exiting...")
            break

        else:
            print_warning("Invalid option")


def run_full_test():
    """Run complete Stage 2 workflow test"""
    print_header("Full Stage 2 Workflow Test")

    # Step 1: Check services
    print_step(1, "Checking services")
    services = check_services()

    if not services.get('n8n'):
        print_error("N8N is not running. Cannot proceed.")
        return False

    if not services.get('pdf'):
        print_error("PDF service is not running. Cannot proceed.")
        return False

    # Step 2: Get webhook URL
    print_step(2, "Getting webhook URL")
    if services.get('ngrok_url'):
        webhook_url = f"{services['ngrok_url']}/webhook/sliderx-stage2"
        print_success(f"Using ngrok URL: {webhook_url}")
    else:
        webhook_url = f"{N8N_BASE_URL}/webhook/sliderx-stage2"
        print_warning(f"Using local URL (won't work from external): {webhook_url}")

    # Step 3: Prepare payload
    print_step(3, "Preparing test payload")
    payload = get_sample_stage2_payload()
    valid, errors = validate_payload(payload)

    if not valid:
        print_error("Payload validation failed. Cannot proceed.")
        return False

    # Step 4: Test webhook connectivity
    print_step(4, "Testing webhook connectivity")
    if not test_webhook_connectivity(webhook_url):
        print_warning("Webhook connectivity test failed, but proceeding anyway...")

    # Step 5: Send request
    print_step(5, "Sending Stage 2 request")
    result = send_stage2_request(webhook_url, payload)

    if result:
        print_success("\n" + "="*80)
        print_success("STAGE 2 WORKFLOW TEST COMPLETED SUCCESSFULLY")
        print_success("="*80)
        return True
    else:
        print_error("\n" + "="*80)
        print_error("STAGE 2 WORKFLOW TEST FAILED")
        print_error("="*80)
        print_info("\nCheck N8N logs for more details:")
        print_info("  docker-compose logs -f n8n")
        return False


def main():
    parser = argparse.ArgumentParser(description='Debug SlideRx Stage 2 N8N Workflow')
    parser.add_argument('--test-full', action='store_true', help='Run full workflow test')
    parser.add_argument('--validate-only', action='store_true', help='Only validate payload')
    parser.add_argument('--check-services', action='store_true', help='Check service health')
    parser.add_argument('--test-pdf', action='store_true', help='Test PDF generation')
    parser.add_argument('--logs', action='store_true', help='Show N8N logs')
    parser.add_argument('--payload-file', type=str, help='Use custom payload from JSON file')

    args = parser.parse_args()

    if args.check_services:
        check_services()
    elif args.validate_only:
        payload = get_sample_stage2_payload()
        validate_payload(payload)
    elif args.test_pdf:
        test_pdf_generation_directly({})
    elif args.logs:
        show_n8n_logs()
    elif args.test_full:
        success = run_full_test()
        sys.exit(0 if success else 1)
    elif args.payload_file:
        try:
            with open(args.payload_file, 'r') as f:
                payload = json.load(f)
            validate_payload(payload)
        except Exception as e:
            print_error(f"Failed to load file: {e}")
            sys.exit(1)
    else:
        # Interactive mode
        interactive_menu()


if __name__ == '__main__':
    main()
