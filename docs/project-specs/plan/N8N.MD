# SlideRx → n8n Flow (Options)

Once the **S3 upload completes**, we trigger **n8n** and pass the S3 object info to the **“Receive Job”** webhook (as shared by Talab). From there, we have two options:

---

## Option 1 — Two-stage AI (recommended)

1. **Extract & Prepare**

   - Extract text from the deck.
   - Prepare inputs for AI.
   - Send **presentation + projectBrief** to the AI.

2. **AI returns**

   - **`reviewAndRefine`**: an object with follow-up questions for the user.
   - **`summary`**: a per-slide summary to match the screen Phil showed in the video.
   - We **POST** these back to the API to persist in the DB and set status to `needs_review`.

3. **User answers & refine**
   - The UI detects the status change and pulls the additional questions.
   - After the user submits answers, the API triggers **n8n** again with **projectBrief + reviewAndRefine + summary + answers**.
   - The AI generates the **final presentation**, saves it to S3, and we flip status to `ready` so the user can download.

> This runs fast in practice; breaking it down just makes the flow explicit.  
> The key is to keep everything **asynchronous** with **per-step retries** so a transient failure doesn’t force the user to start again.

**n8n topology:**  
Use **two flows** with single responsibility, **or** one flow that branches by stage if you prefer to manage a single webhook.

**API shape (example project payload):**

```json
{
  "projectId": "item.projectId",
  "status": "item.status",
  "createdAt": "toIsoMaybeEpochMillis(item.createdAt)",
  "updatedAt": "toIsoMaybeEpochMillis(item.updatedAt)",
  "projectBrief": {
    "keyMetrics": "item?.keyMetrics ?? null",
    "projectPhase": "item?.projectPhase ?? null",
    "currentBlockers": "item?.currentBlockers ?? null",
    "businessPurpose": "item?.businessPurpose ?? null"
  },
  "reviewAndRefine": "item.reviewAndRefine ?? null",
  "summary": "item.summary ?? null",
  "downloadUrl": "item.downloadUrl ?? null"
}
```

---

## Option 2 — Single-shot AI

Skip the user follow-ups and return the **final presentation** on the first pass as the shared image.

- Pros: simpler UX, fewer round trips.
- Cons: lower quality without user guidance; less control over tone/length/content.

---
