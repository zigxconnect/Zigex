// components/ChatSkeleton.jsx
export default function ChatSkeleton() {
  return (
    <div className="flex space-x-3 p-4 w-[100%] h-5">
      
      {/* Message content skeleton */}
      <div className="flex-1 space-y-2">
        {/* First line - longer */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        
        {/* Second line - medium */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        
        {/* Third line - shorter */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
    </div>
  );
}

// export default ChatSkeleton