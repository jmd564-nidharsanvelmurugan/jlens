import { Avatar, AvatarFallback, AvatarImage } from "@ui/components/ui/avatar"
import { Settings, LogOut, HelpCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useUserContext } from "../../context/UserContext"
import { toast } from "sonner"
import { useState } from "react"
import FeedbackModal from "../feedback/FeedbackModal"
interface ProfileSectionProps {
  profileName?: string
  isCollapsed?: boolean
}

export function ProfileSection({ isCollapsed = false }: ProfileSectionProps) {
  const navigate = useNavigate()
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const handleLogout = () => {
    sessionStorage.clear()
    toast.info("Logged out successfully")
    navigate("/login")
  }

  const handleSettings = () => {
    navigate("/app/settings")
  }

  const handleTour = () => {
    if ((window as any).startAppTour) {
      (window as any).startAppTour();
    }
  }

  const handleDocumentation = () => {
    navigate("/app/documentation")
  }

  const handleAbout = () => {
    navigate("/app/about")
  }

  const handleFeedback = () => {
    setShowFeedbackModal(true)
  }

  const handleSubmitFeedback = async (rating: number, comment: string) => {
    setIsSubmittingFeedback(true);
    try {
      const email = sessionStorage.getItem('email');
      if (!email) {
        toast.error('Please log in to submit feedback');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        toast.success('Thank you for your feedback!');
        setShowFeedbackModal(false);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const { user, access } = useUserContext()
  
  const isAdmin = user?.role === 'admin'

  // Generate initials from first and last name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="relative group">
          <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-[#19105B]/20 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-[#19105B] to-[#2D1B69] text-white text-xs font-bold">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          
          {/* Tooltip with user info */}
          <div className="
            absolute left-full ml-2 bottom-0
            bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded-md
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            pointer-events-none whitespace-nowrap z-50 min-w-max
          ">
            {user?.name || "User"}
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-700" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-200/20 dark:border-gray-700/20">
        <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-white dark:ring-gray-700">
          <AvatarFallback className="bg-gradient-to-br from-[#19105B] to-[#2D1B69] text-white text-xs font-bold">
            {user?.name ? getInitials(user.name) : "U"}
          </AvatarFallback>
        </Avatar>
        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 min-w-0">
          {user?.name}
        </p>
        <div className="relative group">
          <button
            className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-all flex-shrink-0"
            title="Help"
            data-tour="feedback"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 hover:text-blue-600" />
          </button>
          <div className="absolute bottom-full right-0 mb-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <button
              onClick={handleTour}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
            >
              Tour Guide
            </button>
            <>
              
            </>
            <button
              onClick={handleDocumentation}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              
              Documentation
            </button>
            <button
              onClick={handleFeedback}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Give Feedback
            </button>
            <button
              onClick={handleAbout}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
            >
              About JLens v4
            </button>

            
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={handleSettings}
            className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-all flex-shrink-0"
            title="Settings"
            data-tour="settings"
          >
            <Settings className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 hover:text-[#19105B]" />
          </button>
        )}
        <button
          onClick={handleLogout}
          className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded transition-all flex-shrink-0"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 hover:text-red-600" />
        </button>
      </div>
      
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmittingFeedback}
      />
    </div>
  )
}
