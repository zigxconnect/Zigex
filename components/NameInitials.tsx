const NameInitials = ({ name }: { name: string }) => {
    const initials = (name || "")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

    return (
        <div className="w-full h-full bg-primary from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl">
                  {initials}
        </div>
    );
}

export default NameInitials