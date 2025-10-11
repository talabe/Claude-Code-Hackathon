# Projects (UI)

All endpoints are asynchronous. Users can close/refresh; processing continues.

baseUrl = `https://f9yntj41f4.execute-api.eu-central-1.amazonaws.com/dev`

Temporary auth: include x-user-id on all requests. Once Cognito is in, this will be replaced by the authenticated user context.

Status lifecycle

uploading → processing → needs_review → generating_presentation → complete → (failed on errors)

---

## 1. Start Project → Get Upload URL

**Endpoint:**  
`POST baseUrl/projects`

**Header:**

```
Content-Type: application/json
x-user-id: phil-user
```

**Body:**

```json
{
  "businessPurpose": "Status Update",
  "projectName": "Test Project",
  "projectBrief": {
    "projectPhase": "Kickoff phase concluded",
    "keyMetrics": "34 user stories created",
    "currentBlockers": "None"
  },
  "fileName": "presentation.pdf"
}
```

**What Happens:**

- Creates the project and a project with status=`uploading`
- Returns a pre-signed S3 PUT URL for the PDF.

**Example Response:**

```json
{
  "projectId": "74e495d7-8169-4b72-91dc-7445ec0757cc",
  "userId": "test-vitor",
  "uploadUrl": "https://sliderx-uploads-dev.s3...."
}
```

- Use the uploadUrl exactly as returned.
- Don’t add custom headers; they can invalidate the signature.
- Set Content-Type: application/pdf

**Example of a call from your side:**

```bash
curl -v -X PUT -T ./download.pdf \
  -H "Content-Type: application/pdf" \
  "https://sliderx-uploads-dev.s3.eu-central-1.amazonaws.com/uploads/test-user/74e495d7-8169-4b72-91dc-7445ec0757cc/presentation.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD.....=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
```

**After successful upload**

- Backend flips project to `processing`.
- UI should immediately begin polling `Get Project Details` (below).

---

## 2. Get Project Details (and poll for changes)

**Endpoint:**  
`GET baseUrl/projects/{projectId}`

**Header:**

```
x-user-id: phil-user
```

**Response (while `processing`):**

```json
{
  "projectId": "df00a9eb-0a5a-4071-a850-1355dec8e395",
  "status": "processing",
  "createdAt": "2025-10-09T19:02:16.210Z",
  "updatedAt": "2025-10-09T19:05:30.098Z",
  "projectBrief": {
    "projectPhase": "Kickoff phase concluded",
    "keyMetrics": "34 user stories created",
    "currentBlockers": "None"
  },
  "businessPurpose": "Status Update",
  "projectName": "Test Project",
  "reviewAndRefine": null,
  "summary": null,
  "downloadUrl": null
}
```

**Response (When `needs_review`):** (AI follow-ups ready)

```json
{
  "projectId": "1600852f-9694-478a-926b-49fa06b4ed36",
  "status": "needs_review",
  "createdAt": "2025-10-09T12:44:19.471Z",
  "updatedAt": "2025-10-09T15:33:46.206Z",
  "businessPurpose": "Use Case Presentation",
  "projectName": "Neil Stevens",
  "projectBrief": {
    "successMetric": "Quis labore deleniti totam vel labore eum",
    "industry": "Voluptatem omnis quod sit dolores accusamus tenetur quasi",
    "problemSolved": "Hic beatae error nisi alias quaerat..."
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
  ],
  "summary": {
    "slides": [
      {
        "index": 1,
        "title": "Intro",
        "bullets": ["Why this matters", "Market opportunity", "Company vision"]
      }
    ]
  },
  "downloadUrl": null
}
```

**Response (When `complete`):**

**THIS WILL ONLY HAPPEN AFTER STEP 3** (below)

```json
{
  "projectId": "df00a9eb-0a5a-4071-a850-1355dec8e395",
  "status": "complete",
  "updatedAt": "2025-10-09T19:25:11.865Z",
  "downloadUrl": "https://sliderx-outputs-dev.s3.eu-central-1.amazonaws.com/outputs/test-vitor/df00a9eb-0a5a-4071-a850-1355dec8e395/presentation.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-C...&x-id=GetObject"
}
```

---

## 3. Submit Answers

**Endpoint:**  
`POST baseUrl/projects/{projectId}`

**Headers:**

```
Content-Type: application/json
x-user-id: phil-user
```

**Body (example):**

```json
{
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
      "userAnswer": "Investors"
    },
    {
      "id": "coreMessage",
      "type": "longText",
      "label": "What is the key message or takeaway you want the audience to remember?",
      "required": true,
      "userAnswer": "We automate investor-ready summaries from long decks."
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
      "userAnswer": "Fundraising / attracting investors"
    }
  ]
}
```

**Response:**

```json
{
  "ok": true,
  "projectId": "1600852f-9694-478a-926b-49fa06b4ed36",
  "updated": {
    "reviewAndRefine": true,
    "status": "generating presentation"
  },
  "forwardedToN8n": true,
  "method": "POST"
}
```

**Purpose:**  
Send the completed `reviewAndRefine` back (with `userAnswers` filled).  
Server persists it, flips status to `generating presentation` and triggers stage-2 in n8n.

UI should now poll `Get Project Details` until status= `complete`.

---

## 4. List My Projects

**Endpoint:**  
`GET baseUrl/projects`

**Headers:**

```
Content-Type: application/json
x-user-id: phil-user
```

**Purpose:**  
Feed a screen where the user can see all their projects.  
It only takes “x-user-id” as a parameter and returns the list of projects for that user.

**Header:**

```
x-user-id: phil-user
```

**Query (reserved for future pagination)**

- limit (default 20)
- nextToken (opaque)
- sort (default -updatedAt)

**Response:**

```json
{
  "items": [
    {
      "projectId": "abc",
      "projectName": "Weekly Update",
      "status": "complete",
      "updatedAt": "2025-10-09T19:25:11.865Z"
    },
    {
      "projectId": "def",
      "projectName": "Q4 Plan",
      "status": "needs_review",
      "updatedAt": "2025-10-09T18:12:03.000Z"
    }
  ],
  "nextToken": null
}
```
