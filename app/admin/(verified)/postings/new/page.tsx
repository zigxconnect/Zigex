import { OptionCard } from "./components/OptionCard";

export default function PostNewPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            What would you like to post?
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Choose one of the options below to get started.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <OptionCard
            icon="Briefcase"
            title="Internship"
            description="Post an internship to find the best talent."
            href="/admin/postings/internship"
          />
          <OptionCard
            icon="Calendar"
            title="Event"
            description="Promote an event to your target audience."
            href="/admin/postings/event"
          />
          <OptionCard
            icon="Zap"
            title="Program"
            description="Launch a new program and attract participants."
            href="/admin/postings/program"
          />
        </div>
      </div>
    </div>
  );
}
