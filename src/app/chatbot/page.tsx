import AiChatBot from '@/components/chatbot'
import React from 'react'
import './chatbot.css'
import type { Metadata } from 'next'

type Props = {}

export const metadata: Metadata = {
  title: 'ChatDock Chatbot Embed',
  description: 'Embedded ChatDock assistant window.',
  alternates: { canonical: '/chatbot' },
  robots: { index: false, follow: false },
}

const ChatBot = (props: Props) => {
  return <AiChatBot />
}

export default ChatBot
