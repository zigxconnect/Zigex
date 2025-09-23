import { PostEventForm } from "@/components/sections/admin/PostEventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Post a New Event</h1>
      <PostEventForm />
    </div>
  );
}
