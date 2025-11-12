// file: src/components/sections/admin/applicants/details/DetailSection.tsx (New File)
export const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card p-6 rounded-xl border">
    <h3 className="text-lg font-semibold text-card-foreground mb-4">{title}</h3>
    {children}
  </div>
);
