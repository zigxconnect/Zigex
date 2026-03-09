# 🔐 Auth Session Bug — Postmortem & Fix Documentation

> **Branch:** `FIX/login-token-issue`
> **Error:** `TypeError: Cannot create property 'user' on string`
> **Status:** ✅ Resolved

---

## 📖 Table of Contents

1. [Plain-English Summary](#1-plain-english-summary)
2. [Terminology Glossary — What Every Jargon Means](#2-terminology-glossary)
3. [How Authentication Works in Zigex](#3-how-authentication-works-in-zigex)
4. [What Went Wrong (Root Cause)](#4-what-went-wrong-root-cause)
5. [Why Only Some Users Were Affected](#5-why-only-some-users-were-affected)
6. [The Stack Trace — Reading the Error](#6-the-stack-trace-reading-the-error)
7. [The Fix — What Was Built and Why](#7-the-fix-what-was-built-and-why)
8. [Files Changed](#8-files-changed)
9. [How to Verify the Fix Works](#9-how-to-verify-the-fix-works)
10. [Preventive Measures Going Forward](#10-preventive-measures-going-forward)

---

## 1. Plain-English Summary

Some users who had previously logged in and come back to the app after a while were seeing this error:

```
TypeError: Cannot create property 'user' on string
```

The app was not letting them log in. Refreshing sometimes helped; sometimes not.

**What was happening:** The browser stores the user's login identity in a small storage area called `localStorage`. Supabase (our auth provider) writes a JSON object (basically a structured data parcel) there. Due to certain conditions described below, that storage slot sometimes got written as a **raw string** instead of a proper JSON object. When Supabase tried to re-read and update it on the next login, it crashed — because you cannot add properties to a string in JavaScript.

**The fix:** We added a `SessionGuard` component that checks all Supabase localStorage entries every time the app loads. If it finds any that are corrupted (i.e., not valid JSON objects), it clears them before Supabase can try to use them. The user is silently recovered — they log in as normal.

---

## 2. Terminology Glossary

This section explains every term you need to understand the bug.

### 🔑 Authentication (Auth)
The process of proving *who you are*. In Zigex, you do this by entering an email + password. Google Sign-In is also supported.

### 🪪 Session
A **session** is a record that says "this browser tab/user was authenticated at time X and is allowed to use the app until time Y." Think of it like a wristband at an event: the bouncer puts it on once, and you don't need to show ID again until it expires.

### 🎟️ Token
A **token** is a cryptographically signed string of characters that *proves* who you are without you having to resend your password every time. There are two important tokens:

- **Access Token (`access_token`):** A short-lived (usually 1-hour) token sent with every API request as proof of identity.
- **Refresh Token (`refresh_token`):** A longer-lived token used **only** to get a new access token when the old one expires. It never goes over the network except to Supabase's auth server.

### 🍪 Cookie
A small piece of data the **server** can store in the browser. Cookies are automatically sent with every HTTP request to the server, which is why they're used for server-side authentication. Unlike localStorage, the server can read and write cookies.

### 📦 localStorage
A browser storage area (key→value pairs of strings) that **only the frontend JavaScript** can access. The server cannot see localStorage. Supabase's browser client saves the session object here so the user doesn't have to log in again every time they refresh the page.

### 🗝️ Supabase Session Object
When you log in via Supabase, it gives back a **session object** that looks like this:

```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "v1.Ab3c...",
  "expires_at": 1710000000,
  "token_type": "bearer",
  "user": {
    "id": "334518ad-6de5-4e1f-963b-...",
    "email": "user@example.com",
    ...
  }
}
```

Supabase stores this as a JSON string in `localStorage` under the key `sb-<project-ref>-auth-token`.

### 📝 JSON vs JSON String
- **JSON object** (in memory): `{ "user": { "id": "abc" } }` — a JavaScript object with properties you can read/write.
- **JSON string** (stored): `"{\"user\":{\"id\":\"abc\"}}"` — the same thing, but serialised into a plain string for storage. It has to be **parsed back** into an object before you can use it.

### 🔄 GoTrue
GoTrue is Supabase's open-source authentication microservice. The JavaScript client library (`@supabase/gotrue-js`) runs in the browser and handles login, logout, session refresh, and storage of tokens.

### 📡 @supabase/ssr
A Supabase package specifically built for **Next.js and server-side rendering (SSR)**. Instead of using localStorage (which the server can't see), it reads/writes the auth session from **cookies**, which the server *can* see. This is how our API routes know who you are.

### 🧩 Hydration
When Next.js renders a page on the **server** (Server-Side Rendering), it sends the HTML to the browser. The browser then downloads the JavaScript and "hydrates" the page — meaning it attaches all event listeners and makes the page interactive. Problems can occur during this window if localStorage state doesn't match server state.

---

## 3. How Authentication Works in Zigex

Zigex has two parallel auth systems that need to stay in sync:

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER (Client)                   │
│                                                      │
│  User submits email+password form                    │
│          │                                           │
│          ▼                                           │
│  POST /api/auth/login  ──────────────────────────►  │
│                                                      │
│          │                                           │
│  ┌───────▼──────────────────────────────────────┐   │
│  │          SERVER (Next.js API Route)           │   │
│  │                                               │   │
│  │  - Creates a Supabase server client           │   │
│  │  - Calls supabase.auth.signInWithPassword()   │   │
│  │  - Supabase sets session cookies on response  │   │
│  │  - Returns JSON: { profileComplete, session } │   │
│  └───────────────────────────────────────────────┘   │
│          │                                           │
│          ▼                                           │
│  Browser receives response                           │
│  router.push("/dashboard")  ──────► page loads       │
│                                                      │
│  Meanwhile, Supabase browser client detects cookies  │
│  and syncs them to localStorage automatically        │
│                                                      │
│  localStorage["sb-<ref>-auth-token"] = JSON.stringify│
│  ({ access_token, refresh_token, user, ... })        │
└─────────────────────────────────────────────────────┘
```

**Key files involved:**
| File | Role |
|------|------|
| `app/api/auth/login/route.ts` | Server login handler, sets auth cookies |
| `lib/supabase/server.ts` | Creates cookie-backed Supabase clients for server use |
| `lib/supabase/client.ts` | Creates localStorage-backed Supabase client for browser |
| `lib/middleware/auth.ts` | Re-usable server middleware to verify auth in API routes |
| `components/sections/auth/AuthForm.tsx` | The login form UI component |

---

## 4. What Went Wrong (Root Cause)

### The Bug

Supabase's GoTrue JS client reads the session from `localStorage` and expects to find a **JavaScript object** at the key `sb-<project-ref>-auth-token`. However, the value stored there was a **primitive string** instead of a parsed object.

When GoTrue then tried to write the refreshed user data back into the session like this:

```javascript
// Internally inside GoTrue:
session.user = refreshedUser;  // ← CRASH if 'session' is a string!
```

JavaScript threw:

```
TypeError: Cannot create property 'user' on string "eyJhbGci..."
```

Because in JavaScript, you **cannot add properties to a primitive string**. Strings are immutable primitives.

### Why Was It a String?

Several conditions could have caused the session value to become a raw string instead of a JSON-parsed object:

#### Cause A — Double Serialisation
```javascript
// Normal: Supabase stores the JSON string
localStorage.setItem("sb-ref-auth-token", JSON.stringify(sessionObject));
// reads back → '{"access_token":"eyJ..."}'  ✅ GoTrue parses this correctly.

// Bug scenario: The value was set as a string already stringified:
localStorage.setItem("sb-ref-auth-token", JSON.stringify(JSON.stringify(sessionObject)));
// reads back → '"{\\"access_token\\":\\"eyJ...\\"}"'  ← a string of a string
// GoTrue gets the string back, doesn't double-parse, tries to set .user on it → 💥
```

#### Cause B — Legacy Auth v1 Format
Supabase changed its token storage format between v1 and v2. Users who had originally logged in with an older version of the app may have had `supabase.auth.token` (the old key) stored as a plain JWT string (not a JSON-wrapped session object). When GoTrue v2 tried reading it expecting an object, it got a raw token string.

#### Cause C — Partial / Corrupted Write
If the browser was closed mid-write (rare but possible), the value in localStorage could have been partially written, resulting in a non-parseable string.

#### Cause D — Storage Quota Exceeded
If the browser's localStorage was full, the write could silently fail or truncate, leaving a corrupted value that partially parsed as a string.

---

## 5. Why Only Some Users Were Affected

This explains why the dev team couldn't reproduce it at HQ but some users experienced it:

| Reason | Explanation |
|--------|-------------|
| **Old session stored** | Users who logged in months ago had older session data from a previous version of the app |
| **Browser differences** | Some browsers handle localStorage writes differently under memory pressure |
| **Multiple tabs** | Having multiple tabs open can cause race conditions where two tabs try to write the session simultaneously |
| **Device storage pressure** | Mobile browsers with low storage quotas truncate writes silently |
| **Google SSO users** | Users who signed in via Google (which uses a different token flow) had a slightly different session shape |

The dev team was unaffected because they likely log in/out frequently and have fresh sessions in the correct format.

---

## 6. The Stack Trace — Reading the Error

```
TypeError: Cannot create property 'user' on string
    at GoTrueClient._saveSession (gotrue-js chunk)
    at GoTrueClient._refreshSession
    at GoTrueClient.getUser
    at authMiddleware
```

Reading this **bottom to top** (innermost call is at the top):

1. `GoTrueClient._saveSession` — GoTrue is trying to save a refreshed session
2. `GoTrueClient._refreshSession` — GoTrue is refreshing the access token (automatic, runs on load)
3. `GoTrueClient.getUser` — A page or API route called `await supabase.auth.getUser()`
4. `authMiddleware` — Our middleware called `getUser` to verify the user's identity

The crash happens **automatically on page load** because GoTrue always attempts to load and refresh the session from localStorage when the Supabase client is initialised.

---

## 7. The Fix — What Was Built and Why

### The `SessionGuard` Component

**File:** `components/providers/SessionGuard.tsx`

```
On every page load (useEffect runs after mount):
│
├── 1. SCAN localStorage for all "sb-*" keys (Supabase keys)
│
├── 2. For each key that holds a session (not a code-verifier):
│         Try JSON.parse(value)
│         Check: is the result a non-null object?
│
├── 3. If NOT a valid object → REMOVE that key from localStorage
│         (This is "purging the corrupt session")
│
├── 4. Also register a global window.onerror handler
│         If the TypeError ever slips through at runtime:
│         → Purge storage
│         → Call supabase.auth.signOut() (clears server cookies too)
│         → Redirect to /sign-in?error=session_corrupted
│
└── 5. AuthForm shows a friendly message when this param is present
```

### Why This Approach Is Safe

- **Non-destructive for valid sessions:** If the localStorage value is a valid JSON object (the normal case), we leave it alone. Logged-in users are not disrupted.
- **Graceful degradation:** If a session is cleared, the user simply sees the sign-in page with a message explaining what happened. They log in once more and get a clean session.
- **Covers future corruption too:** The `window.onerror` handler acts as a safety net even if corruption happens *after* page load.
- **No data loss risk:** We are only removing authentication tokens, not user data. All profile data lives in the Supabase database, not in localStorage.

### Why NOT Just Try/Catch in GoTrue?

We cannot modify GoTrue (it's a third-party library). And even if we could, the crash happens *inside* a promise chain that Next.js doesn't surface easily. The best practice is to validate the storage *before* GoTrue reads it.

---

## 8. Files Changed

| File | Type | What Changed |
|------|------|-------------|
| `components/providers/SessionGuard.tsx` | **NEW** | The main fix — session validation and purge logic |
| `app/layout.tsx` | **MODIFIED** | Wraps `{children}` with `<SessionGuard>` so it runs on every page |
| `components/sections/auth/AuthForm.tsx` | **MODIFIED** | Handles `?error=session_corrupted` query param to show user-friendly message |

---

## 9. How to Verify the Fix Works

### Manual Test (Simulate the Bug)

1. Open DevTools → Application → Local Storage → your site
2. Find the key `sb-<your-project-ref>-auth-token`
3. Change its value to a plain string like `"hacked-string"`
4. Refresh the page
5. **Expected (before fix):** App crashes with `TypeError: Cannot create property 'user' on string`
6. **Expected (after fix):** SessionGuard silently removes the corrupted key. You see the sign-in page normally (or with a toast if the error fires at runtime)

### Automated Check

The `isValidSessionValue()` function in `SessionGuard.tsx` can be unit tested independently:

```typescript
isValidSessionValue('{"user":{"id":"abc"}}')  // → true  ✅
isValidSessionValue('"eyJhbGci..."')           // → false ✅ (string of a string)
isValidSessionValue('null')                    // → false ✅
isValidSessionValue('[1,2,3]')                 // → false ✅ (array, not object)
isValidSessionValue('not even json')           // → false ✅
```

---

## 10. Preventive Measures Going Forward

| Measure | Description |
|---------|-------------|
| **SessionGuard on every load** | Already implemented — catches future corruption before it causes crashes |
| **Avoid manual localStorage writes for auth** | Never manually call `localStorage.setItem` for any `sb-*` key. Let Supabase handle it entirely |
| **Use `@supabase/ssr` correctly** | All server-side Supabase clients should go through `lib/supabase/server.ts`. Do not create ad-hoc `createServerClient` instances with custom cookie handlers unless you understand cookie serialisation |
| **Monitor for the error in logs** | The SessionGuard logs `[SessionGuard] Corrupted Supabase session detected` to the browser console. If users report issues, ask them to check their browser console for this message |
| **Test cross-version migrations** | When upgrading `@supabase/ssr` or `@supabase/auth-js`, test with an existing localStorage session from the previous version to confirm backward compatibility |

---

## Appendix — Quick Reference: Session Flow Diagram

```
User logs in
     │
     ▼
/api/auth/login (Server)
     │
     ├─ signInWithPassword() → Supabase Auth server
     │                              │
     │                              └─ Returns: { access_token, refresh_token, user }
     │
     ├─ Supabase sets HTTP-only cookie (server can read this)
     │     cookie: sb-<ref>-auth-token=<base64-json>
     │
     └─ Returns JSON to browser: { profileComplete, session }

Browser receives response
     │
     ├─ router.push("/dashboard")
     │
     └─ Supabase browser client auto-syncs cookie → localStorage
           localStorage["sb-<ref>-auth-token"] = JSON.stringify({
             access_token, refresh_token, expires_at, user
           })

On next page load (existing user):
     │
     ├─ SessionGuard runs → validates localStorage ← OUR FIX
     │
     └─ GoTrue reads localStorage → refreshes tokens if expired
           If access_token expired, uses refresh_token to get a new one
           Writes updated session back to localStorage
```

---

*Document authored for the Zigex engineering team. If you have questions, check `components/providers/SessionGuard.tsx` for implementation details.*
