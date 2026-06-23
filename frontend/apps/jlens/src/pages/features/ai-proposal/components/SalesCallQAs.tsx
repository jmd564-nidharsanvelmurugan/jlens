import React                  from "react";
import { Download, Upload,
         CheckCircle,
         AlertCircle }        from "lucide-react";
import { toast }              from "sonner";
import { aiProposalApi }      from "@query/ai-proposal/actions";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SalesCallQAsProps {
  /** Active conversation ID — upload is blocked without it */
  convId:     string;

  /** Whether a sales call DOCX has already been uploaded for this conversation */
  isUploaded: boolean;

  /** Callback fired after a successful upload to advance the parent flow */
  onUpload:   () => void;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

/** DOM ID of the hidden file input, used to trigger it via the card click */
const UPLOAD_INPUT_ID = "sales-call-upload-input";

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * SalesCallQAs renders two action cards side-by-side:
 *  1. Download — fetches the blank sales call questions DOCX template
 *  2. Upload   — accepts a completed DOCX and sends it to the backend
 *
 * The upload card shows a status icon reflecting whether the file has
 * already been uploaded for the current conversation.
 */
const SalesCallQAs = ({ convId, isUploaded, onUpload }: SalesCallQAsProps) => {

  // ── Handlers ────────────────────────────────────────────────────────────────

  /**
   * Triggers the hidden file input when the upload card is clicked.
   * Guards against missing convId before opening the file picker.
   */
  const handleUploadCardClick = () => {
    if (!convId) {
      toast.error("Conversation not found.");
      return;
    }
    document.getElementById(UPLOAD_INPUT_ID)?.click();
  };

  /**
   * Handles file selection from the hidden input.
   * - Validates that a file and convId are present
   * - Prompts for confirmation if a file was previously uploaded (override warning)
   * - Uploads via the API and notifies the parent on success
   * - Resets the input value so the same file can be re-selected if needed
   *
   * @param e - The native file input change event
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file)   return;
    if (!convId) { toast.error("Conversation not found."); return; }

    // Warn the user before overwriting a previously uploaded file
    if (isUploaded) {
      const confirmed = confirm(
        "Previously uploaded file will be overridden. Do you want to continue?"
      );
      if (!confirmed) return;
    }

    const toastId = toast.loading("Uploading...");

    try {
      const res = await aiProposalApi.uploadSalesCallQAs(convId, file);
      toast.dismiss(toastId);

      if (res.message) {
        toast.success("File uploaded successfully");
        onUpload();
      } else {
        toast.error("File upload unsuccessful");
      }
    } catch {
      toast.dismiss(toastId);
      toast.error("File upload failed");
    }

    // Reset so the same file can be re-uploaded without re-selecting a different one first
    e.target.value = "";
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex justify-center">
      <div className="flex flex-col sm:flex-row gap-4">

        {/* ── Download card ─────────────────────────────────────────────────── */}
        <div
          onClick={() => aiProposalApi.downloadSalesCallQuestionsDocx()}
          className="border border-primary/30 rounded-lg p-4 flex-1 min-w-[220px] shadow-sm hover:bg-primary/5 cursor-pointer"
        >
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Sales Call Questions
          </h3>
          <p className="mt-1 text-xs text-primary/70">
            Get the list of questions for your sales calls.
          </p>
        </div>

        {/* ── Upload card ───────────────────────────────────────────────────── */}
        <div
          onClick={handleUploadCardClick}
          className="border border-primary/30 rounded-lg p-4 flex-1 min-w-[220px] shadow-sm hover:bg-primary/5 cursor-pointer relative"
        >
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Sales Call Questions
          </h3>
          <p className="mt-1 text-xs text-primary/70">
            Upload the answered sales call questions here.
          </p>

          {/* Upload status indicator — yellow if pending, green if done */}
          <span className="absolute top-3 right-3">
            {isUploaded
              ? <CheckCircle className="w-5 h-5 text-green-600" />
              : <AlertCircle className="w-5 h-5 text-yellow-500" />
            }
          </span>

          {/* Hidden file input — triggered programmatically via handleUploadCardClick */}
          <input
            id={UPLOAD_INPUT_ID}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesCallQAs;