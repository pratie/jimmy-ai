import { APPOINTMENT_TABLE_HEADER } from '@/constants/menu'
import React from 'react'
import { DataTable } from '../table'
import { TableCell, TableRow } from '../ui/table'
import { getMonthName } from '@/lib/utils'

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
        date: Date
        slot: string
        createdAt: Date
      }[]
    | undefined
}

const AllAppointments = ({ bookings }: Props) => {
  return (
    <DataTable headers={APPOINTMENT_TABLE_HEADER}>
      {bookings?.length ? (
        bookings.map((booking) => (
          <TableRow key={booking.id} className="border-slate-100 hover:bg-slate-50/80">
            <TableCell className="font-bold text-slate-800">{booking.email}</TableCell>
            <TableCell>
              <div>
                {getMonthName(booking.date.getMonth())} {booking.date.getDate()}{' '}
                {booking.date.getFullYear()}
              </div>
              <div className="uppercase">{booking.slot}</div>
            </TableCell>
            <TableCell>
              <div>
                {getMonthName(booking.createdAt.getMonth())}{' '}
                {booking.createdAt.getDate()} {booking.createdAt.getFullYear()}
              </div>
              <div>
                {booking.createdAt.getHours()} {booking.createdAt.getMinutes()}{' '}
                {booking.createdAt.getHours() > 12 ? 'PM' : 'AM'}
              </div>
            </TableCell>
            <TableCell className="text-right font-semibold text-slate-600">
              {booking.Customer?.Domain?.name}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow><TableCell colSpan={4} className="h-40 text-center text-xs font-semibold text-slate-400">No bookings captured yet.</TableCell></TableRow>
      )}
    </DataTable>
  )
}

export default AllAppointments
