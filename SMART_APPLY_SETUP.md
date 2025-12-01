# Smart Apply AI Implementation Guide

## Overview
The Smart Apply feature uses **Gemini 2.5 Pro** to generate personalized, AI-powered application drafts for job opportunities. Users can review, copy, or submit the generated applications directly from the preview modal.

## Features Implemented

### 1. **Server Action: generateSmartApplicationDraft**
- **Location**: `lib/actions/feed/smart-apply.actions.ts`
- **Functionality**:
  - Fetches authenticated user's profile with all details (skills, education, experience, etc.)
  - Retrieves opportunity information (title, description, company, location, type)
  - Sends comprehensive context to Gemini 2.5 Pro
  - Generates personalized application including:
    - Full application letter/statement (300-400 words)
    - Key highlights (3-4 main points)
    - Personalized reasons why the user is perfect for the role
  - Returns structured JSON response

### 2. **Updated ApplyButton Component**
- **Location**: `components/feed/details/appyButton/ApplyButton.tsx`
- **Changes**:
  - Added `opportunityData` prop to receive opportunity context
  - Added "Smart Apply with AI" button alongside regular "Apply Now"
  - Integrated loading state with "Generating Draft..." message
  - Handles errors gracefully with user-friendly messages
  - Opens `SmartApplyPreview` modal when draft is ready

### 3. **New SmartApplyPreview Modal**
- **Location**: `components/feed/details/appyButton/SmartApplyPreview.tsx`
- **Features**:
  - Displays AI-generated application draft with sections:
    - Why You're Perfect for This Role (personalized points)
    - Key Highlights (main strengths)
    - Full Application (complete letter)
  - Actions:
    - **Copy Text**: Copy application to clipboard
    - **Submit Application**: Submit via server action and store in database
  - Error handling and loading states

### 4. **Feed Detail Page Updates**
- **Location**: `app/(dashboard)/feed/[id]/page.tsx`
- **Changes**:
  - Passes `opportunityData` to ApplyButton component with:
    - Opportunity title, description, type
    - Company information
    - Location and other relevant details

### 5. **New EditableApplicationModal Component**
- **Location**: `components/feed/details/appyButton/EditableApplicationModal.tsx`
- **Features**:
  - Full-screen modal for editing application content
  - Edit and Preview modes
  - Word count display
  - Reset to original content option
  - Download as PDF functionality
  - Save & Submit button

### 6. **PDF Generator Utility**
- **Location**: `lib/utils/pdf-generator.ts`
- **Features**:
  - Generates professional PDF with application content
  - Includes company name, position title, and date
  - Professional styling and formatting
  - Automatic file naming with timestamp

## Setup Instructions

### 1. Install Dependencies
```bash
npm install @google/generative-ai
npm install html2pdf.js
```

### 2. Set Environment Variables
Add to your `.env.local`:
```
GEMINI_API_KEY=your-google-api-key
```

### 3. Get Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new API key
4. Copy and paste it into `.env.local`

### 4. Verify Database Table (applications)
Ensure your `applications` table has these columns:
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key)
- opportunity_id (uuid)
- opportunity_type (text: 'internship' | 'program' | 'event')
- application_content (text)
- generated_by_ai (boolean)
- submitted_at (timestamp)
- created_at (timestamp, default now())
```

## How It Works

### User Flow
1. User views opportunity detail page
2. User clicks "Smart Apply with AI" button
3. Button shows "Generating Draft..." loading state
4. Server action:
   - Fetches user's complete profile
   - Gets opportunity details
   - Sends to Gemini 2.5 Pro with detailed prompt
   - Receives structured application draft
5. Preview modal opens showing:
   - Why they're perfect for the role
   - Key highlights
   - Full application text
6. User can:
   - Copy the text to use elsewhere
   - Submit directly (saves to database)
7. Success message confirms submission

### AI Generation Prompt
The prompt includes:
- User's complete profile (name, skills, education, experience, bio)
- Opportunity details (title, description, company, location, type)
- Instructions for:
  - Professional, personalized tone
  - Highlighting relevant skills
  - Demonstrating genuine interest
  - Including specific examples
  - Concise but impactful length

## Customization Options

### Adjust AI Generation Parameters
Edit `lib/actions/feed/smart-apply.actions.ts`:
```typescript
const result = await model.generateContent({
  contents: [...],
  generationConfig: {
    temperature: 0.7,      // Adjust creativity (0-1, lower = more deterministic)
    topP: 0.9,            // Adjust diversity
    topK: 40,             // Adjust variety
    maxOutputTokens: 1024, // Max response length
  },
});
```

### Modify Modal Styling
Edit `components/feed/details/appyButton/SmartApplyPreview.tsx` - all styling uses Tailwind classes for easy customization.

### Change Button Colors/Labels
Edit `components/feed/details/appyButton/ApplyButton.tsx` to customize button appearance and text.

## Error Handling

The implementation includes comprehensive error handling:
- **No API Key**: Returns user-friendly error message
- **Missing User Profile**: Prompts user to complete profile first
- **API Rate Limits**: Caught and displayed to user
- **Network Errors**: Handled gracefully with retry option
- **Database Errors**: Clear error messages on submission failure

## Security & Best Practices

✅ **Server-Side Generation**: All AI calls happen server-side
✅ **Authentication Required**: Only authenticated users can generate
✅ **User Data Privacy**: Personal data only used for current session
✅ **Error Logging**: All errors logged for debugging
✅ **Input Validation**: All data validated before API calls
✅ **Rate Limiting Ready**: Can add rate limiting if needed

## Future Enhancements

Potential improvements:
- [ ] Save draft for later editing
- [ ] Generate multiple versions for comparison
- [ ] Language translation support
- [ ] Tone customization (formal, casual, etc.)
- [ ] Template selection
- [ ] Analytics on conversion rates
- [ ] A/B testing different prompts
- [ ] Integration with cover letter templates

## Troubleshooting

### "Gemini API key not configured"
- Verify `GEMINI_API_KEY` is in `.env.local`
- Restart dev server after adding env variable

### "Unable to fetch your profile"
- Ensure user profile is complete in database
- User should visit profile page to set up their information

### Application not submitting
- Check if `applications` table exists in database
- Verify user is authenticated
- Check browser console for detailed error

### Slow generation
- Gemini 2.5 Pro is fast, but can take 2-5 seconds
- Consider adding loading animation/skeleton

## File Structure
```
lib/
  actions/
    feed/
      smart-apply.actions.ts      (Server actions)
components/
  feed/
    details/
      appyButton/
        ApplyButton.tsx           (Updated)
        SmartApplyPreview.tsx     (New)
app/
  (dashboard)/
    feed/
      [id]/
        page.tsx                  (Updated)
```
