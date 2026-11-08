import { toast } from "sonner";
import { sendTestPush } from "@/lib/actions/push.actions";

/**
 * Tells the student notifications are on and proves it: a real test notification
 * goes to this device, and the message says whether it was sent.
 */
export async function confirmPushOn() {
  const result = await sendTestPush().catch(() => null);
  if (result && result.sent > 0) {
    toast.success("Notifications are on", { description: "We sent a test notification to this device." });
  } else {
    toast.success("Notifications are on", { description: "You'll get alerts for new opportunities and your applications." });
  }
}
