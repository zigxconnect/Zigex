/** Small browser checks shared by the install banner and the notifications prompt. Client-only. */

/** Opened from the home-screen icon (the installed app), not a browser tab. */
export function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iPhone or iPad. iPadOS reports itself as a Mac, so touch support tells them apart. */
export function isIOS() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

export function isPhoneOrTablet() {
  return isIOS() || /Android|Mobi/i.test(navigator.userAgent);
}

/** Safari on iOS is the only iOS browser that can add a web app to the home screen. */
export function isIOSSafari() {
  return isIOS() && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(navigator.userAgent);
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * True when the student said "Not now" less than `days` ago. Installing the app and
 * turning on notifications keep a student reachable, so we ask again the next day.
 * Storage may be blocked: then ask again.
 */
export function dismissedRecently(key: string, days = 1) {
  try {
    const at = Number(localStorage.getItem(key));
    return Boolean(at) && Date.now() - at < days * DAY;
  } catch {
    return false;
  }
}

export function rememberDismissed(key: string) {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // Storage blocked: the prompt shows again next visit.
  }
}

export const INSTALL_DISMISSED_KEY = "zigex_install_dismissed_at";
const INSTALLED_KEY = "zigex_app_installed";

/** Called when the browser reports the app was installed on this device. */
export function rememberInstalled() {
  try {
    localStorage.setItem(INSTALLED_KEY, "1");
  } catch {
    // Storage blocked: the installed app itself is still recognised (isStandalone).
  }
}

/**
 * Zigex is installed on this device: we're in the installed app, or the browser
 * reported installing it here (so a normal tab doesn't offer it again).
 */
export function installedHere() {
  if (isStandalone()) return true;
  try {
    return localStorage.getItem(INSTALLED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Sent whenever this device's notifications change (turned on or off), so every reminder updates. */
export const PUSH_CHANGED_EVENT = "zigex:push-changed";
export const NOTIFY_DISMISSED_KEY = "zigex_notify_dismissed_at";
