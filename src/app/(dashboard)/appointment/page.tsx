import type { Metadata } from 'next'
import { onGetAllBookingsForCurrentUser } from '@/actions/appointment'
import AllAppointments from '@/components/appointment/all-appointments'
import InfoBar from '@/components/infobar'
import { CalendarCheck2, Clock3, Mail, Sparkles, UsersRound } from 'lucide-react'
import { currentUser } from '@clerk/nextjs/server'
import React from 'react'

export const metadata: Metadata = {
  title: 'Bookings — ChatDock',
  robots: { index: false, follow: false },
}

const Page = async () => {
  const user = await currentUser()
  if (!user) return null

  const result = await onGetAllBookingsForCurrentUser(user.id)
  const bookings = result?.bookings || []
  const now = new Date()
  const todayKey = now.toDateString()
  const todayBookings = bookings.filter((booking) => booking.date.toDateString() === todayKey)
  const upcoming = bookings.filter((booking) => booking.date >= now).length
  const uniqueContacts = new Set(bookings.map((booking) => booking.email)).size

  return (
    <>
      <InfoBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total bookings', value: bookings.length, icon: CalendarCheck2, tone: 'bg-indigo-50 text-[#5b5ce2]' },
              { label: 'Upcoming', value: upcoming, icon: Clock3, tone: 'bg-orange-50 text-orange-600' },
              { label: 'Unique contacts', value: uniqueContacts, icon: UsersRound, tone: 'bg-emerald-50 text-emerald-600' },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <div><p className="text-xs font-bold text-slate-400">{metric.label}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{metric.value}</p></div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.tone}`}><metric.icon className="h-5 w-5" /></div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-6 py-5"><h2 className="text-lg font-black text-slate-950">Booking pipeline</h2><p className="mt-1 text-xs font-medium text-slate-400">Appointments captured by every client agent.</p></div>
              <div className="overflow-x-auto p-2"><AllAppointments bookings={bookings} /></div>
            </section>

            <aside className="rounded-3xl bg-[#0b1020] p-5 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">Today</p><h2 className="mt-1 text-lg font-black text-white">{todayBookings.length} meeting{todayBookings.length === 1 ? '' : 's'}</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#9b9cff]"><Sparkles className="h-4 w-4" /></div></div>
              <div className="mt-5 space-y-3">
                {todayBookings.length ? todayBookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between"><span className="rounded-lg bg-[#7778ff]/20 px-2 py-1 text-[10px] font-black text-[#b9b9ff]">{booking.slot}</span><span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">Confirmed</span></div>
                    <p className="mt-3 truncate text-xs font-black text-white">{booking.Customer?.Domain?.name || 'Client agent'}</p>
                    <p className="mt-2 flex items-center gap-1.5 truncate text-[10px] text-white/45"><Mail className="h-3 w-3" />{booking.email}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-white/15 px-4 py-9 text-center"><CalendarCheck2 className="mx-auto h-6 w-6 text-white/25" /><p className="mt-3 text-xs font-bold text-white/55">No meetings today</p><p className="mt-1 text-[10px] leading-4 text-white/30">Your agents are still qualifying visitors.</p></div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
