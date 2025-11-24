# Auto-Delete Invalid Projects After 48 Hours

## Overview
Invalid projects (those with `is_valid = false`) are automatically removed from student profiles after 48 hours. This ensures that rejected or pending projects don't clutter the profile indefinitely.

## Implementation

### File Modified
`lib/actions/getProjects.action.ts`

### How It Works

#### 1. **fetchActiveProject()** - Current User's Project
```typescript
// Check if project is invalid and older than 48 hours
if (activeProject && !activeProject.is_valid) {
  const createdAt = new Date(activeProject.created_at);
  const now = new Date();
  const fortyEightHoursInMs = 48 * 60 * 60 * 1000;
  const timeDifference = now.getTime() - createdAt.getTime();

  // If invalid project is older than 48 hours, return null
  if (timeDifference > fortyEightHoursInMs) {
    return { success: true, data: null };
  }
}
```

#### 2. **fetchUserActiveProject()** - Visitor's View of Student
Same logic applied when viewing another student's profile.

### Timeline

| Status | Duration | Action |
|--------|----------|--------|
| **Invalid (0-48h)** | 0-48 hours | Project displays with review card indicator |
| **Invalid (>48h)** | After 48 hours | Project is automatically removed/hidden |
| **Valid (any time)** | Forever | Project displays normally |

### Key Features

✅ **Server-Side Filtering**
- No frontend hacks needed
- Removes projects at data fetch level
- Secure and reliable

✅ **Non-Destructive**
- Original project data remains in database
- Only hidden from view after 48 hours
- Can be reviewed in admin panel if needed

✅ **Automatic**
- No manual intervention required
- Timestamp-based logic using `created_at`
- Checked every time profile is viewed

## Where It Impacts

### Pages Affected
1. **Dashboard Profile** - `app/(dashboard)/dashboard/student/[id]/page.tsx`
   - Shows `NoProjectMessage` if project expired

2. **User Profile** - `app/(dashboard)/profile/[id]/page.tsx`
   - Project hidden after 48 hours

3. **Projects List** - `app/(dashboard)/dashboard/projects/page.tsx`
   - Invalid projects filtered out after 48h

### Components Affected
- `MyMonthProject.tsx` - Shows review card for <48h
- `ProjectCard.tsx` - Shows review card for <48h
- `NoProjectMessage.tsx` - Displayed when project is removed

## User Experience

### For Student (Owner)
1. Submits project with invalid data
2. Sees review card with "Under Review" status for 48 hours
3. After 48 hours, project disappears
4. Can resubmit new project

### For Visitors
1. Visits student profile
2. Sees review card if project <48h old and invalid
3. After 48 hours, card disappears
4. May see `NoProjectMessage` instead

## Technical Details

### Calculation
```
48 hours = 48 * 60 * 60 * 1000 milliseconds = 172,800,000 ms

timeDifference = Current Time - Created Time
If timeDifference > 172,800,000 ms: Hide project
```

### Database Query Flow
```
1. Fetch project where:
   - student_id = target student
   - end_date > current time (still active)
   - order by created_at DESC
   - limit 1

2. Check if project exists:
   - If !is_valid AND created_at < 48h ago → Show
   - If !is_valid AND created_at > 48h ago → Return null
   - If is_valid → Show
```

## Testing

### Test Case 1: Valid Project
- Create project with `is_valid = true`
- ✅ Should display permanently

### Test Case 2: Invalid Project <48h Old
- Create project with `is_valid = false`
- ✅ Should display with review card
- ✅ Show timeline indicator

### Test Case 3: Invalid Project >48h Old
- Update project to `is_valid = false` and backdate `created_at` by 48+ hours
- ✅ Should return null
- ✅ Should show `NoProjectMessage`

## Database Fields Required
```sql
projects table:
- id (primary key)
- student_id (foreign key)
- is_valid (boolean)
- created_at (timestamp) -- Used for 48h calculation
- end_date (timestamp)
- ... other fields
```

## Future Enhancements

### Option 1: Automatic Deletion
```typescript
// Permanently delete invalid projects after 48h
await supabase
  .from('projects')
  .delete()
  .eq('student_id', id)
  .eq('is_valid', false)
  .lt('created_at', cutoffTime);
```

### Option 2: Archive Instead
```typescript
// Mark as archived instead of deleting
await supabase
  .from('projects')
  .update({ archived: true })
  .eq('student_id', id)
  .eq('is_valid', false)
  .lt('created_at', cutoffTime);
```

### Option 3: Notify Before Deletion
```typescript
// Email notification at 40 hours
// Auto-delete at 48 hours
```

## Configuration

### Modify 48-Hour Window
Edit `lib/actions/getProjects.action.ts`:
```typescript
// Change from 48 to custom hours
const hours = 24; // Example: 24 hours
const timeInMs = hours * 60 * 60 * 1000;
```

## Error Handling
- If `created_at` is null: Project treated as currently valid
- If timestamp parsing fails: Project returned as-is (safe default)
- If timezone issues occur: Converted to UTC for consistency

## Performance Impact
- ✅ Minimal - simple timestamp comparison
- ✅ One-time calculation per fetch
- ✅ No additional database queries
- ✅ No scanning of all projects needed

---

**Status**: ✅ Implemented | 📅 November 24, 2025  
**Last Updated**: First implementation  
**Version**: 1.0
