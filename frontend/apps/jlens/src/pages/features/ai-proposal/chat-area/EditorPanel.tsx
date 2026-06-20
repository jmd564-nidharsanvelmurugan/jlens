import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { useEffect, useRef} from "react";
import { useUpdateProposal } from "@query/ai-proposal/hooks";
import BubbleTextReplace from "../components/BubbleMenu";
import { TableKit } from '@tiptap/extension-table'
import FormatMenuBar from "../components/FormatMenuBar";


const EditorPanel = ({
  content,
  convId,
  msgId,
}: {
  content: string;
  convId: string;
  msgId: string;
}) => {
  const { mutate: updateProposal } = useUpdateProposal();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Markdown, TableKit],
    editable: true,
    content: "",
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown();

      // Clear previous timer if any
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Start a new debounce timer
      timerRef.current = setTimeout(() => {
        updateProposal({ conversationId: convId, msgId, content: markdown.toString() });
      }, 2000); // 2 seconds delay
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.commands.setContent(content, { contentType: "markdown" });
  }, [content, editor]);

  return (
    <>
      <BubbleTextReplace editor={editor} msgId={msgId} />
      <FormatMenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 min-h-0 overflow-y-auto" />
    </>
  );
};

export default EditorPanel;
