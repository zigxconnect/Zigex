# 🔧 Fix: Supabase Service Role Key Missing

## Problem
```
supabaseKey is required.
```

This error occurs because the server action needs `SUPABASE_SERVICE_ROLE_KEY` to perform admin operations like deleting old "Happening Now" records.

---

## Solution

### Step 1: Get Your Supabase Service Role Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Under "Project API keys", find the **"Service Role"** row (marked as secret)
5. Copy the long secret key

### Step 2: Add to `.env.local`

1. Open `.env.local` file in your project root
2. Find this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
3. Replace `your_service_role_key_here` with the key you copied

**Example** (this is fake - use your actual key):
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdmlwaW52dmhna2xtcXd2b3dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE4MjQ4MiwiZXhwIjoyMDY3NzU4NDgyfQ.ABC123...
```

### Step 3: Restart Development Server

1. Stop your dev server (press `Ctrl+C`)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Test

1. Navigate to `/upload-live`
2. Try uploading content
3. Should now work without the error

---

## Why This is Needed

The server action needs to:
- ✅ **Delete** old "Happening Now" records (requires admin privileges)
- ✅ **Insert** new records
- ✅ **Read** files from storage

The **Service Role Key** has these permissions. The **Anon Key** (already in `.env`) doesn't have delete privileges.

---

## Security Notes

⚠️ **Important:**
- `.env.local` is already in `.gitignore`
- NEVER commit `.env.local` to git
- NEVER share this key publicly
- This key has admin access to your database

✅ **Safe because:**
- Only used on the server (Next.js server actions)
- Never sent to the browser
- Automatically excluded from git

---

## Alternative: Using Anon Key Only

If you can't access the Service Role Key, you can modify RLS policies to allow authenticated users to delete:

```sql
-- Allow authenticated users to delete old records
CREATE POLICY "Allow authenticated users to delete"
  ON happening_now
  FOR DELETE
  USING (auth.role() = 'authenticated');
```

Then the anon key would work, but you'd need to implement user authentication first.

---

## Verification

After adding the key and restarting:

1. Check the server log for errors
2. Visit `/upload-live`
3. Try uploading a test image
4. Check Supabase dashboard → Table `happening_now`
5. Verify data appears

---

## Still Having Issues?

**Check these:**

1. **Key Format**
   - Should be very long (200+ characters)
   - Should start with `eyJ`
   - Should not have quotes around it

2. **File Location**
   - File must be named `.env.local` (not `.env`)
   - Must be in project root
   - Same level as `package.json`

3. **Server Restart**
   - Stop dev server (`Ctrl+C`)
   - Clear `.next` folder: `rm -rf .next`
   - Start again: `npm run dev`

4. **Environment Variables**
   - Check: `echo $SUPABASE_SERVICE_ROLE_KEY`
   - Should show your key (not empty)

---

## Getting Help

If still stuck:
1. Verify key is correct at Supabase dashboard
2. Check server logs for error details
3. Try clearing browser cache
4. Check if `.env.local` is being read

---

**Status**: ✅ Fixed - Server actions now work with proper key fallback
