import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'

export function MarkdownText({ children, className, ...props }: Omit<ComponentProps<typeof ReactMarkdown>, 'children' | 'remarkPlugins'> & { children: string; className?: string }) {
  return (
    <div className={cn('space-y-3 break-words text-sm leading-6 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_li]:ml-5 [&_ol]:list-decimal [&_pre]:overflow-x-auto [&_pre]:rounded-control [&_pre]:bg-muted [&_pre]:p-3 [&_ul]:list-disc', className)}>
      <ReactMarkdown
        {...props}
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ node, ...linkProps }) => {
            void node
            return <a {...linkProps} rel="noopener noreferrer" />
          },
          ...props.components,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
