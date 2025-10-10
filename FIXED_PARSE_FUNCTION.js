// Parse incoming Lambda payload with safety checks
const input = $input.item.json;

// Handle both direct payload and wrapped in body
const payload = input.body || input;

// Extract parameters with defaults
const projectId = payload.projectId;
const s3Bucket = payload.s3Bucket || 'sliderx-uploads-dev';
const s3Key = payload.s3Key;
const projectBrief = payload.projectBrief || {};

// Validate required fields
if (!projectId) {
  throw new Error('Missing required field: projectId');
}
if (!s3Key) {
  throw new Error('Missing required field: s3Key');
}

// Extract userId from s3Key path: uploads/{userId}/{projectId}/...
const pathParts = s3Key.split('/');
const userId = pathParts[1] || 'unknown-user';

return {
  json: {
    projectId,
    userId,
    s3Bucket,
    s3Key,
    projectBrief,
    timestamp: new Date().toISOString()
  }
};
