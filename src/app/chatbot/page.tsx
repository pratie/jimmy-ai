import AiChatBot from '@/components/chatbot'
import React from 'react'
import './chatbot.css'
import { Cuprum } from 'next/font/google'

const cuprum = Cuprum({ subsets: ['latin'], weight: ['400', '700'] })

type Props = {}

const ChatBot = (props: Props) => {
  return (
    <div className={cuprum.className}>
      <AiChatBot />
    </div>
  )
}

export default ChatBot
