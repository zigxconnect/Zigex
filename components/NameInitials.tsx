/** Initials fallback for avatars; the letters scale with the avatar's size. */
const NameInitials = ({ name }: { name: string }) => {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="@container flex h-full w-full items-center justify-center bg-[#155DFC] text-white" aria-hidden="true">
      <span className="text-[40cqw] font-semibold leading-none">{initials}</span>
    </div>
  );
};

export default NameInitials;
