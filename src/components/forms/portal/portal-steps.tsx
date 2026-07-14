import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import QuestionsForm from './questions'
import BookAppointmentDate from './booking-date'
import PaymentCheckout from './product-checkout'

type Props = {
  questions: {
    id: string
    question: string
    answered: string | null
  }[]
  type: 'Appointment' | 'Payment'
  register: UseFormRegister<FieldValues>
  error: FieldErrors<FieldValues>
  onNext(): void
  step: number
  date: Date | undefined
  onBooking: React.Dispatch<React.SetStateAction<Date | undefined>>
  onBack(): void
  onSlot(slot: string): void
  slot?: string
  loading: boolean
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
  customerEmail: string
  domainId: string
  customerId: string
}

const PortalSteps = ({
  questions,
  type,
  register,
  error,
  onNext,
  step,
  onBooking,
  date,
  onBack,
  onSlot,
  loading,
  slot,
  products,
  bookings,
  amount,
  customerEmail,
  domainId,
  customerId,
}: Props) => {
  if (step == 1) {
    return (
      <QuestionsForm
        register={register}
        error={error}
        onNext={onNext}
        questions={questions}
      />
    )
  }

  if (step == 2 && type == 'Appointment') {
    return (
      <BookAppointmentDate
        date={date}
        bookings={bookings}
        currentSlot={slot}
        onBack={onBack}
        onBooking={onBooking}
        onSlot={onSlot}
        loading={loading}
      />
    )
  }


  if (step == 2 && type == 'Payment') {
    return (
      <PaymentCheckout
        products={products}
        customerEmail={customerEmail}
        domainId={domainId}
        customerId={customerId}
        onBack={onBack}
        onNext={onNext}
        amount={amount}
      />
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">✓</span>
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-slate-950">You’re all set</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">Your information has been received. A confirmation and the next steps will arrive by email.</p>
    </div>
  )
}

export default PortalSteps
