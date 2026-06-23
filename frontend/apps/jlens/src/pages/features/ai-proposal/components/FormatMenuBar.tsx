import React                  from "react";
import { Editor }             from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
}                             from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Base Tailwind classes shared by every toolbar button */
const BUTTON_BASE =
  "px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors " +
  "bg-card text-foreground hover:bg-primary hover:text-white focus:outline-none";

/** Icon size class applied to every lucide icon in the toolbar */
const ICON_CLASS = "w-4 h-4";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ToolbarAction {
  /** Lucide icon component rendered inside the button */
  icon:    React.ElementType;

  /** Accessible label used as the button's title attribute */
  label:   string;

  /** Tiptap chain command to execute when the button is clicked */
  command: (editor: Editor) => void;
}

/** A divider entry signals a visual separator between button groups */
interface ToolbarDivider {
  divider: true;
}

type ToolbarItem = ToolbarAction | ToolbarDivider;

// ─── Toolbar config ─────────────────────────────────────────────────────────────

/**
 * Ordered list of toolbar items.
 * Divider entries render a thin vertical rule between logical button groups.
 * Adding or reordering formatting options only requires changing this array.
 */
const TOOLBAR_ITEMS: ToolbarItem[] = [
  // ── Text style ──────────────────────────────────────────────────────────────
  { icon: Bold,          label: "Bold",           command: (e) => e.chain().focus().toggleBold().run()      },
  { icon: Italic,        label: "Italic",         command: (e) => e.chain().focus().toggleItalic().run()    },
  { icon: Strikethrough, label: "Strikethrough",  command: (e) => e.chain().focus().toggleStrike().run()    },
  { icon: Underline,     label: "Underline",      command: (e) => e.chain().focus().toggleUnderline().run() },

  { divider: true },

  // ── Headings ────────────────────────────────────────────────────────────────
  { icon: Heading1,      label: "Heading 1",      command: (e) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { icon: Heading2,      label: "Heading 2",      command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: Heading3,      label: "Heading 3",      command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },

  { divider: true },

  // ── Lists & blocks ──────────────────────────────────────────────────────────
  { icon: List,          label: "Bullet list",    command: (e) => e.chain().focus().toggleBulletList().run()  },
  { icon: ListOrdered,   label: "Ordered list",   command: (e) => e.chain().focus().toggleOrderedList().run() },
  { icon: Code,          label: "Code block",     command: (e) => e.chain().focus().toggleCodeBlock().run()   },

  { divider: true },

  // ── History ─────────────────────────────────────────────────────────────────
  { icon: Undo,          label: "Undo",           command: (e) => e.chain().focus().undo().run() },
  { icon: Redo,          label: "Redo",           command: (e) => e.chain().focus().redo().run() },
];

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * FormatMenuBar renders a sticky rich-text toolbar above the Tiptap editor.
 * Buttons are generated from TOOLBAR_ITEMS so new actions only need a config entry.
 * Returns null when no editor instance is available.
 *
 * @param editor - The active Tiptap editor instance
 */
const FormatMenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="sticky top-0 flex flex-wrap gap-1 p-2 bg-popover border-b border-border shadow-sm backdrop-blur rounded-md border">
      {TOOLBAR_ITEMS.map((item, idx) => {

        /* Render a vertical divider between button groups */
        if ("divider" in item) {
          return <div key={`divider-${idx}`} className="mx-1 w-px bg-border" />;
        }

        const Icon = item.icon;

        return (
          <button
            key={item.label}
            title={item.label}
            onClick={() => item.command(editor)}
            className={BUTTON_BASE}
          >
            <Icon className={ICON_CLASS} />
          </button>
        );
      })}
    </div>
  );
};

export default FormatMenuBar;