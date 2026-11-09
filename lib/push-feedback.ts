import { toast } from "sonner";
import { sendTestPush } from "@/lib/actions/push.actions";

async function thisDeviceEndpoint() {
  const reg = await navigator.serviceWorker.getRegistration().catch(() => undefined);
  const sub = await reg?.pushManager.getSubscription().catch(() => null);
  return sub?.endpoint;
}

/**
 * Sends a real test notification to this device and says what happened. "Sent"
 * means the push service accepted it; the phone's own settings can still hide it,
 * so the message says where to look.
 */
export async function testThisDevice(title = "Test sent") {
  const result = await sendTestPush(await thisDeviceEndpoint()).catch(() => null);
  if (result && result.sent > 0) {
    toast.success(title, {
      description: "A test notification is on its way to this device. No alert in a few seconds? Allow notifications for Zigex (or your browser) in your phone's settings.",
      duration: 10000,
    });
    return true;
  }
  toast.error("This device couldn't be reached", {
    description: "Turn notifications off and on again in Settings, then send another test.",
    duration: 10000,
  });
  return false;
}

/** Just turned on: confirm, and prove it with a test notification. */
export const confirmPushOn = () => testThisDevice("Notifications are on");
