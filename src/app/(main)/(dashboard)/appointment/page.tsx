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
  const todayBookings = bookings.filter((booking) => (booking.date ?? new Date(0)).toDateString() === todayKey)
  const upcoming = bookings.filter((booking) => (booking.date ?? new Date(0)) >= now).length
  const uniqueContacts = new Set(bookings.map((booking) => booking.email)).size

  return (
    <>
      <InfoBar />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-7 md:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total bookings', value: bookings.length, icon: CalendarCheck2, tone: 'bg-primary/10 text-primary' },
              { label: 'Upcoming', value: upcoming, icon: Clock3, tone: 'bg-orange-50 text-orange-600' },
              { label: 'Unique contacts', value: uniqueContacts, icon: UsersRound, tone: 'bg-emerald-50 text-emerald-600' },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
                <div><p className="text-xs font-bold text-muted-foreground">{metric.label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{metric.value}</p></div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${metric.tone}`}><metric.icon className="h-5 w-5" /></div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <div className="border-b border-border px-6 py-5"><h2 className="text-lg font-semibold text-foreground">Booking pipeline</h2><p className="mt-1 text-xs font-medium text-muted-foreground">Appointments captured by every client agent.</p></div>
              <div className="overflow-x-auto p-2"><AllAppointments bookings={bookings as never} /></div>
            </section>

            <aside className="rounded-xl bg-sidebar p-5 text-sidebar-foreground shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/40">Today</p><h2 className="mt-1 text-lg font-semibold text-sidebar-foreground">{todayBookings.length} meeting{todayBookings.length === 1 ? '' : 's'}</h2></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sidebar-accent"><Sparkles className="h-4 w-4" /></div></div>
              <div className="mt-5 space-y-3">
                {todayBookings.length ? todayBookings.map((booking) => (
                  <div key={booking.id} className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between"><span className="rounded-lg bg-sidebar-accent/20 px-2 py-1 text-[10px] font-bold text-sidebar-accent">{booking.slot}</span><span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">{booking.status === 'confirmed' ? 'Confirmed' : 'Requested'}</span></div>
                    <p className="mt-3 truncate text-xs font-semibold text-sidebar-foreground">{booking.Domain?.name || 'Client agent'}</p>
                    <p className="mt-2 flex items-center gap-1.5 truncate text-[10px] text-sidebar-foreground/45"><Mail className="h-3 w-3" />{booking.email}</p>
                  </div>
                )) : (
                  <div className="rounded-xl border border-dashed border-white/15 px-4 py-9 text-center"><CalendarCheck2 className="mx-auto h-6 w-6 text-sidebar-foreground/25" /><p className="mt-3 text-xs font-bold text-sidebar-foreground/55">No meetings today</p><p className="mt-1 text-[10px] leading-4 text-sidebar-foreground/30">Your agents are still qualifying visitors.</p></div>
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
