import UploadButton from '@/components/upload-button'
import { BotIcon } from '@/icons/bot-icon'
import { getKieImageUrl } from '@/lib/kie-api'

import Image from 'next/image'
import React, { useState } from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  chatBot: {
    id: string
    icon: string | null
    welcomeMessage: string | null
  } | null
}

/** The avatar beside every reply. Laid out as a row — the current icon and the
 *  control that replaces it belong side by side, not stacked with a heading. */
const EditChatbotIcon = ({ register, errors, chatBot }: Props) => {
  const [imageError, setImageError] = useState(false)

  return (
    <div>
      <p className="text-[12px] font-semibold text-foreground">Avatar</p>
      <p className="mt-0.5 text-[11.5px] leading-5 text-muted-foreground">
        Shown on the bubble and beside every reply.
      </p>
      <div className="mt-2 flex items-center gap-4">
        {chatBot?.icon && !imageError ? (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border">
            <Image
              src={getKieImageUrl(chatBot.icon)}
              alt="Assistant avatar"
              width={56}
              height={56}
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
            <BotIcon />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <UploadButton label="Edit Image" register={register} errors={errors} />
        </div>
      </div>
    </div>
  )
}

export default EditChatbotIcon
