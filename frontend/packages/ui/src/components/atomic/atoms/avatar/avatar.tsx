import {
  Avatar as ShadcnAvatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AtomicAvatarBaseProps {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  onClick?: () => void
  status?: "online" | "offline" | "away" | "busy"
}

interface AtomicAvatarGroupProps {
  group: true
  avatars: AtomicAvatarBaseProps[]
  maxVisible?: number
  overlap?: boolean
}

type AtomicAvatarProps = AtomicAvatarBaseProps | AtomicAvatarGroupProps

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
}

export function AtomicAvatar(props: AtomicAvatarProps) {
  if ("group" in props && props.group) {
    const {
      avatars,
      maxVisible = avatars.length,
      overlap = true,
    } = props

    const visibleAvatars = avatars.slice(0, maxVisible)
    const hiddenCount = avatars.length - maxVisible
    const size = avatars[0]?.size || "md"

    return (
      <div className="flex items-center">
        {visibleAvatars.map((avatar, index) => (
          <div
            key={index}
            className={cn(
              overlap ? "-ml-2 first:ml-0" : "ml-2",
              "border-2 border-background rounded-full"
            )}
          >
            <AtomicAvatar {...avatar} />
          </div>
        ))}
        {hiddenCount > 0 && (
          <div
            className={cn(
              overlap ? "-ml-2" : "ml-2",
              "flex items-center justify-center rounded-full bg-muted text-xs text-muted-foreground font-medium border-2 border-background",
              sizes[size]
            )}
          >
            +{hiddenCount}
          </div>
        )}
      </div>
    )
  }

  // Single avatar render
  const {
    src,
    alt,
    fallback,
    size = "md",
    className,
    onClick,
    status,
  } = props as AtomicAvatarBaseProps

  return (
    <div className="relative inline-block">
      <ShadcnAvatar
        className={cn(sizes[size], onClick && "cursor-pointer hover:opacity-80", className)}
        onClick={onClick}
      >
        <AvatarImage src={src || "/placeholder.svg"} alt={alt} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </ShadcnAvatar>
      {status && (
        <div
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            statusColors[status],
          )}
        />
      )}
    </div>
  )
}
