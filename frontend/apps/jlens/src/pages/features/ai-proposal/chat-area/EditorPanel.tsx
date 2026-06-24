import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent }    from "@tiptap/react";
import StarterKit                      from "@tiptap/starter-kit";
import { Markdown }                    from "@tiptap/markdown";
import { TableKit }                    from "@tiptap/extension-table";
import { useUpdateProposal }           from "@query/ai-proposal/hooks";
import { Sparkles }                    from "lucide-react";
import BubbleTextReplace               from "../components/BubbleMenu";
import FormatMenuBar                   from "../components/FormatMenuBar";

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Debounce delay (ms) before persisting editor content to the backend */
const AUTOSAVE_DELAY_MS = 2000;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface EditorPanelProps {
  /** Markdown string to load into the editor */
  content: string;

  /** ID of the active conversation — passed to the update mutation */
  convId: string;

  /** ID of the proposal message being edited */
  msgId: string;
}

// ─── Sub-component: SelectionHint ──────────────────────────────────────────────

/**
 * SelectionHint renders a floating discovery badge over the editor.
 * Visible only when the editor has content and the user hasn't yet
 * made a text selection (i.e. hasn't discovered the bubble menu).
 *
 * Uses fixed positioning so it always renders regardless of parent
 * container overflow or height constraints.
 * Once dismissed (via click or first selection), it stays hidden
 * for the lifetime of the component via `hasDiscovered` state.
 */
const SelectionHint = ({ onDismiss }: { onDismiss: () => void }) => (
  <div
    onClick={onDismiss}
    className="
      fixed bottom-8 left-1/2 -translate-x-1/2 z-50
      flex items-center gap-2
      px-4 py-2 rounded-full
      bg-[#19105B] text-white
      text-xs font-medium
      shadow-xl cursor-pointer
      animate-bounce hover:animate-none
      hover:bg-[#19105B]/90
      transition-colors duration-200
      select-none
    "
    title="Click to dismiss"
  >
    <Sparkles className="w-3 h-3 text-[#FF6196] flex-shrink-0" />
    <span>Highlight any text to edit it with AI</span>
  </div>
);

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * EditorPanel renders a rich-text Tiptap editor pre-loaded with a markdown proposal.
 * Changes are debounced and auto-saved to the backend after AUTOSAVE_DELAY_MS of inactivity.
 * Supports markdown, tables, bubble-menu text replacement, and a format toolbar.
 *
 * A discovery hint badge floats over the editor until the user makes their
 * first text selection, surfacing the bubble-menu AI editing feature.
 */
const EditorPanel = ({ content, convId, msgId }: EditorPanelProps) => {
  const { mutate: updateProposal } = useUpdateProposal();

  /** Holds the debounce timer reference so it can be cleared on each keystroke */
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Tracks whether the user has discovered the bubble menu.
   * Set to true on first selection or manual hint dismissal.
   * Hides the SelectionHint permanently once true.
   */
  const [hasDiscovered, setHasDiscovered] = useState(false);

  // ── Editor setup ─────────────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [StarterKit, Markdown, TableKit],
    editable:   true,
    content:    "",

    /**
     * Fires on every content change.
     * Clears any pending save timer and starts a fresh debounce window.
     * Persists the latest markdown once the user pauses typing.
     */
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown();

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        updateProposal({
          conversationId: convId,
          msgId,
          content: markdown.toString(),
        });
      }, AUTOSAVE_DELAY_MS);
    },

    /**
     * Fires whenever the editor selection changes.
     * If the user selects a non-empty range, mark the feature as discovered
     * so the hint badge disappears and doesn't interrupt the bubble menu.
     */
    onSelectionUpdate: ({ editor }) => {
      if (!editor.state.selection.empty) {
        setHasDiscovered(true);
      }
    },
  });

  // ── Sync content prop → editor ────────────────────────────────────────────────

  /**
   * Replaces editor content whenever the `content` prop changes
   * (e.g. when a new proposal message is loaded or a follow-up updates it).
   * Also resets discovery state so the hint reappears for new proposals.
   */
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(content, { contentType: "markdown" });
    setHasDiscovered(false);
  }, [content, editor]);

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex flex-col h-full w-full">

      {/* Floating bubble menu for inline AI text replacement */}
      <BubbleTextReplace editor={editor} msgId={msgId} />

      {/* Sticky toolbar for block-level formatting (bold, headings, lists…) */}
      <FormatMenuBar editor={editor} />

      {/* Main editable content area */}
      <div className="relative flex-1 min-h-0 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />

        {/* Discovery hint — shown until first selection or manual dismiss */}
        {content && !hasDiscovered && (
          <SelectionHint onDismiss={() => setHasDiscovered(true)} />
        )}
      </div>
    </div>
  );
};

export default EditorPanel;