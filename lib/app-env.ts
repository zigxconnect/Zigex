/**
 * Which deployment this build is: "production" (zigexconnect.com) or
 * "development" (dev.zigexconnect.com). Set NEXT_PUBLIC_APP_ENV at build time;
 * unset counts as production so existing deployments behave as before.
 */
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "production";
export const IS_PRODUCTION = APP_ENV === "production";
