import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';

const tourSteps = [
  { title: 'Welcome to Jlens', content: 'Let me show you around the platform.', target: null },
  { title: 'Model Selector', content: 'Choose your AI model here.', target: '[data-tour="model-selector"]' },
  { title: 'Workspaces', content: 'All your workspaces are listed here on the left sidebar.', target: '#desktop-sidebar [data-tour="workspace-list"]' },
  { title: 'JLens Workspace', content: 'This is your default workspace for general AI conversations and document analysis.', target: '#desktop-sidebar [data-tour="workspace-jlens"]' },
  { title: 'View Files', content: 'Click here to view and manage all files uploaded to this workspace.', target: '#desktop-sidebar [data-tour="view-files-button"]' },
  { title: 'Jman Sales', content: 'Access sales data and insights from the Jman Sales workspace.', target: '#desktop-sidebar [data-tour="workspace-jman-sales"]' },
  { title: 'AI Proposal', content: 'Create project proposals using AI assistance in this workspace.', target: '#desktop-sidebar [data-tour="workspace-ai-proposal"]' },
  { title: 'Settings', content: 'Manage user access, permissions, and view user analytics.', target: '#desktop-sidebar [data-tour="settings"]' },
  { title: 'Feedback', content: 'Click here to provide feedback and look into the documentation', target: '#desktop-sidebar [data-tour="feedback"]' }
];

type TooltipPosition = {
  top: string;
  left?: string;
  right?: string;
  transform: string;
  arrowPosition: 'left' | 'right' | 'top' | 'bottom';
};

export default function AppTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const location = useLocation();
  // Safely get user context, default to false if not available
  let isNewUser = false;
  try {
    const userContext = useUserContext();
    isNewUser = userContext?.isNewUser || false;
  } catch (error) {
    // UserContext not available, use default
    isNewUser = false;
  }

  useEffect(() => {
    (window as any).startAppTour = () => { setCurrentStep(0); setIsOpen(true); };

    let timer: ReturnType<typeof setTimeout>;

    if (location.pathname === '/app/chat') {
      if (isNewUser || !localStorage.getItem("jlens-tour-completed")) {
        timer = setTimeout(() => setIsOpen(true), 3000);
      }
    } else {
      setIsOpen(false);
    }

    return () => {
      delete (window as any).startAppTour;
      clearTimeout(timer);
    };
  }, [location.pathname, isNewUser]);

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const targetEl = step.target ? document.querySelector(step.target) : null;
  const rect = targetEl?.getBoundingClientRect();

  // Calculate tooltip position with smart positioning to stay within screen bounds
  const getTooltipPosition = (): TooltipPosition => {
    if (!rect) return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      arrowPosition: 'left'
    };

    const padding = 20;
    const arrowSize = 12;
    const tooltipWidth = 384; // max-w-md
    const tooltipHeight = 250; // approximate height

    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceBottom = window.innerHeight - rect.bottom;

    // Priority: right > left > bottom > top

    // Try right side
    if (spaceRight > tooltipWidth + padding + arrowSize) {
      const top = Math.max(padding, Math.min(
        rect.top + rect.height / 2 - tooltipHeight / 2,
        window.innerHeight - tooltipHeight - padding
      ));
      return {
        top: `${top}px`,
        left: `${rect.right + arrowSize + padding}px`,
        transform: 'none',
        arrowPosition: 'left'
      };
    }

    // Try left side
    if (spaceLeft > tooltipWidth + padding + arrowSize) {
      const top = Math.max(padding, Math.min(
        rect.top + rect.height / 2 - tooltipHeight / 2,
        window.innerHeight - tooltipHeight - padding
      ));
      return {
        top: `${top}px`,
        right: `${window.innerWidth - rect.left + arrowSize + padding}px`,
        transform: 'none',
        arrowPosition: 'right'
      };
    }

    // Try bottom
    if (spaceBottom > tooltipHeight + padding + arrowSize) {
      const left = Math.max(padding, Math.min(
        rect.left + rect.width / 2 - tooltipWidth / 2,
        window.innerWidth - tooltipWidth - padding
      ));
      return {
        top: `${rect.bottom + arrowSize + padding}px`,
        left: `${left}px`,
        transform: 'none',
        arrowPosition: 'top'
      };
    }

    // Default to top
    const left = Math.max(padding, Math.min(
      rect.left + rect.width / 2 - tooltipWidth / 2,
      window.innerWidth - tooltipWidth - padding
    ));
    return {
      top: `${Math.max(padding, rect.top - tooltipHeight - arrowSize - padding)}px`,
      left: `${left}px`,
      transform: 'none',
      arrowPosition: 'bottom'
    };
  };

  const tooltipPosition = getTooltipPosition();

  // Arrow styles based on position
  const getArrowStyles = () => {
    const baseArrow = "absolute w-0 h-0 border-solid";
    switch (tooltipPosition.arrowPosition) {
      case 'left':
        return `${baseArrow} -left-3 top-1/2 -translate-y-1/2 border-y-[12px] border-y-transparent border-r-[12px] border-r-white dark:border-r-gray-900`;
      case 'right':
        return `${baseArrow} -right-3 top-1/2 -translate-y-1/2 border-y-[12px] border-y-transparent border-l-[12px] border-l-white dark:border-l-gray-900`;
      case 'top':
        return `${baseArrow} -top-3 left-1/2 -translate-x-1/2 border-x-[12px] border-x-transparent border-b-[12px] border-b-white dark:border-b-gray-900`;
      case 'bottom':
        return `${baseArrow} -bottom-3 left-1/2 -translate-x-1/2 border-x-[12px] border-x-transparent border-t-[12px] border-t-white dark:border-t-gray-900`;
    }
  };

  return (
    <>
      {/* Dimmed overlay with cutout for highlighted element */}
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <mask id="tour-spotlight">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - 4}
                  y={rect.top - 4}
                  width={rect.width + 8}
                  height={rect.height + 8}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#tour-spotlight)"
            className="pointer-events-auto cursor-pointer"
            onClick={() => { setIsOpen(false); localStorage.setItem('jlens-tour-completed', 'true'); }}
          />
        </svg>
      </div>

      {/* Tooltip positioned smartly around the element */}
      <div
        className="fixed z-[9999] w-[90%] max-w-md transition-all duration-300"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          right: tooltipPosition.right,
          transform: tooltipPosition.transform
        }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 border dark:border-gray-700 relative">
          {/* Arrow pointing to the element */}
          <div className={getArrowStyles()} />

          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-bold text-[#41368F] dark:text-white">{step.title}</h3>
            <button onClick={() => { setIsOpen(false); localStorage.setItem('jlens-tour-completed', 'true'); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{step.content}</p>
          <div className="flex justify-center gap-2 mb-6">
            {tourSteps.map((_, i) => <div key={i} className={`h-2 rounded-full transition-all ${i === currentStep ? 'w-8 bg-[#41368F]' : 'w-2 bg-gray-300 dark:bg-gray-600'}`} />)}
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">{currentStep + 1}/{tourSteps.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-sm flex items-center gap-1"><ChevronLeft size={16} />Back</button>
              <button onClick={() => currentStep < tourSteps.length - 1 ? setCurrentStep(currentStep + 1) : (setIsOpen(false), localStorage.setItem('jlens-tour-completed', 'true'))} className="px-4 py-2 rounded-lg bg-[#41368F] text-white hover:bg-[#19105B] text-sm flex items-center gap-1">{currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}{currentStep < tourSteps.length - 1 && <ChevronRight size={16} />}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
