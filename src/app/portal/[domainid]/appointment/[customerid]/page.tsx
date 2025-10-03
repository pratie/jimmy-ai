import {
  onDomainCustomerResponses,
  onGetAllDomainBookings,
} from '@/actions/appointment'
import PortalForm from '@/components/forms/portal/portal-form'
import React from 'react'

const CustomerSignUpForm = async ({
  params,
}: {
  params: Promise<{ domainid: string; customerid: string }>
}) => {
  const { customerid, domainid } = await params
  const questions = await onDomainCustomerResponses(customerid)
  const bookings = await onGetAllDomainBookings(domainid)

  if (!questions) return null

  return (
    <PortalForm
      bookings={bookings}
      email={questions.email!}
      domainid={domainid}
      customerId={customerid}
      questions={questions.questions}
      type="Appointment"
    />
  )
}

export default CustomerSignUpForm
