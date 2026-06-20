interface LoadingProps {
  size?: "sm" | "md" | "lg" | "full"
  text?: string
}

export function Loading({ size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    full: "text-5xl"
  }

  const containerClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    full: "gap-10"
  }

  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
    full: "text-2xl"
  }

  if (size === "full") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center z-50 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-indigo-300/20 rounded-full blur-2xl animate-ping"></div>
        </div>

        <div className={`flex flex-col items-center ${containerClasses[size]} relative z-10`}>
          {/* Main JLENS text with gradient and effects */}
          <div className="relative">
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-[#19105B] rounded-full -translate-x-1/2"></div>
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-500 rounded-full -translate-x-1/2"></div>
              <div className="absolute left-0 top-1/2 w-2 h-2 bg-blue-500 rounded-full -translate-y-1/2"></div>
              <div className="absolute right-0 top-1/2 w-2 h-2 bg-indigo-500 rounded-full -translate-y-1/2"></div>
            </div>

            {/* Glowing rings */}
            <div className="absolute inset-0 -m-8">
              <div className="w-full h-full border-2 border-[#19105B]/20 rounded-full animate-ping"></div>
            </div>
            <div className="absolute inset-0 -m-12">
              <div className="w-full h-full border border-purple-500/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>

            {/* Main JLENS logo */}
            <div className="relative z-10 flex items-center justify-center">
              <img src="/jlens.svg" alt="JLENS" className={size === 'sm' ? 'h-8 w-auto' : size === 'md' ? 'h-12 w-auto' : 'h-16 w-auto'} />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#19105B]/30 via-purple-500/30 to-blue-500/30 blur-2xl animate-pulse -z-10"></div>
          </div>

          {/* Loading text with typing effect */}
          {text && (
            <div className="flex items-center gap-2">
              <p className={`${textClasses[size]} font-medium text-[#19105B]`}>
                {text}
              </p>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#19105B] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center ${containerClasses[size]}`}>
      <div className="relative">
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#19105B] rounded-full -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-500 rounded-full -translate-x-1/2"></div>
        </div>
        <img src="/jlens.svg" alt="JLENS" className={size === 'sm' ? 'h-6 w-auto' : size === 'md' ? 'h-8 w-auto' : 'h-12 w-auto'} />
      </div>
      {text && (
        <p className={`${textClasses[size]} font-medium text-gray-700 dark:text-gray-300`}>
          {text}
        </p>
      )}
    </div>
  )
}
