import { Lightbulb, FileText, BarChart3, Cable } from "lucide-react";
import { Text, TextType } from "@ui/components/atomic/atoms/text/text";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { useConversationContext } from "../../context/ConversationContext"
import { useWorkspaceContext } from "../../context/WorkspaceContext"

interface Feature {
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
}

interface FeaturesSectionProps {
  onViewChange: (view: "chat" | "ai-proposal" | "self-analytics") => void;
  isCollapsed?: boolean;
}

const allFeatures: Feature[] = [
  {
    name: "Chat",
    slug: "chat",
    icon: Lightbulb,
    color: "bg-[#41368F] text-white",
  },
  {
    name: "AI Proposal",
    slug: "ai-proposal",
    icon: FileText,
    color: "bg-[#41368F] text-white",
  },
  {
    name: "Self Analytics",
    slug: "self-analytics",
    icon: BarChart3,
    color: "bg-[#41368F] text-white",
  },
  {
    name: "JIN MCP",
    slug: "JIN MCP", // 👈 new slug
    icon: Cable,    // you can pick another lucide-react icon
    color: "bg-[#41368F] text-white",
  },
];

export function FeaturesSection({ isCollapsed = false }: FeaturesSectionProps) {
  const navigate = useNavigate();
  const { access } = useUserContext();

  const allowedSlugs = access?.features ?? [];
  const { setSelectedConversation } = useConversationContext()
  const { setSelectedWorkspace } = useWorkspaceContext()

  const featuresToShow = allFeatures.filter(
  (f) => f.slug === "JIN MCP" || allowedSlugs.includes(f.slug)
  );
  

const handleFeatureClick = (slug: string) => {
  setSelectedConversation(null)
  setSelectedWorkspace(null)

  if (slug === "JIN MCP") {
    // Redirect to Microsoft Form
    window.location.href = "https://forms.office.com/Pages/ResponsePage.aspx?id=oMAAKOlwvkmHM_rqpqztmY8zhb5BhwtAiEvu3YLuHHpUM0szQkdVNzVBMUxYOFFMMUJWVERHSEhBUC4u"
  } else {
    // Navigate to your app routes
    navigate(`/app/${slug}`)
  }
}


  return (
    <div
      className="
        p-1 sm:p-2 md:p-3 
        border-b border-gray-100 dark:border-gray-700 
        flex-shrink-0
        min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px]
      "
    >
      {!isCollapsed && (
        <Text
          type={TextType.paragraph}
          text="Features"
          className="text-sm font-semibold text-gray-700 dark:text-gray-300"
        />
      )}
      <div className="space-y-0.5 sm:space-y-1">
        {featuresToShow.map((feature) => (
          <div
            key={feature.slug}
            className={`
              flex items-center rounded-md transition-all duration-500 ease-in-out
              hover:bg-gray-100 hover:shadow border border-transparent hover:border-gray-100 
              dark:hover:bg-gray-700 cursor-pointer font-medium
              ${isCollapsed ? "w-6 sm:w-8 justify-center" : "w-full"}
              h-6 sm:h-7 md:h-8 px-0.5 sm:px-1
            `}
            onClick={() => handleFeatureClick(feature.slug || "")}
            title={feature.name}
          >
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
              <feature.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            </div>
            <div
              className={`
                overflow-hidden transition-all duration-500 ease-in-out
                            ${isCollapsed ? "w-0 ml-0 transform translate-x-[-100%] opacity-0" : "w-auto ml-1 sm:ml-2 transform translate-x-0 opacity-100"}

              `}
            >
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {feature.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
