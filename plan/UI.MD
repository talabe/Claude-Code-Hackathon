# Projects (UI)

These are the endpoints the UI interacts with directly.  
All services communicate asynchronously, so the user can close the browser or refresh anytime, processing continues in the background.

---

## 1. Start Project → Get Upload URL

**Endpoint:**  
`POST /projects`

**Purpose:**  
Start a new project and get a pre-signed S3 URL for the PDF upload.

**Header:**

```
Content-Type: application/json
x-user-id: phil-user
```

> For now, you can use a hardcoded user on “x-user-id”. Once we implement Cognito, it will use the user id automatically.

**Body:**  
Includes the answers for those 4 questions that you capture on the UI and showed us on the video.  
“fileName” can be hardcoded as “presentation.pdf” for now.

```json
{
  "businessPurpose": "Status Update",
  "projectPhase": "Kickoff phase concluded",
  "keyMetrics": "34 user stories created",
  "currentBlockers": "None",
  "fileName": "presentation.pdf"
}
```

**What Happens:**  
This call will create a user on the DB and set the status to `"uploading"`.  
It will return a pre-signed URL that you can use to upload the PDF file without having to deal with credentials on your side.

**Example Response:**

```json
{
  "projectId": "74e495d7-8169-4b72-91dc-7445ec0757cc",
  "uploadUrl": "https://sliderx-uploads-dev.s3...."
}
```

**Example of a call from your side:**

```bash
curl -v -X PUT -T ./download.pdf \
  -H "Content-Type: application/pdf" \
  "https://sliderx-uploads-dev.s3.eu-central-1.amazonaws.com/uploads/test-user/74e495d7-8169-4b72-91dc-7445ec0757cc/presentation.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD.....=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
```

When S3 confirms the PDF is uploaded, the project status is marked as `"processing"`.  
You can do this just after a successful upload.

---

## 2. List My Projects

**Endpoint:**  
`GET /projects`

**Purpose:**  
Feed a screen where the user can see all their projects.  
It only takes “x-user-id” as a parameter and returns the list of projects for that user.

**Header:**

```
x-user-id: phil-user
```

---

## 3. Get Project Details

**Endpoint:**  
`GET /projects/{projectId}`

**Purpose:**  
This endpoint has 2 jobs:

1. Load an individual project (for example, after being selected from the list).  
   We don’t want to send the full data from every project in the previous call.

2. Allow the UI to poll the database for updates, like the questions the user must answer or the final output once processing finishes.

---

All this is happening **asynchronously**, so if the user refreshes the page, closes the browser, or loses connection, it doesn’t matter,
the services continue running independently and the UI just listens for changes when it reconnects.
