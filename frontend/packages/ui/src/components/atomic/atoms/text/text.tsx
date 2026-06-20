
export const TextType = {
  default: 'paragraph',
  header: 'header',
  title: 'title',
  subtitle: 'subtitle',
  paragraph: 'paragraph',
  disable: 'disable',
  error: 'error',
  link: 'link',
} as const;

export type TextType = typeof TextType[keyof typeof TextType];

export interface TextProps {
  id?: string
  className?: string
  text?: string
  type?: TextType
  align?: 'left' | 'center' | 'right'
  themeColor?: boolean
  onClick?: () => void
}

// Tailwind styles mapped by text type
const typeStyles: Record<TextType, string> = {
  [TextType.header]: 'text-3xl font-bold text-gray-900',
  [TextType.title]: 'text-2xl font-semibold text-gray-800',
  [TextType.subtitle]: 'text-xl font-medium text-gray-700',
  [TextType.paragraph]: 'text-base text-gray-600',
  [TextType.disable]: 'text-base text-gray-400 cursor-not-allowed',
  [TextType.error]: 'text-base text-red-600',
  [TextType.link]: 'text-base text-blue-600 underline cursor-pointer',
}

// Tailwind styles mapped by alignment
const alignStyles: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export const Text: React.FC<TextProps> = ({
  id = '',
  className = '',
  text = '',
  type = TextType.default,
  align = 'left',
  themeColor = false,
  onClick,
}) => {
  const finalClass = [
    typeStyles[type],
    alignStyles[align],
    themeColor ? 'text-primary-500' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div id={id} className={finalClass} onClick={onClick}>
      {text}
    </div>
  )
}


