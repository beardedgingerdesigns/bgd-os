import { User, Bot, Loader2, AlertCircle } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'
import { ChatMessageDropButton } from '@/components/chat-message-drop-button'

interface ChatMessageProps {
  message: ChatMessage
  clientSlug?: string
  projectSlug?: string
  /** Content of the prior user turn — required to render the Drop button. */
  priorUserTurn?: string
}

export function ChatMessageView({
  message,
  clientSlug,
  projectSlug,
  priorUserTurn,
}: ChatMessageProps) {
  const isUser = message.role === 'user'
  const Icon = isUser ? User : Bot

  // Show the Drop button only on completed assistant messages when all context
  // props are present.
  const showDropButton =
    !isUser &&
    message.status === 'done' &&
    typeof clientSlug === 'string' &&
    typeof projectSlug === 'string' &&
    typeof priorUserTurn === 'string'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`shrink-0 rounded-full p-2 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words ${
            isUser ? 'bg-primary/10' : 'bg-muted/40'
          }`}
        >
          {message.content}
          {message.status === 'streaming' && (
            <span className="inline-flex items-center ml-2 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
            </span>
          )}
        </div>
        {message.status === 'error' && message.error && (
          <div className="mt-1 flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" /> {message.error}
          </div>
        )}
        {showDropButton && (
          <ChatMessageDropButton
            clientSlug={clientSlug!}
            projectSlug={projectSlug!}
            userTurn={priorUserTurn!}
            assistantTurn={message.content}
          />
        )}
      </div>
    </div>
  )
}
