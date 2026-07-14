"use client";

/**
 * RichContentRenderer
 * Safely renders HTML content from the TipTap rich text editor.
 * Applies beautiful typography styling via inline Tailwind prose classes.
 * Falls back gracefully for plain-text descriptions (wraps in <p> tags).
 */

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export function RichContentRenderer({
  content,
  className,
}: RichContentRendererProps) {
  if (!content) return null;

  // Detect if content is plain text (no HTML tags) and wrap it
  const isPlainText = !/<[a-z][\s\S]*>/i.test(content);
  const htmlContent = isPlainText
    ? content
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => `<p>${line}</p>`)
        .join("")
    : content;

  return (
    <div
      className={`rich-content-renderer ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
