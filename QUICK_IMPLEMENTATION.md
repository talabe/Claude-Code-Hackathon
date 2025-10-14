# Quick Implementation Reference

## Stage 1: 3 Nodes to Update

### 1. Node: "Prepare AI Request"
**Action:** Replace entire function code with content from `/tmp/stage1_improved_prompt.txt`

**Key Changes:**
- Added system prompt
- Increased max_tokens: 4096 → 8000
- Lowered temperature: (none) → 0.2
- Enhanced output structure with metadata, narrative, keyMetrics

---

### 2. Node: "Format API Callback"
**Action:** Update to handle new JSON structure

**New Code:**
```javascript
// Parse AI response and format for API callback (UPDATED FOR NEW STRUCTURE)
const aiResponse = $input.item.json;
const userId = $node['Parse Lambda Payload'].json.userId;
const projectId = $node['Parse Lambda Payload'].json.projectId;

// Extract summary from AI response
let summary;
try {
  const content = aiResponse.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const fullData = JSON.parse(jsonMatch[0]);
    if (fullData.slides) {
      summary = fullData;
    } else {
      throw new Error('No slides array found in response');
    }
  } else {
    throw new Error('No JSON found in response');
  }
} catch (error) {
  console.error('AI parsing error:', error.message);
  summary = {
    presentationMetadata: { totalSlides: 0, overallQuality: 0 },
    slides: [{
      index: 1,
      title: 'Summary Not Available',
      textContent: ['AI analysis failed to parse', 'Please retry'],
      category: 'other'
    }]
  };
}

const reviewAndRefine = [
  {
    id: 'targetAudience',
    type: 'select',
    label: 'Who is this presentation primarily aimed at?',
    options: ['Investors', 'Potential customers', 'Internal leadership', 'Strategic partners'],
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

---

### 3. Node: "AI Analysis - OpenRouter"
**Action:** No changes needed - already configured correctly

The improved prompt includes system message in requestBody, so the HTTP Request node will use it automatically.

---

## Stage 2: 2 Nodes to Update

### 1. Node: "Prepare AI Prompt"
**Action:** Replace entire function code with content from `/tmp/stage2_improved_prompt.txt`

**Key Changes:**
- Added audience-specific tone mapping
- Rich context extraction from Stage 1
- Enhanced visual description requirements
- 10-20 word sentence constraints
- Narrative flow guidance

---

### 2. Node: "AI Generate 3 Slides"
**Action:** Update JSON body in HTTP Request

**New JSON Body:**
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

**Key Changes:**
- Added system role message
- Increased max_tokens: 4096 → 8000
- Lowered temperature: 0.7 → 0.3
- Added top_p: 0.95

---

## Testing Procedure

1. **Access N8N:** http://localhost:5678
2. **Update Stage 1 nodes** (3 nodes)
3. **Update Stage 2 nodes** (2 nodes)
4. **Save both workflows**
5. **Test Stage 1:**
   - Trigger with test payload
   - Check execution log
   - Verify new JSON structure in output
6. **Test Stage 2:**
   - Trigger with Stage 1 output
   - Check execution log
   - Verify improved slide quality

---

## Validation Checklist

**Stage 1 Output Should Have:**
- ✅ `presentationMetadata` object
- ✅ `narrative` object with problem/solution/ask
- ✅ `keyMetrics` object
- ✅ `slidesByCategory` object
- ✅ Each slide has `category` field
- ✅ Each slide has `extractedNumbers` if applicable

**Stage 2 Output Should Have:**
- ✅ Detailed visual descriptions (20+ words)
- ✅ Sentences between 10-20 words
- ✅ Specific numbers/metrics in sentences
- ✅ Audience-appropriate tone

---

## Quick Rollback

If issues occur:

```bash
# Backup current state
docker exec sliderx-n8n n8n export:workflow --all --output=/tmp/backup_$(date +%Y%m%d).json

# Restore from original exports
# Go to N8N UI → Import → Select original workflow files
```

---

## Files Reference

- **Stage 1 improved prompt:** `/tmp/stage1_improved_prompt.txt`
- **Stage 2 improved prompt:** `/tmp/stage2_improved_prompt.txt`
- **Full guide:** `/home/talab/sliderx-n8n/AI_PROMPT_IMPROVEMENTS_GUIDE.md`
- **Original workflows:** `/home/talab/sliderx-n8n/workflows/stage*_complete_workflow.json`
