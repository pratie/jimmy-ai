import Section from '@/components/section-label'
import UploadButton from '@/components/upload-button'
import { BotIcon } from '@/icons/bot-icon'
import { getUploadCareUrl } from '@/lib/uploadcare'

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

const EditChatbotIcon = ({ register, errors, chatBot }: Props) => {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="py-5 flex flex-col gap-5 items-start">
      <Section
        label="Chatbot icon"
        message="Change the icon for the chatbot."
      />
      <UploadButton
        label="Edit Image"
        register={register}
        errors={errors}
      />
      {chatBot?.icon && !imageError ? (
        <div className="rounded-full overflow-hidden">
          <Image
            src={getUploadCareUrl(chatBot.icon)}
            alt="bot"
            width={80}
            height={80}
            onError={handleImageError}
            onLoad={() => setImageError(false)}
          />
        </div>
      ) : (
        <div className="rounded-full cursor-pointer shadow-md w-20 h-20 flex items-center justify-center bg-grandis">
          <BotIcon />
        </div>
      )}
    </div>
  )
}

export default EditChatbotIcon
