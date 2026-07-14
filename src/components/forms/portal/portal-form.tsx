'use client'
import { usePortal } from '@/hooks/portal/use-portal'
import { cn } from '@/lib/utils'
import React, { useEffect } from 'react'
import PortalSteps from './portal-steps'

type PortalFormProps = {
  questions: {
    id: string
    question: string
    answered: string | null
  }[]
  type: 'Appointment' | 'Payment'
  customerId: string
  domainid: string
  email: string
  bookings?:
    | {
        date: Date
        slot: string
      }[]
    | undefined
  products?:
    | {
        name: string
        image: string
        price: number
      }[]
    | undefined
  amount?: number
  dodoMerchantId?: string
}

const PortalForm = ({
  questions,
  type,
  customerId,
  domainid,
  bookings,
  products,
  email,
  amount,
  dodoMerchantId,
}: PortalFormProps) => {
  const {
    step,
    onNext,
    onPrev,
    register,
    errors,
    date,
    setDate,
    onBookAppointment,
    onSelectedTimeSlot,
    selectedSlot,
    loading,
  } = usePortal(customerId, domainid, email)

  useEffect(() => {
    if (questions.every((question) => question.answered)) {
      onNext()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <form className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,.08)]" onSubmit={onBookAppointment}>
      {(step === 1 || step === 2) && <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7"><div><p className="text-sm font-semibold text-slate-900">{type === 'Appointment' ? 'Schedule a conversation' : 'Complete your purchase'}</p><p className="mt-1 text-xs text-slate-500">Step {step} of 2</p></div><div className="flex items-center gap-2">{[1,2].map(index => <React.Fragment key={index}><span className={cn('grid h-7 w-7 place-items-center rounded-lg border text-[11px] font-semibold', step >= index ? 'border-transparent text-white' : 'border-slate-200 text-slate-400')} style={step >= index ? { backgroundColor: 'var(--portal-accent)' } : undefined}>{step > index ? <span>✓</span> : index}</span>{index === 1 && <span className={cn('h-px w-7', step === 2 ? 'bg-slate-400' : 'bg-slate-200')} />}</React.Fragment>)}</div></div>}
      <div className="p-5 sm:p-7 lg:p-9">
      <PortalSteps
        loading={loading}
        slot={selectedSlot}
        bookings={bookings}
        onSlot={onSelectedTimeSlot}
        date={date}
        onBooking={setDate}
        step={step}
        type={type}
        questions={questions}
        error={errors}
        register={register}
        onNext={onNext}
        products={products}
        onBack={onPrev}
        amount={amount}
        customerEmail={email}
        domainId={domainid}
        customerId={customerId}
      />
      </div>
    </form>
  )
}

export default PortalForm
