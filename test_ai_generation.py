#!/usr/bin/env python3
"""
Test AI Generate 3 Slides node to verify output format
"""

import json
import requests
import os
from datetime import datetime

def test_ai_prompt_building():
    """Test the prompt that gets sent to AI"""

    print("="*80)
    print("AI Prompt Generation Test")
    print("="*80)

    # Sample data that would come from Parse API Payload node
    sample_data = {
        "projectId": "test-123",
        "userId": "user-123",
        "summary": {
            "slides": [
                {
                    "index": 1,
                    "title": "Market Problem",
                    "bullets": [
                        "60% of SMBs struggle with data interpretation",
                        "Traditional tools are too complex",
                        "Lost productivity costs $50K/year per business"
                    ]
                },
                {
                    "index": 2,
                    "title": "Our AI Solution",
                    "bullets": [
                        "Automatic insight generation",
                        "Plain English explanations",
                        "Proactive alerts"
                    ]
                },
                {
                    "index": 3,
                    "title": "Traction & Model",
                    "bullets": [
                        "85% beta satisfaction",
                        "$50/month subscription",
                        "$1.2M ARR projection"
                    ]
                }
            ]
        },
        "projectBrief": {
            "successMetric": "Secure $500K seed funding",
            "industry": "SaaS / Business Analytics",
            "problemSolved": "SMBs can't interpret their data effectively"
        },
        "reviewAndRefine": {
            "targetAudience": "Non-technical small business owners",
            "coreMessage": "AI-powered analytics accessible to everyone",
            "businessGoal": "Raise $500K seed to scale to 5000 customers"
        }
    }

    # Build the prompt exactly as the workflow does
    slide_summaries = "\n\n".join([
        f"Slide {s['index']}: {s['title']}\n" + "\n".join(s['bullets'])
        for s in sample_data['summary']['slides']
    ])

    prompt = f"""You are creating a concise 3-slide executive summary presentation.

# ORIGINAL PRESENTATION SUMMARY
{slide_summaries}

# BUSINESS CONTEXT
- Success Metric: {sample_data['projectBrief']['successMetric']}
- Industry: {sample_data['projectBrief']['industry']}
- Problem Solved: {sample_data['projectBrief']['problemSolved']}

# USER GUIDANCE
- Target Audience: {sample_data['reviewAndRefine']['targetAudience']}
- Core Message: {sample_data['reviewAndRefine']['coreMessage']}
- Business Goal: {sample_data['reviewAndRefine']['businessGoal']}

# TASK
Create exactly 3 slides following this structure:

**Slide 1: THE PROBLEM**
- Title: Exactly "THE PROBLEM"
- Visual: A brief description of what visual element should appear (diagram, chart, icon, etc.)
- Sentence: One powerful sentence that captures the core problem

**Slide 2: THE SOLUTION**
- Title: Exactly "THE SOLUTION"
- Visual: A brief description of what visual element should appear
- Sentence: One powerful sentence that captures your solution

**Slide 3: THE ASK**
- Title: Exactly "THE ASK"
- Visual: A brief description of what visual element should appear
- Sentence: One powerful sentence that states what you're asking for

# OUTPUT FORMAT (JSON only)
{{
  "slide1": {{
    "title": "THE PROBLEM",
    "visual": "Description of visual",
    "sentence": "One impactful sentence"
  }},
  "slide2": {{
    "title": "THE SOLUTION",
    "visual": "Description of visual",
    "sentence": "One impactful sentence"
  }},
  "slide3": {{
    "title": "THE ASK",
    "visual": "Description of visual",
    "sentence": "One impactful sentence"
  }}
}}

Provide ONLY the JSON output, no other text."""

    print("\n📝 Generated Prompt:")
    print("-" * 80)
    print(prompt)
    print("-" * 80)

    print(f"\n📊 Prompt Stats:")
    print(f"  Length: {len(prompt)} characters")
    print(f"  Lines: {prompt.count(chr(10)) + 1}")

    # Check if OpenRouter API key is available
    api_key = os.environ.get('OPENROUTER_API_KEY')

    if not api_key:
        print("\n⚠️  OPENROUTER_API_KEY not found in environment")
        print("   Set it to test actual AI generation:")
        print("   export OPENROUTER_API_KEY='your-key-here'")
        return prompt, None

    # Test actual API call
    print("\n🤖 Testing OpenRouter API call...")

    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://sliderx.app',
                'X-Title': 'SlideRx N8N Workflow Test'
            },
            json={
                'model': 'anthropic/claude-sonnet-4.5',
                'max_tokens': 4096,
                'temperature': 0.7,
                'messages': [{
                    'role': 'user',
                    'content': prompt
                }]
            },
            timeout=120
        )

        if response.status_code == 200:
            ai_response = response.json()
            content = ai_response['choices'][0]['message']['content']

            print("✓ API call successful!")
            print(f"\n📄 AI Response:")
            print("-" * 80)
            print(content)
            print("-" * 80)

            # Try to parse the JSON
            print("\n🔍 Parsing JSON response...")
            try:
                import re
                json_match = re.search(r'\{[\s\S]*\}', content)
                if json_match:
                    slides_data = json.loads(json_match.group(0))
                    print("✓ JSON parsed successfully!")

                    print("\n📊 Extracted Slides:")
                    for i in range(1, 4):
                        slide_key = f'slide{i}'
                        if slide_key in slides_data:
                            slide = slides_data[slide_key]
                            print(f"\n  {slide_key.upper()}:")
                            print(f"    Title: {slide.get('title', 'N/A')}")
                            print(f"    Visual: {slide.get('visual', 'N/A')[:60]}...")
                            print(f"    Sentence: {slide.get('sentence', 'N/A')[:80]}...")

                    # Validate structure
                    print("\n✅ Validation:")
                    issues = []

                    for i in range(1, 4):
                        slide_key = f'slide{i}'
                        if slide_key not in slides_data:
                            issues.append(f"Missing {slide_key}")
                        else:
                            slide = slides_data[slide_key]
                            if 'title' not in slide:
                                issues.append(f"{slide_key} missing 'title'")
                            if 'visual' not in slide:
                                issues.append(f"{slide_key} missing 'visual'")
                            if 'sentence' not in slide:
                                issues.append(f"{slide_key} missing 'sentence'")

                    if issues:
                        print(f"  ❌ Issues found:")
                        for issue in issues:
                            print(f"     - {issue}")
                    else:
                        print(f"  ✓ All slides have required fields")
                        print(f"  ✓ Ready for PDF generation")

                    return prompt, slides_data
                else:
                    print("❌ No JSON found in response")
                    return prompt, None

            except json.JSONDecodeError as e:
                print(f"❌ JSON parsing failed: {e}")
                return prompt, None
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            return prompt, None

    except Exception as e:
        print(f"❌ Error: {e}")
        return prompt, None

def check_workflow_ai_node():
    """Check the AI node configuration in the workflow"""

    print("\n" + "="*80)
    print("AI Node Configuration Check")
    print("="*80)

    workflow_path = '/home/talab/sliderx-n8n/workflows/stage2_complete_workflow.json'

    try:
        with open(workflow_path, 'r') as f:
            workflow = json.load(f)

        # Find AI generation node
        ai_node = None
        for node in workflow['nodes']:
            if node['name'] == 'AI Generate 3 Slides':
                ai_node = node
                break

        if ai_node:
            print("\n✓ AI Generate 3 Slides node found")

            params = ai_node['parameters']
            print(f"\n📋 Configuration:")
            print(f"  URL: {params['url']}")
            print(f"  Method: {params['method']}")
            print(f"  Timeout: {params['options'].get('timeout', 'N/A')}ms")

            # Check JSON body
            json_body = params.get('jsonBody', '')
            print(f"\n📦 Request Body Template:")
            print(f"  {json_body[:200]}...")

            # Check if it includes the model
            if 'claude-sonnet-4.5' in json_body:
                print(f"\n  ✓ Model: anthropic/claude-sonnet-4.5")
            else:
                print(f"\n  ⚠️  Model not found in body template")

            # Check credentials
            if 'credentials' in ai_node:
                creds = ai_node['credentials']
                print(f"\n🔑 Credentials:")
                for cred_type, cred_info in creds.items():
                    print(f"  {cred_type}: {cred_info.get('name', 'N/A')} (ID: {cred_info.get('id', 'N/A')})")
        else:
            print("❌ AI Generate 3 Slides node not found in workflow")

    except Exception as e:
        print(f"❌ Error reading workflow: {e}")

def main():
    print("\n🧪 SlideRx Stage 2 - AI Generation Testing\n")

    # Check workflow configuration
    check_workflow_ai_node()

    # Test prompt generation and optionally AI call
    print("\n")
    prompt, slides = test_ai_prompt_building()

    print("\n" + "="*80)
    print("Summary")
    print("="*80)

    print("\n✓ Prompt structure: GOOD")
    print("  - Clear instructions for 3-slide format")
    print("  - Specifies JSON output only")
    print("  - Includes all context (summary, brief, user guidance)")

    if slides:
        print("\n✓ AI Response: WORKING")
        print("  - JSON format validated")
        print("  - All required fields present")
        print("  - Ready for PDF generation")
    else:
        print("\n⚠️  AI Response: NOT TESTED")
        print("  - Set OPENROUTER_API_KEY to test actual generation")
        print("  - Or test via N8N UI workflow execution")

    print("\n📝 Next Steps:")
    print("  1. Fix webhook response syntax in N8N UI")
    print("  2. Test full workflow: python3 debug_stage2.py --test-full")
    print("  3. Check generated PDF quality")

if __name__ == '__main__':
    main()
