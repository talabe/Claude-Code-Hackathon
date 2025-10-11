# SlideRx → n8n Flow Overview

---

## Two-Stage AI Process

This integration connects SlideRx’s AWS backend with n8n AI workflows to process presentation decks in two AI stages:

### Stage 1 — Extraction & Review Preparation

n8n extracts text from the uploaded deck and generates:

- A concise slide-by-slide summary.
- A set of “Review & Refine” follow-up questions for the user.

These are sent back to the API, which updates DynamoDB and sets the project status to needs_review.

### Stage 2 — Final Generation

After the user answers the follow-up questions, the API triggers n8n again with the complete project data.
The AI then generates a refined presentation, uploads it to S3 and SlideRx marks the project as complete and generate the pre-signed url for download.

---

baseUrl = `https://f9yntj41f4.execute-api.eu-central-1.amazonaws.com/dev`

## Workflow - Stage 1

Input (from Lambda → n8n)

Triggered when user uploads a PDF to `sliderx-uploads-dev`. The payload includes the S3 file key and project metadata.

n8n should:

- Download the file from S3.
- Extract and summarize slides.
- Generate follow-up (“Review & Refine”) questions.
- Send the results back to the SlideRx API callback below.

## Ai -> Follow up Questions

**Endpoint:**  
`POST baseUrl/projects/{projectId}/ai/callback`

Sample Payload:

```json
{
  "userId": "{userId}",
  "summary": {
    "slides": [
      {
        "index": 1,
        "title": "Intro",
        "bullets": ["Why this matters", "Market opportunity", "Company vision"]
      }
    ]
  },
  "reviewAndRefine": [
    {
      "id": "targetAudience",
      "type": "select",
      "label": "Who is this presentation primarily aimed at?",
      "options": [
        "Investors",
        "Potential customers",
        "Internal leadership",
        "Strategic partners"
      ],
      "required": true,
      "userAnswer": ""
    },
    {
      "id": "coreMessage",
      "type": "longText",
      "label": "What is the key message or takeaway you want the audience to remember?",
      "required": true,
      "userAnswer": ""
    },
    {
      "id": "businessGoal",
      "type": "select",
      "label": "What best describes your main business goal for this presentation?",
      "options": [
        "Fundraising / attracting investors",
        "Product launch or marketing",
        "Internal alignment and strategy",
        "Client acquisition or sales enablement"
      ],
      "required": true,
      "userAnswer": ""
    }
  ]
}
```

Once this is received, the UI automatically detects the updated status (`needs_review`) and renders these new fields for user input.

## Workflow - Stage 2

Input (from Lambda → n8n)

- n8n receives a full project record, including the original file, project brief, user answers and AI summary.
- n8n should create the 3 slides presentation and upload it to `sliderx-outputs-dev`

Example of path:
`/outputs/test-vitor/1600852f-9694-478a-926b-49fa06b4ed36/result.pdf`

Sample Payload (to n8n webhook):

```json
{
  "PK": "USER#test-vitor",
  "businessPurpose": "Use Case Presentation",
  "createdAt": "1760013859471",
  "fileKey": "uploads/test-vitor/1600852f-9694-478a-926b-49fa06b4ed36/presentation.pdf",
  "fileName": "01-Team-SlideRx-Hackathon-Kickoff-Summary.pdf",
  "projectBrief": {
    "successMetric": "Quis labore deleniti totam vel labore eum",
    "industry": "Voluptatem omnis quod sit dolores accusamus tenetur quasi",
    "problemSolved": "Hic beatae error nisi alias quaerat et voluptates impedit facilis culpa"
  },
  "projectId": "1600852f-9694-478a-926b-49fa06b4ed36",
  "projectName": "Neil Stevens",
  "reviewAndRefine": [
    {
      "options": [
        "Investors",
        "Potential customers",
        "Internal leadership",
        "Strategic partners"
      ],
      "id": "targetAudience",
      "label": "Who is this presentation primarily aimed at?",
      "userAnswer": "Hello",
      "type": "select",
      "required": true
    },
    {
      "id": "coreMessage",
      "label": "What is the key message or takeaway you want the audience to remember?",
      "userAnswer": "Hello2",
      "type": "longText",
      "required": true
    },
    {
      "options": [
        "Fundraising / attracting investors",
        "Product launch or marketing",
        "Internal alignment and strategy",
        "Client acquisition or sales enablement"
      ],
      "id": "businessGoal",
      "label": "What best describes your main business goal for this presentation?",
      "userAnswer": "Hello3",
      "type": "select",
      "required": true
    }
  ],
  "status": "generating presentation",
  "summary": {
    "slides": [
      {
        "title": "Intro",
        "index": 1,
        "bullets": ["Why this matters", "Market opportunity", "Company vision"]
      }
    ]
  },
  "updatedAt": 1760023916194,
  "userId": "test-vitor",
  "SK": "PROJ#1600852f-9694-478a-926b-49fa06b4ed36"
}
```

S3 updates the DynamoDB record automatically and the frontend then detects this change and displays the download button with a pre-signed URL to the user.

---
