"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  ImageIcon,
  Minus,
  Undo2,
  Redo2,
  RemoveFormatting,
} from "lucide-react";

// ─── Toolbar Button ───────────────────────────────────────────────────────────
interface ToolbarBtnProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

const ToolbarBtn = ({ onClick, isActive, disabled, title, children }: ToolbarBtnProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-all duration-150 ${
      isActive
        ? "bg-blue-100 text-blue-700 shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

// ─── Toolbar Separator ────────────────────────────────────────────────────────
const ToolbarSep = () => <div className="w-px h-5 bg-slate-200 mx-1" />;

// ─── Toolbar Component ───────────────────────────────────────────────────────
const Toolbar = ({ editor }: { editor: Editor }) => {
  const setLink = useCallback(() => {
    const prevUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", prevUrl || "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-slate-200 bg-slate-50/80 rounded-t-xl">
      {/* Text Formatting */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold size={15} strokeWidth={2.5} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={15} />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Headings */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={15} />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Lists */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <ListOrdered size={15} />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Block Formats */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Code size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={15} />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Links & Images */}
      <ToolbarBtn
        onClick={setLink}
        isActive={editor.isActive("link")}
        title="Insert Link"
      >
        <LinkIcon size={15} />
      </ToolbarBtn>
      <ToolbarBtn onClick={addImage} title="Insert Image URL">
        <ImageIcon size={15} />
      </ToolbarBtn>

      <ToolbarSep />

      {/* Utilities */}
      <ToolbarBtn
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear Formatting"
      >
        <RemoveFormatting size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={15} />
      </ToolbarBtn>
      <ToolbarBtn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={15} />
      </ToolbarBtn>
    </div>
  );
};

// ─── Main Editor Component ───────────────────────────────────────────────────
interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your description...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer hover:text-blue-800",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none px-5 py-4 min-h-[200px] focus:outline-none " +
          "prose-headings:font-bold prose-headings:text-slate-900 " +
          "prose-p:text-slate-700 prose-p:leading-relaxed " +
          "prose-a:text-blue-600 prose-a:underline " +
          "prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:bg-blue-50/50 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-lg " +
          "prose-code:bg-slate-100 prose-code:text-pink-600 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm " +
          "prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl " +
          "prose-img:rounded-xl prose-img:shadow-md " +
          "prose-li:text-slate-700 " +
          "prose-hr:border-slate-200",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g., loading initial data)
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
    // Only sync on initial mount or when value changes from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="border border-slate-200 rounded-xl animate-pulse">
        <div className="h-10 bg-slate-50 rounded-t-xl" />
        <div className="h-[200px] bg-white rounded-b-xl" />
      </div>
    );
  }

  return (
    <div
      className={`border border-slate-200 rounded-xl overflow-hidden bg-white transition-shadow focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 ${className ?? ""}`}
    >
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

