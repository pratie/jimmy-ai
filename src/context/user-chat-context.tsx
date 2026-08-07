'use client'

import { createContext, useContext, useState } from 'react'

export type TranscriptMessage = {
  id: string
  role: 'assistant' | 'user'
  message: string
  createdAt: Date
}

export type TranscriptLead = {
  name: string | null
  email: string | null
  phone: string | null
}

type ChatInitialValuesProps = {
  /** The conversation currently open in the reader, if any. */
  chatRoom: string | undefined
  setChatRoom: React.Dispatch<React.SetStateAction<string | undefined>>
  chats: TranscriptMessage[]
  setChats: React.Dispatch<React.SetStateAction<TranscriptMessage[]>>
  /** Contact details the assistant captured during this conversation. */
  lead: TranscriptLead | null
  setLead: React.Dispatch<React.SetStateAction<TranscriptLead | null>>
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatInitialValues: ChatInitialValuesProps = {
  chatRoom: undefined,
  setChatRoom: () => undefined,
  chats: [],
  setChats: () => undefined,
  lead: null,
  setLead: () => undefined,
  loading: false,
  setLoading: () => undefined,
}

const chatContext = createContext(ChatInitialValues)
const { Provider } = chatContext

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState(ChatInitialValues.chats)
  const [loading, setLoading] = useState(ChatInitialValues.loading)
  const [chatRoom, setChatRoom] = useState(ChatInitialValues.chatRoom)
  const [lead, setLead] = useState(ChatInitialValues.lead)

  const values = {
    chats,
    setChats,
    loading,
    setLoading,
    chatRoom,
    setChatRoom,
    lead,
    setLead,
  }

  return <Provider value={values}>{children}</Provider>
}

export const useChatContext = () => {
  const state = useContext(chatContext)
  return state
}
