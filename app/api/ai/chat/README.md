# AI Chatbot Endpoint - Usage Guide

## Overview
The AI chatbot endpoint provides intelligent, context-aware conversations using Google's Gemini 2.0 Flash model. It understands the ZigEx platform and personalizes responses based on user profiles.

## Endpoint
```
POST /api/ai/chat
GET /api/ai/chat (health check)
```

## Setup

### 1. Add Environment Variable
Add to your `.env.local` file:
```bash
GOOGLE_API_KEY=your_google_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 2. Install Dependencies (Already Done)
The required package `@google/generative-ai` is already in package.json.

## API Usage

### POST Request
```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "Help me find internship opportunities in Cameroon",
    conversationHistory: [
      {
        role: "user",
        content: "Hello!"
      },
      {
        role: "assistant",
        content: "Hi! How can I help you today?"
      }
    ]
  })
});

const data = await response.json();
console.log(data.message); // AI response
```

### Response Format
```json
{
  "success": true,
  "message": "Based on your Computer Science background and Python skills, I found several great internship opportunities in Cameroon...",
  "timestamp": "2025-12-11T10:00:00.000Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## React Component Example

```tsx
'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = { 
          role: 'assistant', 
          content: data.message 
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <p className="text-sm font-semibold mb-1">
              {msg.role === 'user' ? 'You' : 'ZAi'}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%]">
            <p className="text-sm">ZAi is typing...</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask ZAi anything..."
          className="flex-1 p-3 border rounded-lg"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

## Features

### 1. Context Awareness
The AI knows about:
- ZigEx platform features (internships, programs, events, scholarships)
- Smart Apply feature
- Student and company profiles
- Application tracking
- Project showcase

### 2. User Personalization
Automatically includes:
- User's name, university, field of study
- Skills (technical and soft skills)
- Career interests
- Recent applications
- Location

### 3. Intelligent Responses
The AI can:
- Recommend relevant opportunities
- Provide application tips
- Suggest profile improvements
- Give career guidance
- Explain platform features

### 4. Conversation History
Maintains context across messages for natural conversations.

### 5. Error Handling
Robust error handling for:
- Invalid API keys
- Quota exceeded
- Network errors
- Invalid requests

## Advanced Usage

### With Streaming (Future Enhancement)
```typescript
// For real-time streaming responses
const response = await fetch('/api/ai/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' })
});

const reader = response.body?.getReader();
// Process stream...
```

### With Tool Calling (Future Enhancement)
```typescript
// AI can trigger specific actions
{
  message: "Find me internships",
  enableTools: true,
  tools: ['opportunity_search', 'profile_analysis']
}
```

## Best Practices

1. **Always include conversation history** for context
2. **Limit history to last 10-20 messages** to avoid token limits
3. **Handle errors gracefully** with user-friendly messages
4. **Show loading states** while waiting for responses
5. **Sanitize user input** before sending
6. **Rate limit requests** to avoid quota issues

## Security

- ✅ Requires authentication (user must be logged in)
- ✅ Uses server-side API key (not exposed to client)
- ✅ Validates all inputs
- ✅ Implements safety settings
- ✅ Logs interactions for monitoring

## Performance

- **Model**: gemini-2.0-flash-exp (fastest Gemini model)
- **Response Time**: ~1-3 seconds
- **Token Limit**: 2048 output tokens
- **Context Window**: Large enough for full conversations

## Monitoring

Check endpoint health:
```bash
curl http://localhost:3000/api/ai/chat
```

Response:
```json
{
  "status": "operational",
  "configured": true,
  "model": "gemini-2.0-flash-exp",
  "features": [
    "Context-aware conversations",
    "Personalized recommendations",
    "Opportunity discovery",
    "Application assistance",
    "Career guidance"
  ]
}
```

## Troubleshooting

### "AI service not configured"
- Add `GOOGLE_API_KEY` to `.env.local`
- Restart development server

### "Invalid API key"
- Verify API key is correct
- Check API key has Gemini API enabled

### "API quota exceeded"
- Wait for quota reset
- Upgrade to paid plan if needed

### "Unauthorized"
- User must be logged in
- Check Supabase authentication

## Next Steps

1. Add to your ZAi chat interface
2. Customize system context for your needs
3. Add more user context (projects, achievements)
4. Implement streaming for better UX
5. Add tool calling for actions
6. Monitor usage and optimize

---

**Built with production-grade engineering practices** 🚀
