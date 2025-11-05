import AiChatBot from '@/components/chatbot'
import React from 'react'
import './chatbot.css'
import { Cuprum } from 'next/font/google'
import type { Metadata } from 'next'

const cuprum = Cuprum({ subsets: ['latin'], weight: ['400', '700'] })

type Props = {}

export const metadata: Metadata = {
  title: 'ChatDock Chatbot Embed',
  description: 'Embedded ChatDock assistant window.',
  alternates: { canonical: '/chatbot' },
  robots: { index: false, follow: false },
}

const ChatBot = (props: Props) => {
  return (
    <div className={cuprum.className}>
      <AiChatBot />
    </div>
  )
}

export default ChatBot
