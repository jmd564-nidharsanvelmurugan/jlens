// useProposalTour.ts
// Reusable tour configuration and hook for the AI Proposal onboarding tour.

import { useState, useEffect, useCallback, useRef } from "react";

export interface TourStep {
  id: string;
  title: string;
  /** data-tour attribute value on the target element */
  target: string;
  content: string;
  tips?: string[];
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

export const TOUR_STORAGE_KEY = "ai_proposal_tour_completed";

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to AI Proposal Generator 🎉",
    target: "tour-welcome",
    placement: "center",
    content:
      "This tool helps you create professional, tailored proposals in minutes. " +
      "Answer a few guided questions (or upload a sales call transcript), add any extra instructions, " +
      "then let AI draft a polished proposal you can edit and download.\n\n" +
      "Quick workflow overview:\n" +
      "1. Answer guided questions or upload a sales-call file\n" +
      "2. Add an optional custom prompt\n" +
      "3. Generate your proposal\n" +
      "4. Review & edit in the right-hand panel\n" +
      "5. Download the finished document",
    tips: ["You can restart this tour any time from the Help menu."],
  },
  {
    id: "progress",
    title: "Progress Tracker",
    target: "tour-progress",
    placement: "bottom",
    content:
      "The progress bar shows how far through the question flow you are. " +
      "Each answered question advances the bar. Once all questions are answered the bar reaches 100 % and generation becomes available.",
    tips: [
      "You don't need to answer every question in one session — return any time to continue.",
    ],
  },
  {
    id: "sales-call",
    title: "Sales Call Upload (Fast-Track)",
    target: "tour-sales-call",
    placement: "bottom",
    content:
      "Have a recording or transcript of a sales call? Upload it here instead of answering every question manually.\n\n" +
      "Supported formats: .docx · .pdf · .txt · .csv · .ppt · .pptx (max 64 MB).\n\n" +
      "The AI will extract all the relevant answers from your document and skip straight to generation.",
    tips: [
      "This is the fastest way to generate a proposal if you already have a detailed call transcript.",
      "You can still add an extra prompt after uploading to fine-tune the output.",
    ],
  },
  {
    id: "question",
    title: "Guided Question Input",
    target: "tour-question",
    placement: "right",
    content:
      "Each question gathers a specific piece of information the AI needs to craft an accurate proposal.\n\n" +
      "Question types:\n" +
      "• Text — free-form answer, type as much detail as you like\n" +
      "• Radio — choose exactly one option\n" +
      "• Dropdown — choose one or more options that apply\n\n" +
      "Press Enter (or the Continue button) to move to the next question.",
    tips: [
      "More detail = better proposals. Don't be afraid to write a few sentences.",
      "You can edit any previous answer using the pencil icon beside it.",
    ],
  },
  {
    id: "file-upload",
    title: "Supporting Document Upload",
    target: "tour-upload",
    placement: "top",
    content:
      "Attach supporting documents at any point during the Q&A — e.g. an existing proposal template, " +
      "a product brochure, or a pricing sheet.\n\n" +
      "Supported: .docx · .pdf · .txt · .csv · .ppt · .pptx (max 64 MB each).\n\n" +
      "Uploaded files are stored with this conversation and used as additional context during generation.",
    tips: [
      "The more relevant context you provide, the more accurate and detailed the output.",
      "You can upload multiple files in a single session.",
    ],
  },
  {
    id: "additional-prompt",
    title: "Additional Prompt (Optional)",
    target: "tour-additional-prompt",
    placement: "top",
    content:
      "After all questions are answered you can add a free-text instruction here before generating.\n\n" +
      "Example uses:\n" +
      '• "Focus on our enterprise security capabilities"\n' +
      '• "Keep the tone formal and under 1 000 words"\n' +
      '• "Include a pricing table at the end"\n\n' +
      "Leave blank if you are happy with just the Q&A answers.",
    tips: [
      "Be specific: the more precise your instruction, the more targeted the output.",
    ],
  },
  {
    id: "generate",
    title: "Generate Proposal",
    target: "tour-generate",
    placement: "top",
    content:
      "Click Generate Proposal to start the AI writing process.\n\n" +
      "What happens behind the scenes:\n" +
      "1. Your answers and any uploaded files are packaged as context.\n" +
      "2. The AI model processes all sections in parallel.\n" +
      "3. Citations from your documents are attached to the output.\n\n" +
      "Typical generation time: 15–60 seconds depending on length.",
    tips: [
      "Don't close the tab while generating — the process runs in your browser session.",
    ],
  },
  {
    id: "results",
    title: "Generated Proposal",
    target: "tour-results",
    placement: "top",
    content:
      'Once generation completes, a "Generated Proposal" panel appears.\n\n' +
      "It shows the full AI-authored proposal text along with any citations pulled from your uploaded documents.\n\n" +
      "Read through the output to confirm the AI understood your requirements correctly before moving on.",
    tips: [
      "If the proposal missed the mark, use the Refine section below to course-correct without regenerating from scratch.",
    ],
  },
  {
    id: "editor",
    title: "Edit & Canvas Panel",
    target: "tour-editor",
    placement: "left",
    content:
      'Click "View and Edit proposal" to open the full editor panel on the right.\n\n' +
      "In the editor you can:\n" +
      "• Edit any section of the generated text directly\n" +
      "• Reorder or remove sections\n" +
      "• Accept AI suggestions or revert changes\n" +
      "• Trigger partial regeneration of a specific section\n\n" +
      "The left panel collapses to give you more editing space.",
    tips: [
      "Use Ctrl/Cmd + Z to undo edits inside the canvas.",
      "Click the panel toggle button (top-left) to bring back the Q&A panel at any time.",
    ],
  },
  {
    id: "refine",
    title: "Refine Your Proposal",
    target: "tour-refine",
    placement: "top",
    content:
      'The "Refine Your Proposal" chat box lets you send natural-language instructions to improve the existing output — without starting over.\n\n' +
      "Examples:\n" +
      '• "Make the introduction more concise"\n' +
      '• "Add a section on implementation timeline"\n' +
      '• "Change all prices to EUR"\n\n' +
      "You can also upload more files here if you have additional context.",
    tips: [
      "Think of this as a back-and-forth conversation with the AI editor.",
      "Press Enter to send, Shift+Enter for a new line.",
    ],
  },
  {
    id: "complete",
    title: "You're all set! 🚀",
    target: "tour-welcome",
    placement: "center",
    content:
      "You now know everything needed to generate great proposals.\n\n" +
      "Quick workflow recap:\n" +
      "1. Answer the guided questions (or upload a sales-call file)\n" +
      "2. Add an optional extra prompt\n" +
      "3. Click Generate Proposal\n" +
      "4. Review the output\n" +
      "5. Open the editor to refine\n" +
      "6. Download the final document from the editor panel\n\n" +
      "Need help later? Click the Help button (bottom-right) to restart this tour.",
    tips: [],
  },
];

export interface TourState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep;
  isFirst: boolean;
  isLast: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;
  hasCompleted: boolean;
}

export function useProposalTour(): TourState {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const highlightRef = useRef<HTMLElement | null>(null);

  // On mount, check localStorage and auto-start for first-time users
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    setHasCompleted(completed);
    if (!completed) {
      // slight delay so the UI is painted before the tour overlay appears
      const t = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Scroll-to and highlight the target element whenever the step changes
  useEffect(() => {
    if (!isActive) return;

    // Remove previous highlight
    if (highlightRef.current) {
      highlightRef.current.removeAttribute("data-tour-active");
    }

    const step = TOUR_STEPS[currentStep];
    if (step.placement === "center") return; // modal-style, no target highlight

    const el = document.querySelector<HTMLElement>(
      `[data-tour="${step.target}"]`
    );
    if (!el) return;

    highlightRef.current = el;
    el.setAttribute("data-tour-active", "true");
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    return () => {
      el.removeAttribute("data-tour-active");
    };
  }, [isActive, currentStep]);

  const complete = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setHasCompleted(true);
    setIsActive(false);
    if (highlightRef.current) {
      highlightRef.current.removeAttribute("data-tour-active");
    }
  }, []);

  const start = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, TOUR_STEPS.length - 1));
  }, []);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const skip = complete;
  const finish = complete;

  return {
    isActive,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    step: TOUR_STEPS[currentStep],
    isFirst: currentStep === 0,
    isLast: currentStep === TOUR_STEPS.length - 1,
    start,
    next,
    prev,
    skip,
    finish,
    hasCompleted,
  };
}