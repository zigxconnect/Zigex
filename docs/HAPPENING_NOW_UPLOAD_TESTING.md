# Testing the Two-Step Upload Solution

## Overview
This document provides testing instructions for the refactored happening_now upload system that uses presigned URLs to bypass Next.js payload limits.

## What Changed

### Before (❌ Broken in Production)
- Files uploaded through Next.js API route
- Payload size: 6 images + 30MB video = potentially 100MB+
- Hit 4.5MB Next.js App Router limit
- Error: "FUNCTION_PAYLOAD_TOO_LARGE"

### After (✅ Production Ready)
- Files uploaded directly to Supabase Storage
- API payload size: < 10KB (just URLs and metadata)
- No Next.js payload limits
- Scalable and fast

## Testing Locally

### 1. Test Presigned URL Generation

**Endpoint**: `POST /api/happening-now/upload-urls`

**Request**:
```bash
curl -X POST http://localhost:3000/api/happening-now/upload-urls \
  -H "Content-Type: application/json" \
  -d '{"imageCount": 3, "hasVideo": true}'
```

**Expected Response**:
```json
{
  "success": true,
  "uploadUrls": {
    "images": [
      {
        "index": 0,
        "uploadUrl": "https://[project].supabase.co/storage/v1/object/upload/sign/media/happening-now/images/[timestamp]-0?token=...",
        "path": "happening-now/images/[timestamp]-0"
      },
      // ... more images
    ],
    "video": {
      "uploadUrl": "https://[project].supabase.co/storage/v1/object/upload/sign/media/happening-now/videos/[timestamp]?token=...",
      "path": "happening-now/videos/[timestamp]"
    }
  },
  "expiresIn": 3600
}
```

**Verification**:
- ✅ Response contains signed URLs for all requested images
- ✅ Video URL present if `hasVideo: true`
- ✅ URLs contain `token=` parameter
- ✅ Paths follow pattern: `happening-now/images/[timestamp]-[index]`

---

### 2. Test Direct Upload to Supabase Storage

You can test this using the browser console or a test script:

```javascript
// In browser console after getting presigned URLs
const testUpload = async () => {
  // Get presigned URLs first
  const urlResponse = await fetch('/api/happening-now/upload-urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageCount: 1, hasVideo: false })
  });
  
  const { uploadUrls } = await urlResponse.json();
  const imageUploadInfo = uploadUrls.images[0];
  
  // Create a test file
  const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  
  // Upload using Supabase client
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const token = imageUploadInfo.uploadUrl.split('token=')[1];
  
  const { data, error } = await supabase.storage
    .from('media')
    .uploadToSignedUrl(imageUploadInfo.path, token, testFile);
  
  console.log('Upload result:', { data, error });
};

testUpload();
```

**Verification**:
- ✅ Upload completes without errors
- ✅ File appears in Supabase Storage bucket `media`
- ✅ File path matches: `happening-now/images/[timestamp]-0`

---

### 3. Test Complete Upload Flow

Use the actual UI to test the complete flow:

1. Navigate to the happening now upload page
2. Select 2-3 images
3. Add captions for each image
4. Optionally add a video (< 30MB)
5. Click upload

**Monitor Console Output**:
```
📤 Received save request:
  - Company: [company name]
  - Is Live: [true/false]
  - Image URLs: 3
  - Video: Yes/No
  - Captions count: 3
💾 Saving to database...
✅ Data saved successfully
```

**Verification**:
- ✅ Upload progress indicator works
- ✅ No "FUNCTION_PAYLOAD_TOO_LARGE" errors
- ✅ Files appear in Supabase Storage
- ✅ Data saved to `happening_now` table
- ✅ Content displays correctly on frontend

---

### 4. Test Large Batch Upload

Test with maximum allowed files:

1. Select 6 images (maximum allowed)
2. Add a video close to 30MB
3. Upload

**Verification**:
- ✅ All 6 images upload successfully
- ✅ Video uploads successfully
- ✅ No payload size errors
- ✅ Upload completes in reasonable time
- ✅ All content displays correctly

---

## Testing in Production

### Pre-Deployment Checklist

- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is set in production environment
- [ ] Verify `ADMIN_EMAIL` is set in production environment
- [ ] Verify Supabase Storage bucket `media` exists
- [ ] Verify RLS policies allow authenticated uploads
- [ ] Verify `happening_now` table exists with correct schema

### Production Test Steps

1. **Deploy the changes** to your production environment

2. **Test small upload**:
   - Upload 2 images with captions
   - Verify success

3. **Test large upload**:
   - Upload 6 images + 30MB video
   - Verify no "FUNCTION_PAYLOAD_TOO_LARGE" errors
   - Verify all files upload successfully

4. **Verify view tracking**:
   - View the uploaded content
   - Verify view count increments
   - Verify real-time updates work

---

## Troubleshooting

### Error: "Missing Supabase credentials"
**Cause**: `SUPABASE_SERVICE_ROLE_KEY` not set in environment  
**Fix**: Add the service role key to your environment variables

### Error: "Failed to generate upload URL"
**Cause**: Supabase Storage bucket doesn't exist or permissions issue  
**Fix**: 
1. Check bucket `media` exists in Supabase Storage
2. Verify RLS policies allow uploads
3. Check service role key has admin permissions

### Error: "Invalid image URL. Must be from Supabase storage"
**Cause**: URL validation failing  
**Fix**: Verify `NEXT_PUBLIC_SUPABASE_URL` matches the actual Supabase project URL

### Upload hangs or times out
**Cause**: Large file size or slow network  
**Fix**: 
1. Check file sizes are within limits
2. Consider adding timeout handling
3. Implement retry logic for failed uploads

---

## Performance Metrics

Expected performance improvements:

| Metric | Before | After |
|--------|--------|-------|
| API Payload Size | 50-100MB | < 10KB |
| Upload Speed | Limited by Next.js | Direct to CDN |
| Production Errors | PAYLOAD_TOO_LARGE | None |
| Scalability | Limited | Unlimited |

---

## Next Steps

After successful testing:

1. ✅ Mark verification tasks as complete in `task.md`
2. ✅ Deploy to production
3. ✅ Monitor for errors
4. ✅ Consider adding image compression for further optimization
5. ✅ Consider adding video transcoding for better performance
