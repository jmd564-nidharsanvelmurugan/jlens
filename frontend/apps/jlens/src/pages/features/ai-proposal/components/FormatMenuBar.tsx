import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Underline, // <-- add this import
} from "lucide-react";

// Remove border from buttonBase
const buttonBase =
  "px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors " +
  "bg-card text-foreground " +
  "hover:bg-primary hover:text-white focus:outline-none";

const iconClass = "w-4 h-4";

const FormatMenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div
      className="sticky top-0 flex flex-wrap gap-1 p-2 bg-popover border-b border-border shadow-sm backdrop-blur rounded-md border"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonBase}
      >
        <Bold className={iconClass} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonBase}
      >
        <Italic className={iconClass} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonBase}
      >
        <Strikethrough className={iconClass} />
      </button>

      {/* Underline button */}
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={buttonBase}
      >
        <Underline className={iconClass} />
      </button>

      <div className="mx-1 w-px bg-border" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonBase}
      >
        <Heading1 className={iconClass} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonBase}
      >
        <Heading2 className={iconClass} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonBase}
      >
        <Heading3 className={iconClass} />
      </button>

      <div className="mx-1 w-px bg-border" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonBase}
      >
        <List className={iconClass} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonBase}
      >
        <ListOrdered className={iconClass} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonBase}
      >
        <Code className={iconClass} />
      </button>

      <div className="mx-1 w-px bg-border" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        className={buttonBase}
      >
        <Undo className={iconClass} />
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        className={buttonBase}
      >
        <Redo className={iconClass} />
      </button>
    </div>
  );
};

export default FormatMenuBar;
