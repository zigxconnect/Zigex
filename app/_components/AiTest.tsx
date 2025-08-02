'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { hasCompletedProfile } from '@/lib/actions/profile.actions';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserProfile {
  name: string;
  university: string;
  skills: string[];
}

export  function PersonalizedInternshipChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router=useRouter()

  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm your Bamenda Internship Connect assistant. I'm here to help you find personalized internship opportunities in Bamenda, Cameroon. 

I can help you with:
- Finding internships that match your skills
- Discovering companies in Bamenda
- Tailoring opportunities to your background
- Providing direct application links

What kind of internship are you looking for today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // *** MODIFIED AND CORRECTED FUNCTION ***
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Create a snapshot of the messages *before* adding the new user message
    // This is the history we will send to the API
    const historyForApi = messages
      // CRUCIAL FIX: Use slice(1) to remove the initial assistant welcome message.
      // This ensures the history payload always starts with a user message.
      .slice(1) 
      .map(msg => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }]
      }));

    // Optimistically update the UI now
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/fupro-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentInput, // Send the user's latest query
          history: historyForApi // Send the *preceding* conversation history
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get a response from the server.');
      }

      const data = await response.json();
      
      if (data.userProfile && !userProfile) {
        setUserProfile(data.userProfile);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-orange-500 text-white">
              <Bot size={20} />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-orange-900">Bamenda Internship Connect</h3>
            {userProfile && (
              <p className="text-sm text-orange-700">
                Helping {userProfile.name} from {userProfile.university}
              </p>
            )}
          </div>
        </div>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-orange-500 text-white"><Bot size={16} /></AvatarFallback>
              </Avatar>
            )}
            <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-orange-500 text-white ml-auto' : 'bg-gray-100 text-gray-900'}`}>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: message.content.replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>')
                }}
              />
              <div className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</div>
            </div>
            {message.role === 'user' && (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-500 text-white"><User size={16} /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8"><AvatarFallback className="bg-orange-500 text-white"><Bot size={16} /></AvatarFallback></Avatar>
            <div className="bg-gray-100 rounded-lg p-3"><Loader2 className="w-4 h-4 animate-spin" /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about internships in Bamenda..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} className="bg-orange-500 hover:bg-orange-600">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          {['Tech internships', 'Design opportunities', 'Marketing roles'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => { setInput(suggestion); }}
              disabled={isLoading}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}