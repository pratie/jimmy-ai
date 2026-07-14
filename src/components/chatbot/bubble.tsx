import React, { useState } from 'react'
import { cn, extractUUIDFromString } from '@/lib/utils'
import { getKieImageUrl } from '@/lib/kie-api'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { User } from 'lucide-react'
import Image from 'next/image'

type Props = {
  message: {
    role: 'assistant' | 'user'
    content: string
    link?: string
  }
  createdAt?: Date
  botIcon?: string | null
  theme?: {
    userBg?: string
    userText?: string
    botBg?: string
    botText?: string
  }
}

const Bubble = ({ message, createdAt, botIcon, theme }: Props) => {
  const image = extractUUIDFromString(message.content)
  const [imageError, setImageError] = useState(false)
  const [botAvatarError, setBotAvatarError] = useState(false)
  //

  return (
    <div
      className={cn(
        'flex gap-2.5 items-end',
        message.role == 'assistant' ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      {message.role == 'assistant' ? (
        <Avatar className="w-6 h-6 mb-1 ring-1 ring-slate-100">
          {botIcon && !botAvatarError ? (
            <AvatarImage
              src={getKieImageUrl(botIcon)}
              alt="Bot"
              onError={() => setBotAvatarError(true)}
            />
          ) : (
            <AvatarFallback className="bg-slate-900 text-white font-bold text-[9px]">
              AI
            </AvatarFallback>
          )}
        </Avatar>
      ) : (
        <Avatar className="w-6 h-6 mb-1">
          <AvatarFallback className="bg-slate-200 text-slate-500">
            <User className="w-3.5 h-3.5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'flex min-w-[72px] max-w-[300px] flex-col gap-1 rounded-2xl px-3.5 py-2.5 shadow-sm',
          message.role == 'assistant' ? 'rounded-bl-none bg-slate-100 text-slate-900' : 'rounded-br-none bg-slate-900 text-white'
        )}
        style={{
          backgroundColor:
            message.role === 'assistant'
              ? theme?.botBg || '#f1f5f9'
              : theme?.userBg || '#0f172a',
          color:
            message.role === 'assistant'
              ? theme?.botText || '#0f172a'
              : theme?.userText || '#ffffff',
        }}
      >
        {image && !imageError ? (
          <div className="relative aspect-square rounded-lg overflow-hidden my-1">
            <Image
              src={getKieImageUrl(image[0])}
              fill
              alt="image"
              className="object-cover"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          </div>
        ) : image && imageError ? (
          <div className="relative aspect-square bg-slate-100 flex items-center justify-center rounded-lg border border-slate-200">
            <p className="text-xs text-slate-400">Image failed to load</p>
          </div>
        ) : (
          <div className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
            <span>{message.content.replace('(complete)', ' ')}</span>
            {message.link && (
              <a
                className={cn('underline font-semibold pl-1 inline-block hover:opacity-80 transition-opacity')}
                href={message.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bubble
