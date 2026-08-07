import { APPOINTMENT_TABLE_HEADER } from '@/constants/menu'
import React from 'react'
import { format } from 'date-fns'
import { CalendarCheck2 } from 'lucide-react'
import { DataTable } from '../table'
import { TableCell, TableRow } from '../ui/table'

type Props = {
  bookings:
    | {
        Customer: {
          Domain: {
            name: string
          } | null
        } | null
        id: string
        email: string
        domainId: string | null
        /** Nullable in practice — the page that owns this list already guards
         *  it, and `format(null)` throws rather than rendering badly. */
        date: Date | null
        slot: string
        createdAt: Date | null
      }[]
    | undefined
}

/** `undefined` and `null` both become an em dash. Dates also cross the
 *  server/client boundary, so they can arrive as strings despite the type. */
const when = (value: Date | string | null | undefined, pattern: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : format(date, pattern)
}

const AllAppointments = ({ bookings }: Props) => {
  return (
    <DataTable headers={APPOINTMENT_TABLE_HEADER}>
      {bookings?.length ? (
        bookings.map((booking) => (
          <TableRow key={booking.id} className="border-border hover:bg-muted/80">
            <TableCell className="font-semibold text-foreground">{booking.email}</TableCell>
            <TableCell>
              {/* date-fns rather than hand-assembled month names: one format,
                  and identical on the server and after hydration. */}
              <div>{when(booking.date, 'd MMM yyyy')}</div>
              <div className="uppercase">{booking.slot}</div>
            </TableCell>
            <TableCell>{when(booking.createdAt, 'd MMM yyyy, h:mm a')}</TableCell>
            <TableCell className="text-right font-semibold text-muted-foreground">
              {/* A booking whose customer lost its domain rendered as a blank
                  cell, which read as a layout bug rather than missing data. */}
              {booking.Customer?.Domain?.name || '—'}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4} className="h-48 text-center">
            <CalendarCheck2 className="mx-auto h-6 w-6 text-muted-foreground/70" />
            <p className="mt-3 text-sm font-semibold text-foreground">No bookings yet</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Requests appear here as soon as an assistant books a visitor in.
            </p>
          </TableCell>
        </TableRow>
      )}
    </DataTable>
  )
}

export default AllAppointments
