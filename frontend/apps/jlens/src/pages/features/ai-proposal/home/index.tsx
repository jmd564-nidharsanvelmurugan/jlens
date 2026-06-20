import React, { useContext } from "react";
import { useState, useRef, useMemo, useEffect } from "react";
import {
  CheckCircle,
  Edit3,
  Send,
  Upload,
  ArrowRight,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Loading } from "@/components/common/loading";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useProposalQuestions } from "@query/ai-proposal/hooks";
import {
  useSendMessage,
  useCreateConversation,
  useConversationMessages,
} from "@query/layout/conversations/hooks";
import {
  useWorkspaces,
  useCreateWorkspace,
} from "@query/layout/workspace/hooks";
import { aiProposalApi } from "@query/ai-proposal/actions";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "@ui/components/ui/textarea";
import { toast } from "sonner";
import { useWorkspaceContext } from "../../../../context/WorkspaceContext";
import { useSidebarContext } from "@/context/SidebarContext";
import ProposalChat from "../chat-area/ProposalChat";
import { createContext } from "react";
import type { AiProposalContextType } from "../types";
import SalesCallQAs from "../components/SalesCallQAs";


const AiProposalContext = createContext({} as AiProposalContextType);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
type Workspace = {
  id: string;
  name: string;
  description?: string;
  pre_prompt?: string;
  is_private?: boolean;
  [key: string]: any;
};
// const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;


const useConversationContext = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  return { selectedConversation, setSelectedConversation };
};




const AiProposal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const feature = pathname.split("/")[2];
  const workspaceId = pathname.split("/")[3];
  const convId = pathname.split("/")[4];
  const autoSendMessage = location.state?.autoSendMessage;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<string | string[]>("");
  const [storedQA, setStoredQA] = useState(true);
  const [isQAcomplete, setIsQAcomplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const { data: proposalQuestions, isLoading: proposalQuestionsLoading } =
    useProposalQuestions();
  const { mutateAsync: sendMessage } = useSendMessage();
  const { setSelectedConversation } = useConversationContext();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { data: workspaces } = useWorkspaces() as {
    data: Array<{
      id: string;
      name: string;
      description: string | null;
      pre_prompt: string | null;
      is_private: boolean;
      created_at: string;
      updated_at: string;
    }>;
  };
  const { mutateAsync: createWorkspace } = useCreateWorkspace();
  const { mutate: createConversation } = useCreateConversation();
  const {
    data: historyMessages,
    isLoading: historyMessagesLoading,
    isError: historyMessagesError,
  } = useConversationMessages(convId, 1000 * 60);
  const [followUpMessages, setFollowUpMessages] = useState<any[]>([]);
  const [currentUserPrompt, setCurrentUserPrompt] = useState<string>("");
  const { setSelectedWorkspace } = useWorkspaceContext();
  const [isEditorPanelOpen, setIsEditorPanelOpen] = useState(false);
  const [isSalesQAs, setIsSalesQAs] = useState(false);
  const [isConversationPanelOpen, setIsConversationPanelOpen] = useState(true);
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebarContext();

  useEffect(() =>{
    if (!isEditorPanelOpen){
      setIsConversationPanelOpen(true);
    }
  }, [isEditorPanelOpen])
  let aiProposalWorkspace = useMemo(() => {
    return workspaces?.find(
      (ws) => ws.name === "AI Proposal"
    );
  }, [workspaceId, workspaces]);

  useEffect(() => {
    if (aiProposalWorkspace) {
      setSelectedWorkspace(aiProposalWorkspace as Workspace);
    }
  }, [aiProposalWorkspace, setSelectedWorkspace]);

  useEffect(() => {
    return () => {
      setSelectedWorkspace(null)
    }
  }, [])
  const handleFollowUpSend = async () => {
    setIsGenerating(true);
    if (!currentUserPrompt) return;
    const newFollowUp = {
      id: uuidv4(),
      content: currentUserPrompt,
      created_at: new Date().toISOString(),
      role: "user",
    };
    setFollowUpMessages((prev) => [...prev, newFollowUp]);
    setCurrentUserPrompt("");

    try {
      const res = await aiProposalApi.handleFollowUpSend(
        convId,
        currentUserPrompt
      );
      setFollowUpMessages((prev) => [
        ...prev,
        {
          id: res.msgId,
          content: res.assistant,
          created_at: new Date().toISOString(),
          role: "assistant",
        },
        {
          id: uuidv4(),
          content: res.tool,
          created_at: new Date().toISOString(),
          role: "tool",
        },
      ]);
    } catch (err) {
    } finally {
      setIsGenerating(false);
    }
  };

  const questions = useMemo(() => {
    if (!proposalQuestions) return [];
    return proposalQuestions.map((q) => ({
      id: q.id,
      text: q.question,
      type: q.type,
      options: q.options ?? undefined,
      required: true,
      category: q.category ?? undefined,
    }));
  }, [proposalQuestions]);

  useEffect(() => { }, [answers]);
    // useEffect(() => {
    //   const interval = setInterval(() => {
    //     if (historyMessages) {
    //       console.log("historyMessages:-", historyMessages);
    //       console.log('followUpMessages:-', followUpMessages);
          
    //     }
    //   }, 4000);
    //   return () => clearInterval(interval);
    // }, [historyMessages, followUpMessages]);
  const convHistoryLoader = async () => {
    const qaPairs = [];
    let questionIdx = 0;
    if (!historyMessages) return;
    if (historyMessages.length < 2) return;

    setIsSalesQAs(localStorage.getItem(`isSalesQas----${convId}`) === "true");
    let i = 0;
    for (
      ;
      i < Math.min(questions.length * 2, historyMessages.length) - 1;
      i += 2
    ) {
      const questionMsg = historyMessages[i];
      const answerMsg = historyMessages[i + 1];

      if (questionMsg.role === "assistant" && answerMsg.role === "user") {
        const question = questions.find((q) => q.text === questionMsg.content);
        if (question) {
          qaPairs.push({
            questionId: question.id,
            value: answerMsg.content,
            edit: false,
          });
          questionIdx++;
        }
      }
    }
    
    setAnswers(qaPairs);
    setCurrentQuestionIndex(questionIdx);
    setIsQAcomplete(false);
    setFollowUpMessages([]);
    if (questionIdx >= questions.length) {
      setIsQAcomplete(true);
      for (; i < historyMessages.length; i++) {
        const msg = {
          id: historyMessages[i].id,
          content: historyMessages[i].content,
          created_at: historyMessages[i].created_at,
          role: historyMessages[i].role,
        };
        setFollowUpMessages((prev) => [...prev, msg]);
      }
    }
  };

  useEffect(() => {
    // New AI proposal chat clean ups/loads
    if (!convId) {
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setCurrentAnswer("");
      setIsQAcomplete(false);
      setFollowUpMessages([]);
      setIsEditorPanelOpen(false);
      return;
    }
    if (questions.length === 0) return;
    if (historyMessagesLoading) return;
    if (historyMessagesError) return;
    convHistoryLoader();
  }, [convId, questions, historyMessages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Allowed extensions
    const allowedExtensions = [
      ".docx",
      ".pdf",
      ".txt",
      ".csv",
      ".ppt",
      ".pptx",
    ];
    const invalidFiles = Array.from(files).filter((file) => {
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      return !allowedExtensions.includes(ext);
    });

    const maxFileSize = 64 * 1024 * 1024; // 64 MB in bytes
    const oversizedFiles = Array.from(files).filter((file) => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast.error("File size must not exceed 64 MB");
      return;
    }

    if (invalidFiles.length > 0) {
      toast.error(
        "Only .docx, .pdf, .txt, .csv, .ppt, .pptx files are allowed"
      );
      return;
    }

    try {
      const toastId = toast.loading("Uploading ...");
      const res = await aiProposalApi.uploadFiles(convId, files);
      toast.dismiss(toastId);
      if (res.success) toast.success("Files uploaded successfully");
      else toast.error("File upload unsuccessful");
    } catch (err) {
      toast.error("File upload failed");
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleTextAnswer = (value: string) => {
    setCurrentAnswer(value);
  };

  const handleRadioAnswer = (value: string) => {
    setCurrentAnswer(value);
  };

  const handleDropdownAnswer = (option: string, checked: boolean) => {
    const currentAnswerArray = Array.isArray(currentAnswer)
      ? currentAnswer
      : [];
    if (checked) {
      setCurrentAnswer([...currentAnswerArray, option]);
    } else {
      setCurrentAnswer(currentAnswerArray.filter((item) => item !== option));
    }
  };

  const isAnswerValid = () => {
    if (!currentQuestion.required) return true;

    if (currentQuestion.type === "TEXT") {
      return (
        typeof currentAnswer === "string" && currentAnswer.trim().length > 0
      );
    }

    if (currentQuestion.type === "RADIO") {
      return typeof currentAnswer === "string" && currentAnswer.length > 0;
    }

    if (currentQuestion.type === "DROPDOWN") {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0;
    }

    return false;
  };

  const handleCreateConversation = async (
    text: string
  ): Promise<string | null> => {
    if (isCreatingConversation) return null;

    setIsCreatingConversation(true);

    if (!aiProposalWorkspace) {
      aiProposalWorkspace = await createWorkspace({
        name: "AI Proposal",
        description: "AI Proposal Workspace",

        is_private: true,
      });
    }
    setSelectedWorkspace(aiProposalWorkspace as Workspace);
    const payload = {
      title: text.slice(0, 50) + (text.length > 50 ? "..." : ""),
      workspace_id: aiProposalWorkspace?.id || "",
      component_type: "proposal",
    };

    try {
      const res = await new Promise<any>((resolve, reject) => {
        createConversation(payload, {
          onSuccess: resolve,
          onError: reject,
        });
      });

      if (res?.id) {
        setSelectedConversation({
          id: res.id,
          title: res.title,
          workspace_id: res.workspace_id,
          component_type: "proposal",
        });
        localStorage.setItem(`isSalesQas----${res.id}`, "false");
        
        navigate(`/app/${feature}/${aiProposalWorkspace?.id}/${res.id}`, {
          replace: true,
          state: {
            autoSendMessage: text,
          },
        });

        return res.id;
      }
    } catch (err) {
    } finally {
      setIsCreatingConversation(false);
    }

    return null;
  };

  const [user_prompt, set_user_prompt] = useState<string>("");

  

  const storeQA = async (questions: any[], qid: number, answer: string) => {
    setStoredQA(false);
    try{
      const question = questions.find((q) => q.id === qid)
      if (!question) 
        throw new Error(`Question not found`);
      const questionPayload = {
        conversation_id: convId,
        workspace_id: workspaceId,
        content: question.text,
        role: "assistant",
        model_type: "",
        chat_type: "hybrid",
        component_type: "proposal",
        input_tokens: 0,
        output_tokens: 0,
      };
      const answerPayload = {
        conversation_id: convId,
        workspace_id: workspaceId,
        content: answer,
        role: "user",
        model_type: "",
        chat_type: "hybrid",
        component_type: "proposal",
        input_tokens: 0,
        output_tokens: 0,
      };



      

      
      await sendMessage(questionPayload);
      await sendMessage(answerPayload);
    } catch (err) {
      
    } finally {
      setStoredQA(true);
    }
  };

  useEffect(() => {
    if (autoSendMessage && questions.length > 0 && currentQuestionIndex < questions.length) {
      storeQA(questions, currentQuestionIndex, autoSendMessage);
    }
  }, [autoSendMessage]);

  const handleNext = async () => {
    if (!isAnswerValid()) return;
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });

    const newAnswer = {
      questionId: currentQuestion.id,
      value: currentAnswer,
      edit: false,
    };
    const updatedAnswers = [
      ...answers.filter((a) => a.questionId !== currentQuestion.id),
      newAnswer,
    ];
    setAnswers(updatedAnswers);
    const storeAnswer = (
      typeof currentAnswer === "string"
        ? currentAnswer.trim()
        : currentAnswer.join(", ")
    ).trim();

    if (!convId) {
      (await handleCreateConversation(storeAnswer)) || "";
    }
    if (currentQuestionIndex < questions.length - 1) {
      if (convId) {
        storeQA(questions, currentQuestionIndex + 1, storeAnswer);
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer("");
    } else {
      setIsQAcomplete(true);
      setIsGenerating(true);
      await storeQA(questions, currentQuestionIndex + 1, storeAnswer);








    console.log("convId:-", convId, "user_prompt:-", user_prompt);
      const data = await aiProposalApi.generateProposal(convId , user_prompt);

      const texts = data.proposal.map(
        (item) => (item.response ?? item.error ?? "") + "\n"
      );

      setFollowUpMessages((prev) => [
        ...prev,
        {
          id: data.msg_id,
          role: "assistant",
          content: texts.join("\n"),
          created_at: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          role: "tool",
          content: JSON.stringify(data.citations),
          created_at: new Date().toISOString(),
        },
      ]);
      setIsGenerating(false);
    }
  };

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answers.length]);

  const getAnswerDisplay = (answer: any) => {
    return Array.isArray(answer.value) ? answer.value.join(", ") : answer.value;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && storedQA) {
      event.preventDefault();
      handleNext();
      return;
    }
  };

  const answerInput = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "TEXT":
        return (
          <div className="space-y-2">
            <textarea
              value={currentAnswer as string}
              onKeyDown={(e) => handleKeyDown(e)}
              onChange={(e) => handleTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#19105B] resize-none min-h-[80px] text-sm"
            />
          </div>
        );
      case "RADIO":
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option: any, _index: number) => (
              <div
                key={option}
                className={`flex items-center p-2 border rounded cursor-pointer text-sm ${currentAnswer === option
                    ? "border-[#19105B] bg-[#19105B]/5"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => handleRadioAnswer(option)}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${currentAnswer === option
                      ? "border-[#19105B] bg-[#19105B]"
                      : "border-gray-300"
                    }`}
                >
                  {currentAnswer === option && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </div>
                <label className="cursor-pointer flex-1">{option}</label>
              </div>
            ))}
          </div>
        );
      case "DROPDOWN":
        return (
          <div className="space-y-2">
            <div className="text-xs text-gray-600 mb-2">
              Select all that apply
            </div>
            {currentQuestion.options?.map((option: any) => (
              <div
                key={option}
                className={`flex items-center p-3 border rounded-lg cursor-pointer text-sm transition-all hover:shadow-sm ${Array.isArray(currentAnswer) && currentAnswer.includes(option)
                    ? "border-[#19105B] bg-[#19105B]/10 shadow-sm"
                    : "border-gray-200 hover:border-[#19105B]/30 bg-white"
                  }`}
                onClick={() =>
                  handleDropdownAnswer(
                    option,
                    !(
                      Array.isArray(currentAnswer) &&
                      currentAnswer.includes(option)
                    )
                  )
                }
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 mr-3 flex items-center justify-center transition-colors ${
                    Array.isArray(currentAnswer) &&
                      currentAnswer.includes(option)
                      ? "border-[#19105B] bg-[#19105B]"
                      : "border-gray-300 bg-white"
                    }`}
                >
                  {Array.isArray(currentAnswer) &&
                    currentAnswer.includes(option) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                </div>
                <span className="text-gray-800 font-medium">{option}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const editAnswerInput = (question: any) => {
    const answerIndex = answers.findIndex((a) => a.questionId === question.id);
    if (answerIndex === -1) return null;
    const answer = answers[answerIndex];

    const handleEditChange = (value: string | string[]) => {
      const updated = [...answers];
      updated[answerIndex] = {
        ...updated[answerIndex],
        value: value,
      };
      setAnswers(updated);
    };

    switch (question.type) {
      case "TEXT":
        return (
          <div className="space-y-2">
            <textarea
              value={answer.value as string}
              onChange={(e) => handleEditChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  setAnswers((prev) =>
                    prev.map((ans) =>
                      ans.questionId === question.id
                        ? { ...ans, edit: false }
                        : ans
                    )
                  );
                  return;
                }
              }}
              className="w-full min-h-[60px] max-h-[60px] resize-none px-2 py-2 border border-gray-300 rounded bg-gray-50 text-xs focus:outline-none focus:border-[#19105B]"
              disabled={isGenerating}
              autoFocus
            />
          </div>
        );

      case "RADIO":
        return (
          <div className="space-y-1">
            {question.options?.map((option: any) => (
              <div
                key={option}
                className={`flex items-center p-2 border rounded cursor-pointer text-sm ${answer.value === option
                    ? "border-[#19105B] bg-[#19105B]/5"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
                onClick={() => handleEditChange(option)}
              >
                <div
                  className={`w-3 h-3 rounded-full border mr-2 flex items-center justify-center ${answer.value === option
                      ? "border-[#19105B] bg-[#19105B]"
                      : "border-gray-300"
                    }`}
                >
                  {answer.value === option && (
                    <div className="w-1 h-1 rounded-full bg-white"></div>
                  )}
                </div>
                <label className="cursor-pointer text-xs">{option}</label>
              </div>
            ))}
          </div>
        );

      case "DROPDOWN":
        const currentVals = Array.isArray(answer.value) ? answer.value : [];
        const toggleDropdownValue = (option: any, checked: boolean) => {
          const updatedVals = checked
            ? [...currentVals, option]
            : currentVals.filter((val: any) => val !== option);
          handleEditChange(updatedVals);
        };

        return (
          <div className="space-y-2">
            {question.options?.map((option: any) => (
              <div
                key={option}
                className={`flex items-center p-3 border rounded-lg cursor-pointer text-sm transition-all hover:shadow-sm ${currentVals.includes(option)
                    ? "border-[#19105B] bg-[#19105B]/10 shadow-sm"
                    : "border-gray-200 hover:border-[#19105B]/30 bg-white"
                  }`}
                onClick={() =>
                  toggleDropdownValue(option, !currentVals.includes(option))
                }
              >
                <div
                  className={`w-4 h-4 rounded-md border-2 mr-3 flex items-center justify-center transition-colors ${currentVals.includes(option)
                      ? "border-[#19105B] bg-[#19105B]"
                      : "border-gray-300 bg-white"
                    }`}
                >
                  {currentVals.includes(option) && (
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <label className="cursor-pointer text-sm font-medium text-gray-800">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = Math.min(
    100,
    Math.round(
      ((currentQuestionIndex + (isQAcomplete ? 1 : 0)) / questions.length) * 100
    )
  );
  const contextValue = useMemo(
    () => ({
      followUpMessages,
      isGenerating,
      setIsEditorPanelOpen,
    }),
    [followUpMessages, isGenerating]
  )
  return ( // messages={followUpMessages} isLoading={isGenerating} setIsEditorPanelOpen={setIsEditorPanelOpen}
    <AiProposalContext.Provider value={contextValue}>
      {proposalQuestionsLoading && <Loading size="full" text="Loading questions..." />}
      {!proposalQuestionsLoading && (
        <div className={`flex ${isConversationPanelOpen ? 'justify-center' : ''} mx-auto h-full bg-white`}>
          {/* LEFT PANEL */}
          <div
            className={`
              relative flex-shrink-0 transition-all duration-300
              ${isConversationPanelOpen ? "w-[50%]" : "w-[48px]"}
            `}
          >
            <button
              onClick={() => setIsConversationPanelOpen(p => {
                if (p){
                  if (!isEditorPanelOpen){
                    setIsEditorPanelOpen(true);
                  }if (!isSidebarCollapsed){
                    setIsSidebarCollapsed(true);
                  }
                }
                  
                return !p;
              })}
              disabled={!(isQAcomplete && followUpMessages.length > 0)}
              className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#F3F4F6]"
            >
              {isConversationPanelOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
            </button>

            <div
              className={`
                h-full overflow-y-auto transition-opacity duration-200
                ${isConversationPanelOpen
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
                }
              `}
            >
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-[#19105B] mb-1">
                  AI Proposal Generator
                </h1>
                <p className="text-gray-600 text-xs mb-3">
                  Create your perfect proposal
                </p>

                <div className="max-w-sm mx-auto">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-[#19105B] font-medium">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-[#19105B] h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.min(currentQuestionIndex + 1, questions.length)} of{" "}
                    {questions.length}
                  </div>
                </div>
              </div>

              <input
                type="text"
                value={user_prompt}
                onChange={(e) => set_user_prompt(e.target.value)}
                placeholder="Enter your prompt..."
                className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {convId && <SalesCallQAs isUploaded={isSalesQAs} convId={convId} onUpload={() => {
                setIsSalesQAs(true);
                localStorage.setItem(`isSalesQas----${convId}`, "true");
              }} />}
              <div className="space-y-6">

                {/* <div> */}

                <div className="space-y-3">
                  {answers.map((answer: any, index: number) => {
                    const question = questions.find(
                      (q) => q.id === answer.questionId
                    );
                    // const isCompleted = !answer.edit;

                    return (
                      <div key={answer.questionId} className="min-w-full">
                        <div className="mb-2">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-[#19105B] text-white flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p
                                className="text-xs leading-relaxed whitespace-pre-wrap font-medium"
                                style={{ color: "#19105B" }}
                              >
                                {question?.text}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Answer */}
                        <div className="ml-6">
                          {!answer.edit ? (
                            <div className="bg-gray-50 border-l-2 border-[#19105B] p-2 mb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="text-xs text-gray-600 mb-1">
                                    Answer
                                  </div>
                                  <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {getAnswerDisplay(answer)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setAnswers((prev) =>
                                      prev.map((ans) =>
                                        ans.questionId === answer.questionId
                                          ? { ...ans, edit: true }
                                          : ans
                                      )
                                    );
                                  }}
                                  className="ml-2 p-1 text-gray-400 hover:text-[#19105B]"
                                  title="Edit answer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="border border-[#19105B] p-2 mb-2">
                              <div className="text-xs text-[#19105B] mb-2 flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                Editing
                              </div>
                              {editAnswerInput(question)}
                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    if (!question) return;
                                    setAnswers((prev) =>
                                      prev.map((ans) =>
                                        ans.questionId === question.id
                                          ? { ...ans, edit: false }
                                          : ans
                                      )
                                    );
                                  }}
                                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                >
                                  Cancel
                                </button>

                                <button
                                  onClick={() => {
                                    if (!question) return;
                                    setAnswers((prev) =>
                                      prev.map((ans) => {
                                        if (ans.questionId === question.id) {
                                          const bkendUpdate = Array.isArray(
                                            ans.value
                                          )
                                            ? ans.value.join(", ")
                                            : ans.value;
                                          aiProposalApi.editAnswers({
                                            conversation_id: convId,
                                            to_edit: [
                                              {
                                                qid: question.id.toString(),
                                                content: bkendUpdate,
                                              },
                                            ],
                                          });
                                          return { ...ans, edit: false };
                                        }
                                        return ans;
                                      })
                                    );
                                  }}
                                  className="px-2 py-1 bg-[#19105B] text-white text-xs rounded hover:bg-[#19105B]/90"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {!isQAcomplete && !isCreatingConversation && (
                    <div ref={bottomRef}>
                      <div className="mb-2">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full bg-[#19105B] text-white flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                            {currentQuestionIndex + 1}
                          </div>
                          <div className="flex-1">
                            <p
                              className="text-xs leading-relaxed whitespace-pre-wrap font-medium"
                              style={{ color: "#19105B" }}
                            >
                              {currentQuestion.text}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Answer Input */}
                      <div className="ml-6">
                        <div className="border border-gray-200 p-2">
                          <div className="text-xs text-gray-600 mb-2">
                            Your Answer
                          </div>
                          {answerInput()}
                          <div
                            className={`mt-2 flex ${convId ? "justify-between" : "justify-end"}`}
                          >
                            {convId && (
                              <div className="mb-2 flex items-center justify-center">
                                <label
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 cursor-pointer border border-gray-300 rounded hover:border-gray-400 bg-white shadow-sm transition-colors"
                                  style={{ height: "30px" }} // reduced height
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileUpload}
                                  />
                                </label>
                              </div>
                            )}
                            <button
                              onClick={handleNext}
                              disabled={!isAnswerValid() || !storedQA}
                              className="px-2 py-1 bg-[#19105B] text-white text-xs rounded hover:bg-[#19105B]/90 flex items-center gap-1 disabled:opacity-50"
                              style={{ height: "30px" }} // reduced height
                            >
                              <span>
                                {currentQuestionIndex === questions.length - 1
                                  ? "Generate"
                                  : "Continue"}
                              </span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {isQAcomplete && (
                  <div className="mt-6 space-y-3">
                    {/* Success message */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#19105B]/10 text-[#19105B] rounded text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>All questions completed!</span>
                      </div>
                    </div>

                    {/* Proposal chat */}
                    <div className="border border-gray-200 rounded">
                      {isGenerating ?
                        <div className="p-3 bg-gray-50 border-l-2 border-[#19105B]">
                          <Loading size="sm" text="Generating..." />
                        </div> :
                        <div className="bg-[#19105B] px-3 py-2">
                          <h3 className="text-white font-medium text-xs flex items-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            Generated Proposal
                          </h3>
                        </div>}
                      <div className="p-3">
                        {/* <ProposalChat
                          messages={followUpMessages}
                          isLoading={isGenerating}
                        /> */}
                        <div className="mb-3">
                          <button
                            onClick={() => setIsEditorPanelOpen((prev) => {
                              if (!prev && !isSidebarCollapsed)
                                setIsSidebarCollapsed(true);
                              return !prev
                            })}
                            type="button"
                            disabled={isGenerating}
                            className="
                              flex items-center justify-center w-[70%]
                              px-6 py-2 rounded-lg
                              transition-colors duration-200 shadow-sm border
                              text-xs font-semibold
                              bg-[#F3F4F6] text-[#19105B] border-[#F3F4F6]
                              hover:bg-[#e5e7eb]

                              disabled:opacity-50
                              disabled:cursor-not-allowed
                              disabled:hover:bg-[#F3F4F6]
                            "
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            View and Edit proposal
                            <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-200" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Follow up conversation */}
                {followUpMessages[0] && (
                  <div className="mt-4">
                    <div className="border border-gray-200 rounded p-3">
                      <div className="text-xs font-medium text-gray-800 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-[#19105B]" />
                        Refine Your Proposal
                      </div>
                      <div className="relative">
                        <Textarea
                          value={currentUserPrompt}
                          onChange={(e) => setCurrentUserPrompt(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleFollowUpSend();
                            }
                          }}
                          placeholder="Ask follow-up questions to refine your proposal..."
                          className="w-full min-h-[120px] max-h-[120px] resize-none px-2 pt-2 pb-8 border border-gray-300 rounded bg-gray-50 text-xs focus:outline-none focus:border-[#19105B]"
                          disabled={isGenerating}
                        />

                        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                          {convId && (
                            <div className="mb-2 flex items-center justify-center">
                              <label
                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 cursor-pointer border border-gray-300 rounded hover:border-gray-400 bg-white shadow-sm transition-colors"
                                style={{ height: "30px" }} // reduced height
                              >
                                <Upload className="w-3 h-3" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={handleFileUpload}
                                />
                              </label>
                            </div>
                          )}

                          <button
                            type="button"
                            className="flex items-center gap-1 px-2 py-1 bg-[#19105B] text-white rounded text-xs hover:bg-[#19105B]/90 disabled:opacity-50"
                            onClick={handleFollowUpSend}
                            disabled={isGenerating || !currentUserPrompt.trim()}
                          >
                            <Send className="w-3 h-3" />
                            <span>Send</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* </div> */}
              </div>
            </div>
          </div>
          <div
            className={`
              transition-all duration-300 ease-in-out
              overflow-y-auto
              border-l border-gray-200
              ${isEditorPanelOpen
                ? "flex-1 opacity-100 translate-x-0"
                : "flex-[0] opacity-0 translate-x-4 pointer-events-none"
              }
            `}
          >
            <ProposalChat />
          </div>
        </div>
      )}
    </AiProposalContext.Provider>
  );
};

export const useAiProposalContext = () => {
  const context = useContext(AiProposalContext);
  if (!context) {
    throw new Error('AiProposalContext must be used within a AiProposalProvider');
  }
  return context;
}

export default AiProposal;