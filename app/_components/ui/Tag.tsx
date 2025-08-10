export const Tag = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="px-3 py-1 text-xs text-orange-800 bg-orange-100 rounded-full font-medium">
      {children}
    </span>
  );
};
