import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CardDescription } from '@/components/ui/card'
import { APPOINTMENT_TIME_SLOTS } from '@/constants/timeslots'
import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
  date: Date | undefined
  onBooking: React.Dispatch<React.SetStateAction<Date | undefined>>
  onBack(): void
  onSlot(slot: string): void
  currentSlot?: string
  loading: boolean
  bookings:
    | {
        date: Date
        slot: string
      }[]
    | undefined
}

const BookAppointmentDate = ({
  date,
  onBooking,
  onBack,
  onSlot,
  currentSlot,
  loading,
  bookings,
}: Props) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Choose a time</h2>
      <p className="mt-2 text-sm text-slate-500">Select a date and one of the available appointment slots.</p>
      <div className="mt-7 grid gap-7 lg:grid-cols-[220px_minmax(280px,1fr)_190px]">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Discovery call</p>
          <CardDescription className="mt-2 text-xs leading-5 text-slate-500">A focused conversation to understand your needs and agree on the next step.</CardDescription>
          <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500"><p>30 minutes</p><p className="mt-1">Video meeting</p></div>
        </div>
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onBooking}
            disabled={(day) => day < new Date(new Date().setHours(0,0,0,0))}
            className="rounded-xl border border-slate-200 bg-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 self-start lg:grid-cols-1">
          {APPOINTMENT_TIME_SLOTS.map((slot, key) => {
            const unavailable = !date || Boolean(bookings?.some((booking) => booking.date.toDateString() === date.toDateString() && booking.slot === slot.slot))
            const selected = currentSlot === slot.slot
            return (
              <button
                key={key}
                type="button"
                disabled={unavailable}
                onClick={() => !unavailable && onSlot(slot.slot)}
                className={cn(
                  'h-10 w-full rounded-xl border px-3 text-xs font-medium transition',
                  selected ? 'border-transparent text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                  unavailable && 'cursor-not-allowed bg-slate-50 text-slate-300 hover:border-slate-200'
                )}
                style={selected ? { backgroundColor: 'var(--portal-accent)' } : undefined}
              >
                {slot.slot}
              </button>
          )})}
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5">
        <Button
          type="button"
          onClick={onBack}
          variant={'outline'}
        >
          Back
        </Button>
        <Button disabled={!date || !currentSlot} className="text-white hover:opacity-90" style={{ backgroundColor: 'var(--portal-accent)' }}>
          <Loader loading={loading}>Confirm booking</Loader>
        </Button>
      </div>
    </div>
  )
}

export default BookAppointmentDate
