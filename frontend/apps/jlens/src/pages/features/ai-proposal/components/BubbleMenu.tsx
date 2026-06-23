import { useRef, useState }      from "react";
import { BubbleMenu }            from "@tiptap/react/menus";
import { useLocation }           from "react-router-dom";
import { aiProposalApi }         from "@query/ai-proposal/actions";
import type { Editor }           from "@tiptap/core";

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Maximum pixel height of the auto-growing textarea before it starts scrolling */
const MAX_TEXTAREA_HEIGHT = 100;

/** Character-by-character insertion interval (ms) for the typewriter effect */
const TYPEWRITER_INTERVAL_MS = 10;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface BubbleTextReplaceProps {
  /** The active Tiptap editor instance — renders nothing when null */
  editor: Editor | null;

  /** ID of the proposal message being edited, sent to the LLM API */
  msgId: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Serialises the currently selected editor content to a markdown string.
 * Used to send just the highlighted text to the LLM for targeted editing.
 *
 * @param editor - The active Tiptap editor instance
 * @returns Markdown string of the selected content
 */
const getSelectionMarkdown = (editor: Editor): string => {
  const { from, to } = editor.state.selection;
  const slice        = editor.state.doc.slice(from, to);
  const json         = slice.content.toJSON();

  return editor.markdown?.serialize({ type: "doc", content: json });
};

/**
 * Auto-resizes a textarea element up to MAX_TEXTAREA_HEIGHT,
 * then switches to scrollable overflow once that ceiling is reached.
 *
 * @param el - The textarea DOM element to resize
 */
const autoResizeTextarea = (el: HTMLTextAreaElement) => {
  el.style.height    = "auto";
  el.style.height    = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  el.style.overflowY = el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * BubbleTextReplace renders a floating Tiptap BubbleMenu that appears
 * whenever the user has an active text selection in the editor.
 *
 * The user types an instruction; on Enter (or submit) the selected text and
 * instruction are sent to the LLM, the selection is deleted, and the AI
 * response is inserted character-by-character as a typewriter effect.
 */
const BubbleTextReplace = ({ editor, msgId }: BubbleTextReplaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [loading,    setLoading]    = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  /** Extract convId from the current route */
  const convId = useLocation().pathname.split("/")[4];

  // Early return — nothing to render without an editor instance
  if (!editor) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────

  /**
   * Sends the selected markdown + user instruction to the LLM,
   * then replaces the selection with the response via a typewriter effect.
   * Bails out early if already loading or input is empty.
   */
  const applyReplacement = async () => {
    if (!editor || loading || !inputValue.trim()) return;

    const selectedText = getSelectionMarkdown(editor);
    const userMessage  = `Instructions:\n${inputValue}\n\nProposal Content:\n${selectedText}`;

    setLoading(true);
    setInputValue("");

    const llmResponse = await aiProposalApi.editProposalLLM(convId, userMessage, msgId);

    // Delete the selected range before inserting the replacement
    editor.chain().focus().deleteSelection().run();

    // Insert the LLM response one character at a time (typewriter effect)
    let i = 0;
    const insertNextChar = () => {
      if (i < llmResponse.length) {
        editor.chain().focus().insertContent(llmResponse[i]).run();
        i++;
        setTimeout(insertNextChar, TYPEWRITER_INTERVAL_MS);
      }
    };
    insertNextChar();

    setLoading(false);
  };

  /**
   * Handles textarea value changes and triggers auto-resize on each keystroke.
   *
   * @param e - The native textarea change event
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (inputRef.current) autoResizeTextarea(inputRef.current);
  };

  /**
   * Submits on Enter (without Shift) to match chat-style UX.
   * Shift+Enter inserts a newline as normal.
   *
   * @param e - The native keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      applyReplacement();
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }: any) => !state.selection.empty}
    >
      <textarea
        ref={inputRef}
        rows={2}
        value={inputValue}
        placeholder={loading ? "Please wait..." : "Ask AI to edit..."}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        style={{
          width:           220,
          resize:          "none",
          padding:         "6px 8px",
          fontSize:        14,
          lineHeight:      "1.4",
          borderRadius:    6,
          border:          "1px solid #e5e7eb",
          backgroundColor: "#fff",
          color:           "#111827",
          outline:         "none",
          boxShadow:       "0 4px 12px rgba(0,0,0,0.08)",
          maxHeight:       MAX_TEXTAREA_HEIGHT,
          overflowY:       "hidden",
        }}
      />
    </BubbleMenu>
  );
};

export default BubbleTextReplace;