import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { getKieImageUrl } from '@/lib/kie-api'

type RespondingProps = {
  botIcon?: string | null
  theme?: {
    botBg?: string
    botText?: string
  }
}

export const Responding = ({ botIcon, theme }: RespondingProps) => {
  const [avatarError, setAvatarError] = useState(false)
  const dotColor = theme?.botText || '#0f172a'

  return (
    <div className="self-start flex items-end gap-2.5">
      <Avatar className="w-6 h-6 mb-1 ring-1 ring-black/5">
        {botIcon && !avatarError ? (
          <AvatarImage
            src={getKieImageUrl(botIcon)}
            alt="Bot Avatar"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <AvatarFallback className="bg-slate-900 text-white font-bold text-[9px]">
            AI
          </AvatarFallback>
        )}
      </Avatar>
      <div
        className="rounded-2xl rounded-bl-none px-3.5 py-3 shadow-sm"
        style={{ backgroundColor: theme?.botBg || '#f1f5f9' }}
      >
        <div className="typing">
          <div className="dot" style={{ backgroundColor: dotColor, opacity: 0.55 }}></div>
          <div className="dot" style={{ backgroundColor: dotColor, opacity: 0.55 }}></div>
          <div className="dot" style={{ backgroundColor: dotColor, opacity: 0.55 }}></div>
        </div>
      </div>
    </div>
  )
}
