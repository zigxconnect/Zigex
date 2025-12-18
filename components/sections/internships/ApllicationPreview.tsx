"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/actions/profile.actions";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { PdfViewerModal } from "@/components/ui/PdfPreview";

const PreviewSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section>
    <h3 className="text-lg font-semibold text-[#193CB8] border-b border-gray-200 pb-2 mb-3">
      {title}
    </h3>
    <div className="text-sm text-gray-700 space-y-3">{children}</div>
  </section>
);

const DataField = ({
  label,
  value,
}: {
  label: string;
  value: string | string[] | undefined | null;
}) => {
  if (!value || value.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
      <p className="font-medium text-gray-500 md:col-span-1">{label}</p>
      <div className="md:col-span-2">
        {Array.isArray(value) ? (
          <div className="flex flex-wrap gap-2">
            {value.map((item) => (
              <span
                key={item}
                className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-md"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );
};

const DocumentField = ({
  label,
  file,
  onPreviewClick,
}: {
  label: string;
  file?: File;
  onPreviewClick: (file: File) => void;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center border-t pt-3">
      <p className="font-medium text-gray-500 md:col-span-1">{label}</p>
      <div className="md:col-span-2 flex justify-between items-center gap-4">
        <p className="text-gray-800 truncate" title={file?.name}>
          {file?.name ?? (
            <span className="text-gray-400 italic">Not provided</span>
          )}
        </p>
        {file && (
          <Button variant="secondary" onClick={() => onPreviewClick(file)}>
            <Eye size={16} className="mr-2" />
            Preview
          </Button>
        )}
      </div>
    </div>
  );
};

export const ApplicationPreview = ({
  profileData,
  applicationData,
}: {
  profileData: UserProfile;
  applicationData: {
    cover_letter_file?: File;
    support_letter_file?: File;
  };
}) => {
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        <PreviewSection title="Your Profile Information">
          <DataField label="Full Name" value={profileData.full_name} />
          <DataField label="Email" value={profileData.email} />
          <DataField label="Phone" value={profileData.phone} />
          <DataField label="University" value={profileData.university} />
          <DataField label="Skills" value={profileData.hard_skills} />

          {profileData.about && (
            <div className="pt-2">
              <p className="font-medium text-gray-500 mb-2">About Me</p>
              <p className="text-gray-800 p-4 bg-gray-50 rounded-md border border-gray-200 whitespace-pre-wrap text-sm">
                {profileData.about}
              </p>
            </div>
          )}
        </PreviewSection>

        <PreviewSection title="Documents for This Application">
          <DataField label="Resume / CV" value="Your ZIGEX Profile" />
          <DocumentField
            label="Cover Letter"
            file={applicationData.cover_letter_file}
            onPreviewClick={setPreviewFile}
          />
          <DocumentField
            label="Support Letter"
            file={applicationData.support_letter_file}
            onPreviewClick={setPreviewFile}
          />
        </PreviewSection>

        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
          By submitting, you confirm that all the information above is accurate
          and will be sent to the employer.
        </div>
      </div>

      {previewFile && (
        <PdfViewerModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
};
