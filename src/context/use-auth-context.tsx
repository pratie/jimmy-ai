"use client"
import React, { useState } from 'react'

type InitialValuesProps = {
  currentStep: number
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>
  selectedPlan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'
  setSelectedPlan: React.Dispatch<React.SetStateAction<'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'>>
  billingInterval: 'MONTHLY' | 'YEARLY'
  setBillingInterval: React.Dispatch<React.SetStateAction<'MONTHLY' | 'YEARLY'>>
}

const InitialValues: InitialValuesProps = {
  currentStep: 1,
  setCurrentStep: () => undefined,
  selectedPlan: 'FREE',
  setSelectedPlan: () => undefined,
  billingInterval: 'MONTHLY',
  setBillingInterval: () => undefined,
}

const authContext = React.createContext(InitialValues)

const { Provider } = authContext

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [currentStep, setCurrentStep] = useState<number>(
    InitialValues.currentStep
  )
  const [selectedPlan, setSelectedPlan] = useState<
    'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'
  >(InitialValues.selectedPlan)
  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'YEARLY'>(
    InitialValues.billingInterval
  )
  const values = {
    currentStep,
    setCurrentStep,
    selectedPlan,
    setSelectedPlan,
    billingInterval,
    setBillingInterval,
  }
  return <Provider value={values}>{children}</Provider>
}

export const useAuthContextHook = () => {
  const state = React.useContext(authContext)
  return state
}
