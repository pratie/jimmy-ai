import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { getKieImageUrl } from '@/lib/kie-api'

type RespondingProps = {
  botIcon?: string | null
}

export const Responding = ({ botIcon }: RespondingProps) => {
  const [avatarError, setAvatarError] = useState(false)

  return (
    <div className="self-start flex items-end gap-3">
      <Avatar className="w-5 h-5">
        {botIcon && !avatarError ? (
          <AvatarImage
            src={getKieImageUrl(botIcon)}
            alt="Bot Avatar"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-[10px]">
            AI
          </AvatarFallback>
        )}
      </Avatar>
      <div className="chat-bubble">
        <div className="typing">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  )
}
