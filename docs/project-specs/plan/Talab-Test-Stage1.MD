# Talab Test (UI)

baseUrl = `https://f9yntj41f4.execute-api.eu-central-1.amazonaws.com/dev`

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
  "userId": "test-user",
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
