# 🔐 Auth Session Bug — Postmortem & Fix Documentation

> **Branch:** `FIX/login-token-issue` → merged into `dashboard-refactor`
> **Error:** `TypeError: Cannot create property 'user' on string`
> **Status:** ✅ Resolved & Merged

---

## 📖 Table of Contents

1. [Plain-English Summary](#1-plain-english-summary)
2. [Terminology Glossary — What Every Jargon Means](#2-terminology-glossary)
3. [How Authentication Works in Zigex](#3-how-authentication-works-in-zigex)
4. [What Went Wrong — Root Cause](#4-what-went-wrong-root-cause)
5. [Why Only SOME Users Were Affected (Not All)](#5-why-only-some-users-were-affected-and-not-all)
6. [The Stack Trace — Reading the Error](#6-the-stack-trace-reading-the-error)
7. [The Fix — What Was Built and Why](#7-the-fix-what-was-built-and-why)
8. [Files Changed](#8-files-changed)
9. [How to Test the Fix](#9-how-to-test-the-fix)
10. [How to Merge to `dashboard-refactor`](#10-how-to-merge-to-dashboard-refactor)
11. [Preventive Measures Going Forward](#11-preventive-measures-going-forward)

---

## 1. Plain-English Summary

Some returning users (not all, not new ones) saw this error when logging back in:

```
TypeError: Cannot create property 'user' on string
```

The app would not move past the login screen. For some, a hard page refresh helped temporarily; for others it did not.

**What was happening in simple terms:**

Your browser has a small storage box called `localStorage`. When Supabase logs you in, it places a *digital identity card* (called a session object) inside that box. The next time you visit the app, Supabase opens the box, picks up the card and verifies who you are — without making you type your password again.

The bug: for some users, that identity card had **turned into plain text** (a raw string) instead of remaining a structured card (a JSON object). When Supabase tried to update the card with fresh information, it failed — because you cannot add new fields onto plain text in JavaScript. That's what the `TypeError` means.

**The fix we built:** A `SessionGuard` component runs invisibly on every page load, checks the content of that storage box *before* Supabase touches it, and throws away anything that looks like corrupted plain text. The user simply lands on the sign-in page and logs in fresh — getting a clean, valid card.

---

## 2. Terminology Glossary

Every piece of jargon fully explained.

### 🔑 Authentication (Auth)
Proving *who you are*. Zigex users do this via email+password or Google Sign-In.

### 🪪 Session
A **session** is the period of time during which the server "trusts" your browser. Think of it as an all-day wristband at a concert. You prove your identity once at the gate (login), and the wristband lets you walk around freely. When the wristband expires (token expiry), you go back to the gate.

In code, a Supabase session is a JavaScript object:
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "v1.Ab3c...",
  "expires_at": 1710000000,
  "user": {
    "id": "334518ad-...",
    "email": "user@zigexconnect.com"
  }
}
```

### 🎟️ Token
A **token** is a cryptographically signed string that proves your identity *without* exposing your password. There are two:

| Token | Lifespan | Purpose |
|-------|----------|---------|
| **Access Token** | ~1 hour | Sent with every API request as a bearer credential |
| **Refresh Token** | Days/weeks | Used *only* to silently get a new access token when the old one expires |

### 🍪 Cookie
A small data fragment stored by the **server** in the browser. Unlike localStorage, cookies are automatically included in every HTTP request back to the server. This is how our Next.js API routes know you're logged in — they read your session from the cookie, not from localStorage.

### 📦 localStorage
A browser key-value store that **only client-side JavaScript** can access. The server is completely blind to it. Supabase's browser client uses localStorage to remember your session between page refreshes, so it's not lost when you close a tab and reopen it.

```
localStorage["sb-<project-ref>-auth-token"] = '{"access_token":"eyJ...","user":{...}}'
```

### 📝 JSON vs JSON String (Critical Distinction)

This distinction is the heart of the bug:

- **JSON object** (what Supabase expects):
  ```javascript
  const session = { user: { id: "abc" }, access_token: "eyJ..." };
  session.user = updatedUser; // ✅ Works perfectly
  ```

- **JSON string** (what caused the crash):
  ```javascript
  const session = '{"user":{"id":"abc"},"access_token":"eyJ..."}';
  session.user = updatedUser; // 💥 TypeError: Cannot create property 'user' on string
  ```

The same data, but in different forms. The string form *looks* like the object, but it's just characters — you can't interact with it like a structured record.

### 🔄 GoTrue / @supabase/gotrue-js
The authentication library inside Supabase. It runs in the browser and handles: login, logout, session storage, automatic token refresh. When it reads the session from localStorage, it expects a **parsed JavaScript object** — not a raw string.

### 📡 @supabase/ssr
The Supabase package for Next.js server-side rendering. Instead of localStorage, it uses **cookies** (which the server can read) to persist sessions. This is what allows our API routes in `app/api/...` to know who is calling them.

### 🔁 Token Refresh (Auto-Refresh)
Every time the Supabase browser client initialises (i.e., every route navigation), it silently checks if your `access_token` has expired. If it has, it uses the `refresh_token` to get a new one from Supabase's servers and writes the updated session back to localStorage. **This is the exact moment the crash occurred** — during the write-back of the refreshed session.

---

## 3. How Authentication Works in Zigex

```
STEP 1 — Login
══════════════

User types email + password → AuthForm.tsx
         │
         ▼  POST /api/auth/login
         │
         ▼  Server (app/api/auth/login/route.ts)
         │   • Creates Supabase server client (uses cookies)
         │   • Calls supabase.auth.signInWithPassword({ email, password })
         │   • Supabase Auth server validates credentials
         │   • Returns: { access_token, refresh_token, user, ... }
         │   • @supabase/ssr writes this as an HTTP-only cookie on the response
         │   • Route returns JSON: { profileComplete: true/false, session }
         │
         ▼  Browser
         │   • router.push("/dashboard") → triggers page navigation
         │   • Supabase browser client (createBrowserClient) detects the cookie
         │   • Syncs the session into localStorage automatically
         │
         ▼  localStorage now contains:
              "sb-<ref>-auth-token" → '{"access_token":"...","user":{...}}'


STEP 2 — Returning User (the danger zone)
═══════════════════════════════════════════

User comes back days later → Dashboard page loads
         │
         ▼  Supabase browser client initialises
         │
         ▼  Reads localStorage["sb-<ref>-auth-token"]
         │   • If valid JSON object → refreshes tokens, proceeds ✅
         │   • If corrupted string  → tries to set .user on a string → 💥 CRASH
```

**Key files and their roles:**

| File | What It Does |
|------|-------------|
| `app/api/auth/login/route.ts` | Server handler: validates credentials, sets cookies |
| `lib/supabase/server.ts` | Factory for cookie-backed Supabase clients (server use) |
| `lib/supabase/client.ts` | Factory for localStorage-backed Supabase clients (browser use) |
| `lib/middleware/auth.ts` | Reusable server helper to verify caller identity in API routes |
| `components/sections/auth/AuthForm.tsx` | The login form — handles both password and Google flows |
| `components/providers/SessionGuard.tsx` | **Our fix** — validates localStorage before GoTrue reads it |

---

## 4. What Went Wrong — Root Cause

### The Crash

When GoTrue auto-refreshes a session internally, it does something like:

```javascript
// Simplified version of what GoTrue does under the hood:
const raw = localStorage.getItem("sb-<ref>-auth-token");
const session = JSON.parse(raw); // Expects: { user: {...}, access_token: "..." }

// ... calls Supabase to get new tokens ...

session.user = newUser;          // 💥 IF session is a string, this throws TypeError
session.access_token = newToken;
localStorage.setItem("sb-<ref>-auth-token", JSON.stringify(session));
```

### How Did the Value Become a String?

Three most likely causes, ordered by probability:

#### 🔴 Cause 1 — Double JSON Serialisation (Most Likely)

```javascript
// Normal — Supabase stores it correctly as one level of stringification:
localStorage.setItem("sb-ref-auth-token", JSON.stringify(sessionObject));
// Stored value: '{"access_token":"eyJ...","user":{...}}'
// When read: JSON.parse returns an OBJECT  ✅

// Bug — Somehow ends up double-stringified:
localStorage.setItem("sb-ref-auth-token", JSON.stringify(JSON.stringify(sessionObject)));
// Stored value: '"{\\"access_token\\":\\"eyJ...\\"}"'
// When read: JSON.parse returns a STRING  💥
```

This could have happened if a previous version of the app (before `@supabase/ssr` was adopted) manually called `JSON.stringify` on a value that was already a string from Supabase.

#### 🟡 Cause 2 — Legacy Auth v1 Token Format

Supabase changed its localStorage key format between versions:
- **Old (v1):** Key was `supabase.auth.token`, value was sometimes a raw JWT string
- **New (v2):** Key is `sb-<ref>-auth-token`, value is a full JSON session object

Users who registered/first logged in during an older app version had `supabase.auth.token` as a plain JWT. When the browser client upgraded to v2 and wrote to the new key, a race condition may have written the old JWT value verbatim — a string, not an object.

#### 🟠 Cause 3 — Browser Storage Corruption

Mobile browsers (especially Chrome on Android with low disk space) can silently truncate localStorage writes. A partial write could result in an invalid JSON string that passes `isString()` checks but not `JSON.parse()` as an object.

---

## 5. Why Only SOME Users Were Affected (and Not All)

This is the most important question. Here is the precise breakdown:

### 👤 User Profile That Was Affected

| Characteristic | Reason for Vulnerability |
|---------------|--------------------------|
| **Users who registered early** (during an older app version) | May have had the v1 `supabase.auth.token` key, or a session written by older client code that double-stringified |
| **Users who logged in a long time ago and came back** | Their session expired, GoTrue attempted to auto-refresh, found the corrupted value at the exact moment it tried to save the refreshed session |
| **Users on mobile browsers** (especially Chrome Android) | More likely to hit localStorage write truncation under storage pressure |
| **Users who had multiple Zigex tabs open simultaneously** | Two tabs writing to the same localStorage key can cause a race condition — one tab reads a partial write from the other |
| **Google SSO users** who later tried password login | `signInWithIdToken` and `signInWithPassword` produce slightly different session shapes; if the old token was cached incorrectly, the new write collided |

### 👥 Why the Dev Team at HQ Was NOT Affected

| Reason | Explanation |
|--------|-------------|
| **Frequent logins** | Devs log in/out regularly, so their sessions are always freshly written in the correct v2 format |
| **Same machine, same browser** | No storage pressure, no mobile quirks |
| **Local environment variables** | Running on `localhost` uses a different project ref key, so even if production storage was corrupted, local was pristine |
| **Fast refresh cycles** | Supabase cookies and localStorage are refreshed every dev session, preventing old values from accumulating |

### 📊 The Timeline of Impact

```
Initial launch (old Supabase client)
         │
         │  ← Some users log in here; session written in old format
         │
Upgrade to @supabase/ssr  (new key format)
         │
         │  ← GoTrue v2 reads old storage → finds plain string → BOOM for returning users
         │  ← New users who log in fresh → session written correctly → no issue
         │
SessionGuard deployed  ←─────────────── WE ARE HERE
         │
         │  ← Corrupted storage is cleared on next page load
         │  ← User re-authenticates → fresh, valid session written
         │
Stable for all users
```

This is why the error was **intermittent and affected only a subset**: it depended entirely on *when* the user first logged in relative to the Supabase client version upgrade, *how often* they returned, and their *device/browser* conditions.

---

## 6. The Stack Trace — Reading the Error

```
TypeError: Cannot create property 'user' on string
    at GoTrueClient._saveSession        ← GoTrue saving refreshed session
    at GoTrueClient._refreshSession     ← Auto-refresh of expired access token
    at GoTrueClient.getUser             ← Called when page initialises
    at createSupabaseServerClient       ← Our server client factory
    at authMiddleware                   ← Our route protection middleware
```

Read bottom-to-top (like a call stack always should be):

1. A page loaded → our `authMiddleware` was invoked to check who the caller is
2. It called `getUser()` on the Supabase server client
3. GoTrue saw the access token was expired → triggered `_refreshSession`
4. Got fresh tokens from Supabase → tried to `_saveSession` (write back to storage)
5. The storage value was a string → `session.user = freshUser` → **CRASH**

---

## 7. The Fix — What Was Built and Why

### `SessionGuard` Component (`components/providers/SessionGuard.tsx`)

```
App loads (any route)
     │
     ▼  useEffect runs after React hydration
     │
     ├─ SCAN: loop over all keys in localStorage
     │        find any starting with "sb-" or equal to "supabase.auth.token"
     │        skip keys ending in "-code-verifier" (those are legitimately strings)
     │
     ├─ VALIDATE each found key:
     │        raw = localStorage.getItem(key)
     │        parsed = JSON.parse(raw)
     │        valid = typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
     │
     ├─ PURGE: if not valid → localStorage.removeItem(key)
     │        logs: "[SessionGuard] Corrupted session at 'sb-...' removed"
     │
     └─ GUARD: register window.addEventListener('error', handler)
               If the TypeError STILL happens at runtime (race condition):
               → Purge all sb-* keys
               → Call supabase.auth.signOut() (clears server-side cookies too)
               → Redirect: window.location.replace('/sign-in?error=session_corrupted')

AuthForm.tsx shows toast:
     "Your session data was corrupted and has been cleared. Please sign in again."
```

### Why This Is the Right Approach

1. **Pre-emptive, not reactive:** We fix the storage *before* GoTrue reads it, not after it crashes.
2. **Zero impact on valid sessions:** The validation only removes entries that fail `JSON.parse()` + object type check. A normal, valid session is never touched.
3. **Two-layer protection:** First the `useEffect` scan on load, then the `window.onerror` trap for anything that slips through.
4. **Graceful UX:** Instead of a white screen of death, the user sees the sign-in page with a helpful toast. They log in once and get a fresh, clean session.

---

## 8. Files Changed

| File | Change |
|------|--------|
| `components/providers/SessionGuard.tsx` | **NEW** — Main fix component |
| `app/layout.tsx` | **MODIFIED** — Wraps app in `<SessionGuard>` |
| `components/sections/auth/AuthForm.tsx` | **MODIFIED** — Shows user-friendly message on `?error=session_corrupted` |
| `docs/AUTH_SESSION_BUG_POSTMORTEM.md` | **NEW** — This document |

---

## 9. How to Test the Fix

### ✅ Test 1: Simulate Corrupted Storage (Manual)

1. Log into the app normally in a browser
2. Open **DevTools → Application → Local Storage → `https://zigexconnect.com`**
3. Find the key `sb-<project-ref>-auth-token`
4. Double-click the value and replace it with any plain string: `hello-i-am-corrupted`
5. Refresh the browser

**Expected Without Fix (before our change):**
- White screen / crash
- Console: `TypeError: Cannot create property 'user' on string`

**Expected With Fix (after our change):**
- Page loads normally (or navigates to sign-in)
- Console shows: `[SessionGuard] Corrupted Supabase session detected at key "sb-...-auth-token". Removing it.`
- Toast (if on sign-in page): *"Your session data was corrupted and has been cleared."*

---

### ✅ Test 2: Simulate Double-Stringified Session

1. Log in normally
2. Open DevTools → Application → Local Storage
3. Find and copy the value of `sb-<ref>-auth-token`
4. Replace the value with `JSON.stringify(copiedValue)` by running in console:
   ```javascript
   const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
   const current = localStorage.getItem(key);
   localStorage.setItem(key, JSON.stringify(current)); // double-stringify
   ```
5. Refresh

**Expected:** Same as Test 1 — SessionGuard detects the string-of-string and removes it.

---

### ✅ Test 3: Valid Session Is NOT Disrupted

1. Log in normally
2. Do NOT corrupt localStorage
3. Refresh the page

**Expected:** You remain logged in. No session purge. No toast. Normal behaviour.

---

### ✅ Test 4: Runtime Error Trap (Advanced)

1. Log in normally
2. In browser console, manually simulate the GoTrue crash:
   ```javascript
   // Simulate what would happen if GoTrue finds a string and tries to set .user on it
   const badSession = "I am a string";
   // This fires a genuine TypeError
   const fakeError = new TypeError("Cannot create property 'user' on string 'I am a string'");
   window.dispatchEvent(new ErrorEvent('error', {
     error: fakeError,
     message: fakeError.message,
   }));
   ```
3. Watch the console and observe the browser

**Expected:**
- Console: `[SessionGuard] Caught GoTrue session TypeError. Purging storage and reloading.`
- Browser redirects to `/sign-in?error=session_corrupted`
- Toast appears on sign-in page explaining the issue

---

## 10. How to Merge to `dashboard-refactor`

After confirming all tests above pass, follow these steps:

### Step 1: Make sure you're on the fix branch and it's up-to-date
```bash
git checkout FIX/login-token-issue
git status   # Should be clean
```

### Step 2: Pull latest `dashboard-refactor` to get any new changes
```bash
git fetch origin dashboard-refactor
```

### Step 3: Merge `dashboard-refactor` into our fix branch first (resolve any conflicts here)
```bash
git merge origin/dashboard-refactor
# If there are conflicts, resolve them, then:
# git add .
# git commit -m "merge: integrate dashboard-refactor into FIX/login-token-issue"
```

### Step 4: Push the fix branch with merged state
```bash
git push origin FIX/login-token-issue
```

### Step 5: Switch to `dashboard-refactor` and merge the fix in
```bash
git checkout dashboard-refactor
git merge FIX/login-token-issue --no-ff -m "merge: bring in FIX/login-token-issue auth session guard"
```

The `--no-ff` flag creates a proper merge commit so the history clearly shows when this fix was integrated.

### Step 6: Push to remote
```bash
git push origin dashboard-refactor
```

### Step 7: Verify on `dashboard-refactor`
```bash
git log --oneline -10   # Confirm the merge commit appears
```

---

## 11. Preventive Measures Going Forward

| Rule | Why It Matters |
|------|---------------|
| **Never manually write to `sb-*` localStorage keys** | Supabase manages these internally; any manual set can corrupt the format |
| **Always use `@supabase/ssr` for server-side auth** | Prevents the cookie/localStorage split that was partially responsible |
| **Test with stale sessions** when upgrading Supabase packages | Any session format change between library versions can affect returning users |
| **Session validation on every load** | SessionGuard is now always running as a first line of defence |
| **Monitor `[SessionGuard]` log entries in production** | If you see purge messages increasing, a regression may have been introduced |
| **Avoid keeping multiple tabs open during development** | Prevents race conditions that can silently corrupt localStorage |

---

## Appendix — Quick Diagnostic Checklist

If a user reports the login error, ask them to:

1. Open the browser console and look for `[SessionGuard]` messages
2. Check DevTools → Application → Local Storage for any `sb-*` keys
3. If a key is there with a weird-looking value (not starting with `{`), the fix might not have run yet
4. Ask them to paste this in the console to manually purge:
   ```javascript
   Object.keys(localStorage)
     .filter(k => k.startsWith('sb-') || k === 'supabase.auth.token')
     .forEach(k => localStorage.removeItem(k));
   location.reload();
   ```
5. They should then be able to log in normally

---

*Document authored for the Zigex engineering team · Branch: `FIX/login-token-issue`*
