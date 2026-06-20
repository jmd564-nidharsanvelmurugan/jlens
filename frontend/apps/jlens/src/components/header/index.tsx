import { ModelSelector } from "./model-selector";

interface HeaderProps {
  selectedChat: string;
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isCollapsed, onToggleSidebar }: HeaderProps) {
  return (
    <div className="p-2 sm:p-3 bg-transparent w-full flex-shrink-0 sticky top-0 z-50 relative">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <ModelSelector />
        </div>
      </div>
    </div>
  );
}
