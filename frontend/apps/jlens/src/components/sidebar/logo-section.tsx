
import { PanelLeftClose, PanelLeft } from "lucide-react";

interface LogoSectionProps {
  isCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function LogoSection({ isCollapsed = false, onToggleSidebar }: LogoSectionProps) {
  const handleLogoClick = () => {
    window.location.href = 'https://jlens.jmangroup.tech/app/chat';
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center justify-center py-3 space-y-2">
        <button 
          onClick={handleLogoClick} 
          className="hover:opacity-80 transition-opacity cursor-pointer z-10 relative"
          type="button"
        >
          <img src="/favicon.svg" alt="JLens" className="w-8 h-8 pointer-events-none" />
        </button>
        <button
          onClick={onToggleSidebar}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          type="button"
        >
          <PanelLeft className="w-3 h-3 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center justify-center flex-1">
        <button 
          onClick={handleLogoClick} 
          className="hover:opacity-80 transition-opacity cursor-pointer z-10 relative"
          type="button"
        >
          <img src="/jlens.svg" alt="JLENS" className="h-20 w-auto pointer-events-none" />
        </button>
      </div>
      <button
        onClick={onToggleSidebar}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex-shrink-0"
        type="button"
      >
        <PanelLeftClose className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  )
}
