"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

interface TypingTextProps {
  content: string;
  speed?: number; // ms per character
  onComplete?: () => void;
  className?: string;
}

export function TypingText({ content, speed = 20, onComplete, className }: TypingTextProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // If content is empty or short, just show it immediately to avoid glitches
    if (!content) {
      setDisplayedContent("");
      return;
    }

    // Reset when content significantly changes (new message)
    if (currentIndex === 0) {
       setDisplayedContent("");
    }

    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, content, speed, onComplete]);

  // Adjust content update trigger
  useEffect(() => {
      // If content length grows (e.g. real streaming), we need to ensure we keep typing
      // But for fixed content, we just reset if the content prop itself changes completely
      // For now, assume content is static once passed.
  }, [content]);

  return (
    <div className={cn("prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-800 prose-p:leading-relaxed prose-strong:text-gray-900", className)}>
        <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
                code: ({node, inline, className, children, ...props}: any) => {
                    return inline ? (
                        <code className="bg-gray-100 text-blue-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                            {children}
                        </code>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                },
                a: ({node, children, href, ...props}: any) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800" {...props}>
                        {children}
                    </a>
                ),
            }}
        >
            {displayedContent}
        </ReactMarkdown>
        {currentIndex < content.length && (
            <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-blue-500 animate-pulse rounded-sm" />
        )}
    </div>
  );
}
