# SlideRx Workflows - Testing Checklist

## Pre-Deployment Testing

Complete all tests before sharing webhook URLs with production team.

---

## ✅ Stage 1 Testing

### Test 1: Happy Path - Valid PDF
**Objective**: Verify complete Stage 1 flow with valid input

**Test Data**:
```json
{
  "projectId": "test-happy-001",
  "s3Bucket": "sliderx-uploads-dev",
  "s3Key": "uploads/test-user/test-happy-001/valid-presentation.pdf",
  "projectBrief": {
    "successMetric": "Increase revenue by 50%",
    "industry": "B2B SaaS",
    "problemSolved": "Marketing automation"
  }
}
```

**Expected Results**:
- [ ] Webhook returns 200 OK
- [ ] Response contains `"success": true`
- [ ] PDF downloaded from S3
- [ ] Text extracted successfully
- [ ] AI analysis completes
- [ ] API callback receives data
- [ ] Callback payload has `userId`, `summary`, `reviewAndRefine`
- [ ] `reviewAndRefine` contains exactly 3 questions
- [ ] Each question has empty `userAnswer`
- [ ] N8N execution shows all green nodes
- [ ] Execution time < 2 minutes

---

### Test 2: S3 Download Error
**Objective**: Verify error handling for missing S3 file

**Test Data**:
```json
{
  "projectId": "test-s3-error-002",
  "s3Bucket": "sliderx-uploads-dev",
  "s3Key": "uploads/test-user/invalid/nonexistent.pdf",
  "projectBrief": {
    "successMetric": "Test",
    "industry": "Test",
    "problemSolved": "Test"
  }
}
```

**Expected Results**:
- [ ] Webhook returns 500 error
- [ ] Response contains `"success": false`
- [ ] Error message mentions S3 or download failure
- [ ] `failedAt` field indicates "S3 Download" or similar
- [ ] Error logged in N8N execution
- [ ] "Check S3 Error" node triggered
- [ ] "Handle Error" node executed
- [ ] No API callback sent

---

### Test 3: PDF Extraction Error
**Objective**: Verify error handling for corrupted PDF

**Setup**: Upload corrupted/invalid PDF to S3

**Test Data**:
```json
{
  "projectId": "test-extract-error-003",
  "s3Bucket": "sliderx-uploads-dev",
  "s3Key": "uploads/test-user/test-extract-error-003/corrupted.pdf",
  "projectBrief": {
    "successMetric": "Test",
    "industry": "Test",
    "problemSolved": "Test"
  }
}
```

**Expected Results**:
- [ ] Webhook returns 500 error
- [ ] Error mentions PDF extraction failure
- [ ] `failedAt` indicates extraction step
- [ ] S3 download succeeded
- [ ] PDF service error caught
- [ ] No AI call made

---

### Test 4: AI Analysis Error
**Objective**: Verify error handling for AI failures

**Setup**: Temporarily use invalid OpenRouter API key

**Test Data**: Use valid project data

**Expected Results**:
- [ ] Webhook returns 500 error
- [ ] Error mentions AI or OpenRouter
- [ ] `failedAt` indicates AI analysis
- [ ] PDF extracted successfully
- [ ] AI error caught and handled
- [ ] No API callback sent

**Cleanup**: Restore correct API key

---

### Test 5: Large PDF Performance
**Objective**: Verify handling of large presentations

**Setup**: Upload 50+ slide PDF (5-10 MB)

**Expected Results**:
- [ ] Workflow completes successfully
- [ ] Execution time < 4 minutes
- [ ] No timeout errors
- [ ] All slides summarized
- [ ] Summary contains multiple slide objects

---

### Test 6: Missing projectBrief Fields
**Objective**: Verify handling of incomplete input

**Test Data**:
```json
{
  "projectId": "test-missing-006",
  "s3Bucket": "sliderx-uploads-dev",
  "s3Key": "uploads/test-user/test-missing-006/presentation.pdf",
  "projectBrief": {
    "successMetric": "",
    "industry": "",
    "problemSolved": ""
  }
}
```

**Expected Results**:
- [ ] Workflow completes (doesn't crash)
- [ ] AI handles missing context gracefully
- [ ] Summary still generated
- [ ] Questions still included

---

## ✅ Stage 2 Testing

### Test 7: Happy Path - Valid Answers
**Objective**: Verify complete Stage 2 flow

**Test Data**:
```json
{
  "projectId": "test-stage2-007",
  "userId": "test-user",
  "s3Key": "uploads/test-user/test-stage2-007/presentation.pdf",
  "projectBrief": {
    "successMetric": "Raise $2M seed round",
    "industry": "FinTech",
    "problemSolved": "Payment reconciliation"
  },
  "summary": {
    "slides": [
      {
        "index": 1,
        "title": "Company Overview",
        "bullets": ["Founded 2023", "10 customers", "$100K ARR"]
      },
      {
        "index": 2,
        "title": "Problem",
        "bullets": ["Manual reconciliation", "High error rate", "Time consuming"]
      },
      {
        "index": 3,
        "title": "Solution",
        "bullets": ["AI-powered automation", "99% accuracy", "10x faster"]
      }
    ]
  },
  "reviewAndRefine": [
    {
      "id": "targetAudience",
      "userAnswer": "Investors"
    },
    {
      "id": "coreMessage",
      "userAnswer": "We automate payment reconciliation for e-commerce businesses, saving 20 hours per week"
    },
    {
      "id": "businessGoal",
      "userAnswer": "Fundraising / attracting investors"
    }
  ]
}
```

**Expected Results**:
- [ ] Webhook returns 200 OK
- [ ] Response contains `"success": true`
- [ ] AI generates 3 slides
- [ ] Slide 1 title: "THE PROBLEM"
- [ ] Slide 2 title: "THE SOLUTION"
- [ ] Slide 3 title: "THE ASK"
- [ ] Each slide has `title`, `visual`, `sentence`
- [ ] PDF generated successfully
- [ ] PDF uploaded to S3
- [ ] S3 key format: `outputs/test-user/test-stage2-007/result.pdf`
- [ ] PDF is downloadable and valid
- [ ] Execution time < 3 minutes

---

### Test 8: AI Generation Error
**Objective**: Verify error handling for AI failures

**Setup**: Temporarily use invalid OpenRouter API key

**Test Data**: Use valid Stage 2 data

**Expected Results**:
- [ ] Webhook returns 500 error
- [ ] Error mentions AI generation
- [ ] `failedAt` indicates AI step
- [ ] No PDF generated
- [ ] No S3 upload

**Cleanup**: Restore correct API key

---

### Test 9: PDF Generation Error
**Objective**: Verify error handling for PDF service failures

**Setup**: Stop pdf-services container
```bash
docker-compose stop pdf-services
```

**Test Data**: Use valid Stage 2 data

**Expected Results**:
- [ ] Webhook returns 500 error
- [ ] Error mentions PDF generation
- [ ] `failedAt` indicates PDF service
- [ ] AI generation succeeded
- [ ] PDF service error caught
- [ ] No S3 upload

**Cleanup**: Restart pdf-services
```bash
docker-compose start pdf-services
```

---

### Test 10: S3 Upload Error
**Objective**: Verify error handling for S3 failures

**Setup**: Use invalid AWS credentials or wrong bucket

**Test Data**: Use valid Stage 2 data with wrong bucket

**Expected Results**:
- [ ] Webhook returns 500 error
- [ ] Error mentions S3 upload
- [ ] PDF generated successfully
- [ ] S3 error caught
- [ ] `failedAt` indicates S3 upload

**Cleanup**: Restore correct credentials

---

### Test 11: Missing User Answers
**Objective**: Verify handling of incomplete answers

**Test Data**: Use Stage 2 data with empty `userAnswer` fields

**Expected Results**:
- [ ] Workflow completes (doesn't crash)
- [ ] AI generates slides (may be generic)
- [ ] PDF created
- [ ] PDF uploaded

---

### Test 12: Long User Answers
**Objective**: Verify handling of verbose input

**Test Data**: Use 500+ word answer for `coreMessage`

**Expected Results**:
- [ ] Workflow completes successfully
- [ ] AI processes long text
- [ ] Generated slides are concise (not verbose)
- [ ] PDF generated correctly

---

## ✅ Integration Testing

### Test 13: Full E2E Flow
**Objective**: Test complete Stage 1 → Stage 2 flow

**Steps**:
1. Trigger Stage 1 with valid PDF
2. Wait for API callback
3. Simulate user answering questions
4. Trigger Stage 2 with answers
5. Verify final PDF

**Expected Results**:
- [ ] Stage 1 completes successfully
- [ ] Stage 2 receives correct context
- [ ] Final PDF reflects user guidance
- [ ] Total time < 5 minutes
- [ ] No data lost between stages

---

### Test 14: Concurrent Requests
**Objective**: Verify handling of multiple simultaneous projects

**Steps**:
1. Trigger 3 Stage 1 workflows simultaneously
2. Monitor executions

**Expected Results**:
- [ ] All 3 complete successfully
- [ ] No interference between executions
- [ ] Each project has correct data
- [ ] No memory/performance issues

---

### Test 15: Webhook Authentication (Future)
**Objective**: Verify security measures

**Currently**: No authentication implemented

**Future Test**:
- [ ] Invalid auth token rejected
- [ ] Missing auth header rejected
- [ ] Valid token accepted
- [ ] Token validation logged

---

## ✅ Performance Testing

### Test 16: Response Time Benchmarks
**Objective**: Measure typical execution times

**Test Multiple Executions** (5+ times each):

**Stage 1**:
- [ ] Avg time: ________ seconds
- [ ] Min time: ________ seconds
- [ ] Max time: ________ seconds
- [ ] Target: < 120 seconds

**Stage 2**:
- [ ] Avg time: ________ seconds
- [ ] Min time: ________ seconds
- [ ] Max time: ________ seconds
- [ ] Target: < 180 seconds

---

### Test 17: Timeout Handling
**Objective**: Verify timeout configurations work

**Test Methods**:
1. Use extremely large PDF (20+ MB)
2. Monitor for timeout errors
3. Verify graceful failure

**Expected Results**:
- [ ] Timeout triggers error handler
- [ ] Error message indicates timeout
- [ ] No hanging requests
- [ ] Clean error response

---

## ✅ Data Validation

### Test 18: Output Format Validation
**Objective**: Verify all outputs match Postman spec

**Stage 1 Callback Validation**:
- [ ] Has `userId` (string)
- [ ] Has `summary` (object)
- [ ] `summary.slides` is array
- [ ] Each slide has `index`, `title`, `bullets`
- [ ] `bullets` is array of strings
- [ ] Has `reviewAndRefine` (array)
- [ ] Exactly 3 questions in `reviewAndRefine`
- [ ] Each question has required fields
- [ ] `userAnswer` is empty string

**Stage 2 Response Validation**:
- [ ] Has `success` (boolean)
- [ ] Has `projectId` (string)
- [ ] Has `s3Key` (string)
- [ ] Has `message` (string)
- [ ] Has `status` (string: "ready")

---

### Test 19: Edge Cases
**Objective**: Test unusual but valid inputs

**Test Cases**:
1. [ ] PDF with only 1 slide
2. [ ] PDF with 100+ slides
3. [ ] PDF with images only (no text)
4. [ ] PDF with special characters (unicode)
5. [ ] PDF with tables and charts
6. [ ] Very short user answers (1 word)
7. [ ] User answers with special chars
8. [ ] ProjectId with special characters

---

## ✅ Error Recovery

### Test 20: Retry After Error
**Objective**: Verify workflow can be re-executed after failure

**Steps**:
1. Cause error (e.g., stop pdf-services)
2. Note the error
3. Fix the issue
4. Re-trigger same workflow
5. Verify success

**Expected Results**:
- [ ] First execution fails correctly
- [ ] Second execution succeeds
- [ ] No data corruption
- [ ] Same projectId can be retried

---

## 📊 Testing Summary

### Completion Status

**Stage 1 Tests**: _____ / 6 passed
**Stage 2 Tests**: _____ / 6 passed
**Integration Tests**: _____ / 3 passed
**Performance Tests**: _____ / 2 passed
**Validation Tests**: _____ / 2 passed
**Recovery Tests**: _____ / 1 passed

**Total**: _____ / 20 tests passed

### Critical Issues Found

1. ________________________________
2. ________________________________
3. ________________________________

### Non-Critical Issues

1. ________________________________
2. ________________________________
3. ________________________________

### Performance Metrics

- Stage 1 avg time: ________ seconds
- Stage 2 avg time: ________ seconds
- Success rate: ________ %
- Error rate: ________ %

---

## 🚀 Pre-Production Checklist

Before going live:

### Infrastructure
- [ ] N8N running and stable
- [ ] PDF services running and healthy
- [ ] ngrok tunnel active (or production domain configured)
- [ ] AWS S3 credentials valid
- [ ] OpenRouter API key valid and funded

### Workflows
- [ ] Both workflows imported
- [ ] Both workflows activated
- [ ] Credentials configured
- [ ] All tests passed
- [ ] Error handling tested

### Monitoring
- [ ] Log monitoring configured
- [ ] Alert system ready (optional)
- [ ] Execution history cleared
- [ ] Performance baseline established

### Documentation
- [ ] Webhook URLs shared with backend
- [ ] API contract verified
- [ ] Troubleshooting guide available
- [ ] Team trained on monitoring

### Security
- [ ] Credentials stored securely
- [ ] No API keys in logs
- [ ] No sensitive data exposed
- [ ] Webhook auth planned (if needed)

---

## 📞 Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor all executions
- [ ] Check error rates
- [ ] Verify API callbacks received
- [ ] Validate S3 uploads
- [ ] Review performance metrics

### First Week
- [ ] Analyze common errors
- [ ] Optimize slow steps
- [ ] Gather user feedback
- [ ] Plan improvements

---

## ✅ Sign-Off

**Tester**: ________________________________

**Date**: ________________________________

**Ready for Production**: ☐ YES  ☐ NO

**Notes**: ________________________________
___________________________________________
___________________________________________
