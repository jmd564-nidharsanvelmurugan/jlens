import { BubbleMenu } from "@tiptap/react/menus";
import { useRef, useState } from "react";
import { aiProposalApi } from "@query/ai-proposal/actions";

import type { Editor } from "@tiptap/core";
import { useLocation } from "react-router-dom";

function getSelectionMarkdown(editor:Editor) {
  const { from, to } = editor.state.selection;
  const slice = editor.state.doc.slice(from, to);
  const json = slice.content.toJSON();

  return editor.markdown?.serialize({
    type: "doc",
    content: json,
  });
}

type Props = {
  editor: Editor | null;
  msgId: string;
};
const MAX_HEIGHT = 100; 

const BubbleTextReplace = ({ editor, msgId }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  if (!editor) return null;

  const location = useLocation();
  const pathname = location.pathname;
  const convId = pathname.split("/")[4];

  const applyReplacement = async () => {
    if (!editor || loading) return;

    const selectedText = getSelectionMarkdown(editor);

    const userMessage = `
Instructions:
${inputValue}

Proposal Content:
${selectedText}
`;

    setLoading(true);
    setInputValue("");

    const llmResponse = await aiProposalApi.editProposalLLM(
      convId,
      userMessage,
      msgId
    );

    editor.chain().focus().deleteSelection().run();

    let i = 0;
    const insertNextChar = () => {
      if (i < llmResponse.length) {
        editor.chain().focus().insertContent(llmResponse[i]).run();
        i++;
        setTimeout(insertNextChar, 10);
      }
    };

    insertNextChar();
    setLoading(false);
  };

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }: any) => !state.selection.empty}
    >
<textarea
  ref={inputRef}
  value={inputValue}
  placeholder={loading ? "Please wait..." : "Ask AI to edit..."}
  onChange={(e) => {
    setInputValue(e.target.value);

    const el = inputRef.current;
    if (!el) return;

    // Reset height to recalculate
    el.style.height = "auto";

    // Grow until MAX_HEIGHT, then stop
    el.style.height = Math.min(el.scrollHeight, MAX_HEIGHT) + "px";

    // Enable scrollbar only after max height
    el.style.overflowY =
      el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      applyReplacement();
    }
  }}
  rows={2}
  style={{
    width: 220,
    resize: "none",
    padding: "6px 8px",
    fontSize: 14,
    lineHeight: "1.4",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    color: "#111827",
    outline: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",

    // IMPORTANT: no fixed height here
    maxHeight: MAX_HEIGHT,
    overflowY: "hidden",
  }}
/>

    </BubbleMenu>
  );
};

export default BubbleTextReplace
