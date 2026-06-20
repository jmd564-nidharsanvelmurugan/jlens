import type React from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cva } from "class-variance-authority";

interface AtomicButtonProps
  extends Omit<React.ComponentProps<typeof ShadcnButton>, "children">,
    VariantProps<typeof buttonVariants> {
  text?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  iconWrapperClass?: string;
  textWrapperClass?: string;
}

// Styling for icon wrapper based on variant
const iconVariants = cva("p-1 rounded-md flex items-center justify-center", {
  variants: {
    variant: {
      default: "bg-primary text-white",
      destructive: "bg-red-100 text-red-700",
      secondary: "bg-gray-100 text-gray-800",
      ghost: "bg-gray-100 text-gray-600",
      outline: "bg-white text-black border",
      link: "text-blue-700 underline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// Styling for text wrapper based on variant
const textVariants = cva("rounded-md px-2 py-1", {
  variants: {
    variant: {
      default: "bg-white",
      destructive: "bg-red-100 text-red-800",
      secondary: "bg-gray-100 text-gray-800",
      ghost: "text-gray-700",
      outline: "text-black",
      link: "text-blue-700 underline",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function AtomicButton({
  text,
  icon,
  iconPosition = "left",
  loading = false,
  loadingText = "Loading...",
  fullWidth = false,
  iconWrapperClass,
  textWrapperClass,
  className,
  disabled,
  variant = "default",
  size = "default",
  ...props
}: AtomicButtonProps) {
  const isDisabled = disabled || loading;

  const showIcon = !!icon;
  const showText = !!text;
  const shouldShowGap = showIcon && showText;

  const renderIcon = (iconNode: React.ReactNode) => (
    <span className={cn(iconVariants({ variant }), iconWrapperClass)}>
      {iconNode}
    </span>
  );

  const renderText = (txt: string) => (
    <span className={cn(textVariants({ variant }), textWrapperClass)}>
      {txt}
    </span>
  );

  return (
    <ShadcnButton
      className={cn(
        "flex items-center justify-center gap-2 group",
        fullWidth && "w-full",
        className
      )}
      disabled={isDisabled}
      variant={variant}
      size={size}
      {...props}
    >
      {loading ? (
        <>
          {renderIcon(<Loader2 className="h-4 w-4 animate-spin" />)}
          {renderText(loadingText)}
        </>
      ) : (
        <>
          {showIcon && iconPosition === "left" && renderIcon(icon)}
          {showText && renderText(text!)}
          {showIcon && iconPosition === "right" && renderIcon(icon)}
        </>
      )}
    </ShadcnButton>
  );
}
