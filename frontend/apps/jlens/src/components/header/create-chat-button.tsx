
import { AtomicButton } from "@ui/components/atomic/atoms/button/button"
import { MessageSquarePlus } from "lucide-react"

interface CreateChatButtonProps {
  onClick?: () => void
}

export function CreateChatButton({ onClick }: CreateChatButtonProps) {
  return (
    <div className="group relative overflow-hidden">
      <AtomicButton
        onClick={onClick}
        variant="outline"
        size="sm"
        text="Create Chat"
        icon={
          <MessageSquarePlus className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ml-1 sm:ml-2 transition-all group-hover:ml-0 group-hover:text-white text-[#41368F] dark:text-white" />
        }
        iconPosition="left"
        iconWrapperClass="bg-transparent p-0 border-none"
        textWrapperClass="ml-0.5 sm:ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden text-[#41368F] group-hover:text-white dark:text-white dark:group-hover:text-gray-900 text-xs sm:text-sm"
        className="text-[#41368F] hover:bg-[#41368F] gap-0 hover:text-white dark:border-white dark:text-white dark:hover:bg-[#41368F] dark:hover:text-gray-900 rounded-md bg-transparent h-7 sm:h-8 transition-all duration-200 group-hover:w-auto w-7 sm:w-8 p-0 group-hover:pl-1 group-hover:pr-2 sm:group-hover:pl-2 sm:group-hover:pr-3 focus:border-[#41368F] focus:ring-[#41368F]"
      />
    </div>
  )
}
