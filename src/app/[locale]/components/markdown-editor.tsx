"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useMemo } from "react";
import TurndownService from "turndown";
import { marked } from "marked";
import { Button } from "@/app/[locale]/components/ui/button";
import { Separator } from "@/app/[locale]/components/ui/separator";
import { cn } from "@/app/lib/utils";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";

// Initialize turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  br: "\n",
});

// Keep line breaks
turndownService.addRule("lineBreaks", {
  filter: "br",
  replacement: () => "\n",
});

// Customize turndown rules for strikethrough
turndownService.addRule("strikethrough", {
  filter: (node: HTMLElement) => {
    const tagName = node.nodeName.toLowerCase();
    return tagName === "del" || tagName === "s" || tagName === "strike";
  },
  replacement: (content) => `~~${content}~~`,
});

// Preserve paragraph breaks
turndownService.addRule("paragraph", {
  filter: "p",
  replacement: (content) => `\n\n${content}\n\n`,
});

interface MarkdownEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  minHeight?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  disabled?: boolean;
}

function ToolbarButton({
  onClick,
  isActive,
  icon: Icon,
  title,
  disabled,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={cn("h-8 w-8", isActive && "bg-muted")}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

// Convert markdown to HTML for TipTap
function markdownToHtml(markdown: string): string {
  if (!markdown) return "";
  return marked.parse(markdown, { async: false }) as string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  editable = true,
  className,
  minHeight = "min-h-[300px]",
}: MarkdownEditorProps) {
  // Convert initial markdown to HTML
  const initialHtml = useMemo(() => markdownToHtml(value), []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialHtml,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral dark:prose-invert max-w-none",
          "focus:outline-none p-4 h-full"
        ),
      },
    },
  });

  // Update content when value prop changes externally (convert markdown to HTML first)
  useEffect(() => {
    if (editor) {
      const currentMarkdown = turndownService.turndown(editor.getHTML());
      if (value !== currentMarkdown) {
        const html = markdownToHtml(value);
        editor.commands.setContent(html);
      }
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div className={cn("rounded-lg border", className)}>
        <div className={cn("p-4", minHeight)}>Loading editor...</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-background overflow-auto rounded-lg border",
        minHeight,
        className
      )}
    >
      {editable && (
        <div className="bg-muted/30 sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={Bold}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={Italic}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            icon={Strikethrough}
            title="Strikethrough"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            icon={Code}
            title="Inline Code"
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Headings */}
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            icon={Heading2}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            icon={Heading3}
            title="Heading 3"
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={ListOrdered}
            title="Numbered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            icon={Quote}
            title="Quote"
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Links */}
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            icon={LinkIcon}
            title="Add Link"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
            icon={Unlink}
            title="Remove Link"
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={Undo}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={Redo}
            title="Redo (Ctrl+Y)"
          />
        </div>
      )}
      <EditorContent
        editor={editor}
        className="w-full [&_.ProseMirror]:w-full [&_.tiptap]:w-full [&_.tiptap]:outline-none"
      />
    </div>
  );
}
