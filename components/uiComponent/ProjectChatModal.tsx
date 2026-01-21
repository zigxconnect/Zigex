"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  LiveblocksProvider, 
  RoomProvider, 
  useStorage, 
  useMutation,
  useOthers,
  useStatus,
  ClientSideSuspense
} from "@liveblocks/react";
import { createClient, LiveList, LiveObject } from "@liveblocks/client";
import { 
  MessageCircle, 
  Send, 
  X, 
  User, 
  ShieldCheck,
  Search,
  ArrowLeft,
  Rocket,
  BookOpen,
  FileText,
  ChevronsDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { persistMessageAction, getMessageHistoryAction } from "@/lib/actions/chat.actions";
import { UserProfile } from "@/lib/actions/profile.actions";
import { NotificationDropdown } from "@/components/layout/dashboard/NotificationDropdown";
import { confirmCollaboratorAction } from "@/lib/actions/project.actions";
import { format } from "date-fns";
import { toast } from "sonner";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

type ChatMessage = Record<string, any> & {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: number;
  isAdmin: boolean;
};

interface Thread extends Record<string, any> {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  updatedAt: number;
}

interface ChatRoomProps {
  roomId: string;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  projectTitle: string;
  projectOwnerId: string;
  onBack?: () => void;
}

function ChatRoom({ roomId, currentUser, isAdmin, projectTitle, projectOwnerId, onBack }: ChatRoomProps) {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUser?.profile?.user_id === projectOwnerId;

  // Use a more robust selector similar to LiveReports
  const messages = useStorage((root: any) => {
    if (!root) return undefined;
    try {
      // Try both .get() and direct access for compatibility
      const list = typeof root.get === "function" ? root.get("messages") : root.messages;
      if (!list) return [];
      
      // If it's a LiveList, convert to array if possible
      if (typeof list.toArray === "function") return list.toArray();
      if (Array.isArray(list)) return list;
      return Array.from(list as any);
    } catch (e) {
      console.error("Error in storage selector:", e);
      return [];
    }
  }) as ChatMessage[] | undefined;

  const others = useOthers();
  const lastMessageCount = useRef(0);
  const notificationAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio on mount
    notificationAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
    notificationAudio.current.volume = 0.5;
  }, []);

  useEffect(() => {
    if (messages && messages.length > lastMessageCount.current) {
      const newMessages = messages.slice(lastMessageCount.current);
      // Play sound if there's a new message and it's not from me
      const hasOtherMessage = newMessages.some(m => m.senderId !== currentUser?.profile?.user_id);
      
      if (hasOtherMessage && lastMessageCount.current > 0) {
        notificationAudio.current?.play().catch(e => console.log("Audio play blocked", e));
      }
      
      lastMessageCount.current = messages.length;
    }
  }, [messages, currentUser]);

  const sendMessage = useMutation(({ storage }, text: string) => {
    if (!text.trim()) return;
    
    try {
      let messagesList = storage.get("messages") as LiveList<LiveObject<ChatMessage>>;
      
      if (!messagesList) {
        storage.set("messages", new LiveList([]));
        messagesList = storage.get("messages") as LiveList<LiveObject<ChatMessage>>;
      }

      if (messagesList) {
        const userId = currentUser?.profile?.user_id || "anonymous";
        const senderName = currentUser?.profile?.full_name || currentUser?.name || "Anonymous User";
        
        messagesList.push(new LiveObject({
          id: Math.random().toString(36).substring(7),
          senderId: userId,
          senderName,
          senderAvatar: currentUser?.profile?.avatar_url || undefined,
          text,
          createdAt: Date.now(),
          isAdmin: !!isAdmin
        }));

        // Broadcast presence in index room if possible (handled by caller room logic usually)
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async (customText?: string, metadata: any = {}) => {
    const text = customText || inputText;
    if (!text.trim()) return;

    if (!customText) setInputText("");

    // 1. Update Liveblocks (Real-time)
    sendMessage(text);

    // 2. Persist to Supabase
    const userId = currentUser?.profile?.user_id;
    if (userId) {
      let recipientId = projectOwnerId;
      const parts = roomId.split('-');
      const participantId = parts[parts.length - 1];
      
      if (userId === projectOwnerId) {
        recipientId = participantId;
      }

      await persistMessageAction({
        projectId: roomId.split('-')[2],
        senderId: userId,
        recipientId,
        text,
        metadata
      });
    }
  };

  const handleSendCV = () => {
    const profileUrl = `${window.location.origin}/dashboard/student/${currentUser?.profile?.user_id}`;
    handleSend(`📄 Shared Profile/CV: ${profileUrl}`, { type: 'cv_share', profileUrl });
    toast.success("Profile/CV shared with owner!");
  };

  const [isConfirming, setIsConfirming] = useState(false);
  const handleConfirmCollaborator = async () => {
    const parts = roomId.split('-');
    const participantId = parts[parts.length - 1]; // The other person

    if (participantId === "admin-support") {
        toast.error("Cannot confirm admin as collaborator");
        return;
    }

    setIsConfirming(true);
    const res = await confirmCollaboratorAction(roomId.split('-')[2], participantId);
    setIsConfirming(false);

    if (res.success) {
        toast.success("Collaborator confirmed successfully!");
        handleSend("✅ Collaboration confirmed! Looking forward to working together.", { type: 'collaboration_confirmed' });
    } else {
        toast.error("Failed to confirm collaborator: " + res.error);
    }
  };

  // History hydration
  const hydrateHistory = useMutation(async ({ storage }) => {
    const messagesList = (storage.get("messages") as unknown) as LiveList<LiveObject<ChatMessage>>;
    if (!messagesList || messagesList.length > 0) return;

    const projectId = roomId.split('-')[2];
    const parts = roomId.split('-');
    const participantId = parts[parts.length - 1];
    
    const history = await getMessageHistoryAction(projectId, participantId, projectOwnerId);
    
    if (history && history.length > 0) {
      history.forEach(msg => {
        messagesList.push(new LiveObject({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: "User", // Should ideally fetch names, but let's keep it simple
          text: msg.text,
          createdAt: new Date(msg.created_at).getTime(),
          isAdmin: false, // Defaulting for history
          ...msg.metadata
        }));
      });
    }
  }, [roomId, projectOwnerId]);

  useEffect(() => {
    if (messages && messages.length === 0) {
      hydrateHistory();
    }
  }, [messages, hydrateHistory]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{projectTitle}</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
               {roomId.includes('admin-support') ? 'Admin Support' : 'Live Chat'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {currentUser?.profile?.user_id === projectOwnerId && !roomId.includes('admin-support') && (
                <Button 
                    onClick={handleConfirmCollaborator} 
                    disabled={isConfirming}
                    size="sm" 
                    className="h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase px-3 shadow-md shadow-emerald-100"
                >
                    {isConfirming ? "Confirming..." : "Confirm Collaborator"}
                </Button>
            )}
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="h-8 rounded-full text-slate-500 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        <div className="space-y-4">
          {!messages ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
               <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
               <p className="text-slate-500 text-sm font-medium">Connecting to chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No messages yet.<br />Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUser?.profile?.user_id;
              return (
                <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] space-y-1 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.senderName}</span>
                      {msg.isAdmin && (
                        <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase border border-blue-100 italic">Admin</span>
                      )}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">
                      {format(msg.createdAt, "HH:mm")}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-slate-50/50 space-y-3">
        {!isOwner && !roomId.includes('admin-support') && (
            <div className="flex justify-start">
               <button 
                onClick={handleSendCV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 transition-colors border border-blue-100"
               >
                 <FileText className="w-3 h-3" /> Send Portfolio/CV
               </button>
            </div>
        )}
        <div className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
          <Button onClick={() => handleSend()} disabled={!inputText.trim()} className="bg-blue-600 hover:bg-blue-700 h-10 w-10 p-0 rounded-xl shadow-lg shadow-blue-200">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// A wrapper that handles "Threads" for the Owner
interface OwnerInboxProps {
  projectId: string;
  projectTitle: string;
  currentUser: UserProfile | null;
  onSelectRoom: (converserId: string) => void;
}

function OwnerInboxContent({ projectTitle, onSelectRoom }: OwnerInboxProps) {
  const threads = useStorage((root: any) => {
    if (!root || !root.conversers) return [];
    const list = root.conversers;
    // Map to objects to ensure we have the participantId etc.
    return typeof list.toArray === "function" ? list.toArray().map((item: any) => item.toObject ? item.toObject() : item) : Array.from(list as any);
  }) as Thread[];

  const [search, setSearch] = useState("");
  const filteredThreads = (threads || []).filter(t => 
    t && t.participantName && t.participantName.toLowerCase().includes(search.toLowerCase())
  );

  const defaultThreads: Thread[] = [
    {
      id: "inquiry-admin",
      participantId: "admin-support",
      participantName: "Zigex Admin Support",
      lastMessage: "Messages from platform administrators.",
      updatedAt: Date.now()
    }
  ];

  const allThreads = [...defaultThreads, ...filteredThreads].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b bg-slate-50 text-left">
        <h4 className="font-bold text-slate-900 text-sm">Project Inquiries</h4>
        <p className="text-[10px] text-slate-500 font-medium">Messages for {projectTitle}</p>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-semibold focus:ring-0" 
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y divide-slate-50">
          {allThreads.map(thread => (
            <button 
              key={thread.id}
              onClick={() => onSelectRoom(thread.participantId)}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h5 className="font-bold text-slate-900 text-sm truncate">{thread.participantName}</h5>
                  <span className="text-[10px] text-slate-400 font-black uppercase">Just now</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{thread.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function OwnerInbox(props: OwnerInboxProps) {
  const indexRoomId = `project-chat-${props.projectId}-index`;

  return (
    <RoomProvider 
      id={indexRoomId}
      initialStorage={{ conversers: new LiveList([]) }}
    >
      <ClientSideSuspense fallback={
        <div className="h-[500px] flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 text-sm font-medium">Loading inbox...</p>
        </div>
      }>
        <OwnerInboxContent {...props} />
      </ClientSideSuspense>
    </RoomProvider>
  );
}

// Helper to help non-owners announce their presence to the owner's inbox
function IndexRoomHandler({ projectId, currentUser }: { projectId: string, currentUser: UserProfile | null }) {
  const checkIn = useMutation(({ storage }) => {
    try {
      let conversers = (storage.get("conversers") as unknown) as LiveList<LiveObject<Thread>>;
      if (!conversers) {
        storage.set("conversers", new LiveList([]));
        conversers = (storage.get("conversers") as unknown) as LiveList<LiveObject<Thread>>;
      }

      const userId = currentUser?.profile?.user_id || "anonymous";
      const userIdx = conversers.toArray().findIndex(c => c.toObject().participantId === userId);
      
      if (userIdx === -1) {
        conversers.push(new LiveObject({
          id: userId,
          participantId: userId,
          participantName: currentUser?.profile?.full_name || currentUser?.name || "Anonymous User",
          participantAvatar: currentUser?.profile?.avatar_url || undefined,
          lastMessage: "Checking in to chat...",
          updatedAt: Date.now()
        }));
      } else {
        const entry = conversers.get(userIdx);
        entry.set("updatedAt", Date.now());
      }
    } catch (e) {
      console.error("Index check-in failed:", e);
    }
  }, [currentUser]);

  // Accessing storage directly in the component body forces ClientSideSuspense to wait
  const conversers = useStorage((root: any) => {
    if (!root) return undefined;
    const list = typeof root.get === "function" ? root.get("conversers") : root.conversers;
    return list;
  });
  
  const status = useStatus();

  useEffect(() => {
    // If we've reached here inside ClientSideSuspense AND we have conversers (due to above selector),
    // and we are connected, it should be safe to mutate.
    if (status === "connected" && conversers !== undefined) {
      const timer = setTimeout(() => {
        checkIn();
      }, 500); // Slightly longer delay for safety
      return () => clearTimeout(timer);
    }
  }, [checkIn, status, conversers]);

  return null;
}

export default function ProjectChatModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  projectOwnerId,
  currentUser,
  isAdmin,
  mode = "modal"
}: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  projectOwnerId: string;
  currentUser: UserProfile | null;
  isAdmin: boolean;
  mode?: "modal" | "docked";
}) {
  const [selectedConverserId, setSelectedConverserId] = useState<string | null>(null);

  const isOwner = currentUser?.profile?.user_id === projectOwnerId;

  // Stricter key validation
  const isKeyValid = PUBLIC_KEY && PUBLIC_KEY.startsWith("pk_");
  
  // Revised Room ID Logic:
  const effectiveConverserId = isOwner 
    ? selectedConverserId 
    : (isAdmin ? "admin-support" : (currentUser?.profile?.user_id || "anonymous"));
    
  const validatedRoomId = (projectId && effectiveConverserId) 
    ? `project-chat-${projectId}-${effectiveConverserId}` 
    : null;

  useEffect(() => {
    if (isOpen && validatedRoomId) {
      console.log("Chat Opening Attempt:", {
        roomId: validatedRoomId,
        isKeyValid,
        isOwner,
        effectiveConverserId
      });
    }
  }, [isOpen, validatedRoomId, effectiveConverserId, isOwner, isAdmin, isKeyValid]);

  if (!isOpen) return null;

  const isDocked = mode === "docked";

  return (
    <div className={isDocked ? "z-[100]" : "fixed inset-0 z-[100] flex items-center justify-center p-4"}>
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-200 z-[90] ${isDocked ? 'md:hidden' : 'absolute'}`}
      />

      <div className={`
        relative bg-white shadow-2xl overflow-hidden border border-slate-100 flex flex-col
        ${isDocked 
            ? "fixed z-[100] md:bottom-0 md:right-4 md:w-[380px] md:h-[600px] md:max-h-[80vh] md:rounded-t-2xl bottom-0 inset-x-0 w-full h-[85vh] rounded-t-[32px] animate-in slide-in-from-bottom duration-300 shadow-2xl"
           : "w-full max-w-xl rounded-2xl z-[100] animate-in zoom-in-95 duration-300 h-[600px] max-h-[80vh]"
        }
      `}>
        {/* Glow effect only for Modal mode */}
        {!isDocked && (
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 pointer-events-none" />
        )}
        
        <div className="relative flex-1 flex flex-col bg-white overflow-hidden h-full">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-[110] p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            {isDocked ? <ChevronsDown className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>

          {!isKeyValid ? (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6 text-amber-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Messaging Not Configured</h3>
              <p className="text-slate-500 text-sm max-w-xs mb-6">
                Liveblocks API keys are missing or invalid. Please ensure `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` (starting with pk_) is set in your .env.local and restart your server.
              </p>
              <Button onClick={onClose} variant="outline" className="rounded-xl">
                Close
              </Button>
            </div>
          ) : (
            <LiveblocksProvider publicApiKey={PUBLIC_KEY!}>
              {isOwner && !selectedConverserId ? (
                <OwnerInbox 
                  projectId={projectId}
                  projectTitle={projectTitle}
                  currentUser={currentUser}
                  onSelectRoom={setSelectedConverserId}
                />
              ) : !validatedRoomId ? (
                <div className="p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6 text-slate-300">
                    <Rocket className="w-8 h-8 animate-pulse" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Preparing secure connection...</p>
                </div>
              ) : (
                <>
                  {/* If not owner, we also join the index room to check-in */}
                  {!isOwner && (
                    <RoomProvider id={`project-chat-${projectId}-index`} initialStorage={{ conversers: new LiveList([]) }}>
                      <ClientSideSuspense fallback={null}>
                        <IndexRoomHandler projectId={projectId} currentUser={currentUser} />
                      </ClientSideSuspense>
                    </RoomProvider>
                  )}
                  
                  <RoomProvider 
                    id={validatedRoomId}
                    initialStorage={{ 
                      messages: new LiveList([]) 
                    }}
                  >
                    <ClientSideSuspense fallback={
                      <div className="h-full flex flex-col items-center justify-center text-center py-12">
                         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                         <p className="text-slate-500 text-sm font-medium">Connecting to chat...</p>
                      </div>
                    }>
                      <ChatRoom 
                        roomId={validatedRoomId}
                        currentUser={currentUser}
                        isAdmin={isAdmin}
                        projectTitle={projectTitle}
                        projectOwnerId={projectOwnerId}
                        onBack={isOwner ? () => setSelectedConverserId(null) : undefined}
                      />
                    </ClientSideSuspense>
                  </RoomProvider>
                </>
              )}
            </LiveblocksProvider>
          )}
        </div>
      </div>
    </div>
  );
}
