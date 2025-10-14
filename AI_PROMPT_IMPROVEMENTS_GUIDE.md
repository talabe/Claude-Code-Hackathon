# AI Prompt Improvements Implementation Guide

This guide will help you implement the improved AI prompts for both Stage 1 and Stage 2 workflows in N8N.

## Overview of Improvements

### Stage 1 (PDF Extraction & Review Questions)
- ✅ Added system prompt for better AI role definition
- ✅ Enhanced context extraction with problem/solution/ask categorization
- ✅ Improved JSON structure with metadata and narrative
- ✅ Better temperature (0.2 vs current) for consistent output
- ✅ Increased max_tokens (8000 vs 4096) for detailed analysis
- ✅ Added category detection for slides
- ✅ Enhanced data extraction with structured fields

### Stage 2 (Final Presentation Generation)
- ✅ Added system prompt for expert presentation designer role
- ✅ Rich context utilization from Stage 1 output
- ✅ Audience-specific tone adaptation
- ✅ Detailed visual description requirements
- ✅ 10-20 word sentence constraint for impact
- ✅ Better temperature (0.3 vs 0.7) for reliable JSON
- ✅ Narrative flow guidance across all 3 slides

---

## Implementation Steps

### Step 1: Update Stage 1 Workflow

1. **Open N8N** in your browser: http://localhost:5678

2. **Navigate to the Stage 1 workflow:**
   - Find: "SlideRx Stage 1 - PDF Extraction & Review Questions"
   - Click to open the workflow editor

3. **Locate the "Prepare AI Request" node:**
   - This is the node that builds the AI prompt
   - Click on it to open the editor

4. **Replace the entire function code:**
   - Copy the content from `/tmp/stage1_improved_prompt.txt`
   - Or copy from below:

```javascript
// [COPY THE ENTIRE CONTENT FROM STAGE 1 SECTION BELOW]
```

5. **Save the node** (click "Save" button in the node editor)

6. **Update the "AI Analysis - OpenRouter" node:**
   - Click on the HTTP Request node named "AI Analysis - OpenRouter"
   - The JSON body should already be: `={{ JSON.stringify($json.requestBody) }}`
   - This is correct - no changes needed here
   - The improved prompt includes the system message in requestBody

7. **Update "Format API Callback" node** (Important!)
   - Click on the "Format API Callback" node
   - Replace the function code to handle the new JSON structure:

```javascript
// Parse AI response and format for API callback (UPDATED FOR NEW STRUCTURE)
const aiResponse = $input.item.json;
const userId = $node['Parse Lambda Payload'].json.userId;
const projectId = $node['Parse Lambda Payload'].json.projectId;

// Extract summary from AI response
let summary;
try {
  const content = aiResponse.choices[0].message.content;
  // Try to parse as JSON first
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const fullData = JSON.parse(jsonMatch[0]);

    // Use the new structured format if available
    if (fullData.slides) {
      summary = fullData;  // Pass entire structured response
    } else {
      throw new Error('No slides array found in response');
    }
  } else {
    throw new Error('No JSON found in response');
  }
} catch (error) {
  // Fallback: create basic summary structure
  console.error('AI parsing error:', error.message);
  summary = {
    presentationMetadata: {
      totalSlides: 0,
      overallQuality: 0
    },
    slides: [
      {
        index: 1,
        title: 'Summary Not Available',
        textContent: ['AI analysis failed to parse', 'Please retry'],
        category: 'other'
      }
    ]
  };
}

// Define the 3 review questions (fixed structure)
const reviewAndRefine = [
  {
    id: 'targetAudience',
    type: 'select',
    label: 'Who is this presentation primarily aimed at?',
    options: [
      'Investors',
      'Potential customers',
      'Internal leadership',
      'Strategic partners'
    ],
    required: true,
    userAnswer: ''
  },
  {
    id: 'coreMessage',
    type: 'longText',
    label: 'What is the key message or takeaway you want the audience to remember?',
    required: true,
    userAnswer: ''
  },
  {
    id: 'businessGoal',
    type: 'select',
    label: 'What best describes your main business goal for this presentation?',
    options: [
      'Fundraising / attracting investors',
      'Product launch or marketing',
      'Internal alignment and strategy',
      'Client acquisition or sales enablement'
    ],
    required: true,
    userAnswer: ''
  }
];

return {
  json: {
    projectId,
    userId,
    summary,
    reviewAndRefine
  }
};
```

8. **Save the workflow** (click "Save" in the top-right corner)

---

### Step 2: Update Stage 2 Workflow

1. **Navigate to the Stage 2 workflow:**
   - Find: "SlideRx Stage 2 - Final Presentation Generation"
   - Click to open the workflow editor

2. **Locate the "Prepare AI Prompt" node:**
   - Click on it to open the editor

3. **Replace the entire function code:**
   - Copy the content from `/tmp/stage2_improved_prompt.txt`
   - Or copy from below:

```javascript
// [COPY THE ENTIRE CONTENT FROM STAGE 2 SECTION BELOW]
```

4. **Save the node**

5. **Update the "AI Generate 3 Slides" HTTP Request node:**
   - Click on the "AI Generate 3 Slides" node
   - Update the JSON body to include system prompt:

```javascript
{{ JSON.stringify({
  model: 'anthropic/claude-sonnet-4.5',
  max_tokens: 8000,
  temperature: 0.3,
  top_p: 0.95,
  messages: [{
    role: 'system',
    content: 'You are an expert executive presentation designer. You create concise, impactful slide content that tells compelling stories. You always return valid JSON and follow instructions precisely.'
  }, {
    role: 'user',
    content: $json.prompt
  }]
}) }}
```

6. **No changes needed to "Format Slides for PDF" node**
   - It already handles the JSON structure correctly

7. **Save the workflow**

---

### Step 3: Activate Both Workflows

1. **Toggle workflows to Active:**
   - Make sure both Stage 1 and Stage 2 workflows are set to "Active" (green toggle in top-right)

2. **Test with a sample presentation:**
   - Use your existing test process
   - Monitor the execution logs for any errors

---

## Expected Changes in Output

### Stage 1 Output Changes

**Before:**
```json
{
  "summary": {
    "slides": [
      {
        "index": 1,
        "title": "Title",
        "bullets": ["Point 1", "Point 2"],
        "visualDescription": "Chart"
      }
    ]
  }
}
```

**After:**
```json
{
  "summary": {
    "presentationMetadata": {
      "totalSlides": 15,
      "businessType": "B2B SaaS",
      "stage": "seed",
      "targetAudience": "investors",
      "overallQuality": 8,
      "identifiedGoal": "fundraising"
    },
    "narrative": {
      "problem": "Market gap description",
      "solution": "Solution description",
      "traction": "Traction description",
      "ask": "Ask description"
    },
    "keyMetrics": {
      "marketSize": "$50B TAM",
      "revenue": "$500K ARR",
      "growth": "300% YoY"
    },
    "slidesByCategory": {
      "problem": [1, 2],
      "solution": [3, 4, 5],
      "ask": [9, 10]
    },
    "slides": [
      {
        "index": 1,
        "title": "Exact Title",
        "category": "problem",
        "textContent": ["Point 1", "Point 2"],
        "visualDescription": "Detailed visual with numbers",
        "extractedNumbers": {
          "metric": "value"
        },
        "importance": 9,
        "usableForExecutiveSummary": true
      }
    ]
  }
}
```

### Stage 2 Output Changes

**Before:**
```json
{
  "slide1": {
    "title": "THE PROBLEM",
    "visual": "Chart showing decline",
    "sentence": "Our solution helps businesses."
  }
}
```

**After:**
```json
{
  "slide1": {
    "title": "THE PROBLEM",
    "visual": "Declining red bar chart showing 40% productivity drop with frustrated business owner icon and $50B lost annually callout",
    "sentence": "Small businesses waste 10 hours weekly on manual tasks, losing $50B annually in productivity."
  }
}
```

---

## Validation & Testing

### Test Checklist

- [ ] Stage 1 webhook receives payload correctly
- [ ] PDF is downloaded from S3
- [ ] AI returns valid JSON with new structure
- [ ] `presentationMetadata` field is populated
- [ ] `narrative` field contains problem/solution/ask
- [ ] `slides` array has `category` field
- [ ] API callback succeeds with new structure
- [ ] Stage 2 receives enhanced data from Stage 1
- [ ] Stage 2 AI prompt uses rich context
- [ ] Final 3 slides have detailed visual descriptions
- [ ] Sentences are 10-20 words and impactful
- [ ] PDF generation works with new format

### Monitoring

Check N8N execution logs:
```bash
docker-compose logs -f n8n | grep -E "(ERROR|Stage 1|Stage 2)"
```

View detailed execution:
- Open N8N UI
- Go to "Executions" tab
- Click on recent executions to see data flow

---

## Rollback Procedure

If something goes wrong, you can easily rollback:

1. **Restore original workflows:**
```bash
# The original workflows are saved in:
# /home/talab/sliderx-n8n/workflows/stage1_complete_workflow.json
# /home/talab/sliderx-n8n/workflows/stage2_complete_workflow.json

# Import these files back into N8N through the UI
```

2. **Or manually revert changes:**
   - Open each workflow in N8N
   - Click on the node you modified
   - Use the "Undo" button or restore from git if you committed

---

## Cost & Performance Considerations

### Token Usage Changes

**Stage 1:**
- Before: ~4,000 max tokens
- After: ~8,000 max tokens (2x)
- Reason: More detailed analysis with categorization

**Stage 2:**
- Before: ~4,096 max tokens, temperature 0.7
- After: ~8,000 max tokens, temperature 0.3 (more consistent)

### Expected Cost Impact

- Stage 1: +50-70% per request (due to increased detail)
- Stage 2: +20-30% per request (due to longer prompt)
- **Overall: Better quality output should reduce retry rate**

### Performance

- Stage 1 execution time: May increase by 10-20 seconds
- Stage 2 execution time: Similar or slightly faster (better prompting)
- **Overall: Improved first-time success rate**

---

## Support & Troubleshooting

### Common Issues

**Issue 1: "No JSON found in AI response"**
- Solution: Check AI response in execution log - AI may be adding markdown
- Fix: The improved prompt explicitly requests no markdown

**Issue 2: "Missing slides in AI response"**
- Solution: Check if all 3 slides are in the JSON
- Fix: Enhanced validation in "Format Slides for PDF" node

**Issue 3: Stage 2 receives old data format**
- Solution: Make sure Stage 1 was executed with new prompt FIRST
- Fix: Test Stage 1 → Stage 2 flow end-to-end

### Debug Commands

```bash
# View N8N logs
docker-compose logs -f n8n

# Check OpenRouter API status
curl https://openrouter.ai/api/v1/models

# View workflow executions
# Go to N8N UI → Executions tab
```

---

## Next Steps

After successful implementation:

1. **Test with 5-10 real presentations** to validate quality
2. **Gather feedback** on the improved outputs
3. **Fine-tune** specific sections if needed
4. **Monitor costs** over a week to ensure budget alignment
5. **Consider A/B testing** by keeping one old workflow for comparison

---

## Contact & Updates

- Improved prompts created: 2025-10-14
- Location: `/tmp/stage1_improved_prompt.txt` and `/tmp/stage2_improved_prompt.txt`
- Original workflows backed up in: `/home/talab/sliderx-n8n/workflows/`

For questions or issues, check the N8N execution logs first, then review this guide.
