import React, { useState } from 'react'
import { cn, extractUUIDFromString, getMonthName } from '@/lib/utils'
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
  let d = new Date()
  const image = extractUUIDFromString(message.content)
  const [imageError, setImageError] = useState(false)
  const [botAvatarError, setBotAvatarError] = useState(false)
  //

  return (
    <div
      className={cn(
        'flex gap-2 items-end',
        message.role == 'assistant' ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      {message.role == 'assistant' ? (
        <Avatar className="w-5 h-5">
          {botIcon && !botAvatarError ? (
            <AvatarImage
              src={getKieImageUrl(botIcon)}
              alt="Bot"
              onError={() => setBotAvatarError(true)}
            />
          ) : (
            <AvatarFallback className="bg-blue-500 text-white font-bold text-[8px]">
              AI
            </AvatarFallback>
          )}
        </Avatar>
      ) : (
        <Avatar className="w-5 h-5">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'flex flex-col gap-1.5 min-w-[100px] max-w-[320px] p-3 rounded-lg',
          message.role == 'assistant' ? 'rounded-bl-none' : 'rounded-br-none'
        )}
        style={{
          backgroundColor:
            message.role === 'assistant'
              ? theme?.botBg || '#f3f4f6'
              : theme?.userBg || '#2563eb',
          color:
            message.role === 'assistant'
              ? theme?.botText || '#111827'
              : theme?.userText || '#ffffff',
        }}
      >
        {createdAt ? (
          <div
            className={cn(
              'flex gap-2 text-[11px]',
              message.role == 'assistant' ? 'text-gray-500' : 'text-blue-100'
            )}
          >
            <p>
              {createdAt.getDate()} {getMonthName(createdAt.getMonth())}
            </p>
            <p>
              {createdAt.getHours()}:{createdAt.getMinutes()}
              {createdAt.getHours() > 12 ? 'PM' : 'AM'}
            </p>
          </div>
        ) : (
          <p
            className={cn(
              'text-[11px]',
              message.role == 'assistant' ? 'text-gray-500' : 'text-blue-100'
            )}
          >
            {`${d.getHours()}:${d.getMinutes()} ${
              d.getHours() > 12 ? 'pm' : 'am'
            }`}
          </p>
        )}
        {image && !imageError ? (
          <div className="relative aspect-square">
            <Image
              src={getKieImageUrl(image[0])}
              fill
              alt="image"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          </div>
        ) : image && imageError ? (
          <div className="relative aspect-square bg-brand-base-200 flex items-center justify-center rounded">
            <p className="text-xs text-brand-primary/60">Image failed to load</p>
          </div>
        ) : (
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content.replace('(complete)', ' ')}
            {message.link && (
              <a
                className={cn('underline font-semibold pl-2 inline-block')}
                href={message.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Your Link
              </a>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

export default Bubble
