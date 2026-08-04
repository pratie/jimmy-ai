import {
  onDomainCustomerResponses,
  onGetAllDomainBookings,
} from '@/actions/appointment'
import { onGetDomainProductsAndConnectedAccountId } from '@/actions/payments'
import PortalForm from '@/components/forms/portal/portal-form'
import React from 'react'

const CustomerPaymentPage = async ({
  params,
}: {
  params: Promise<{ domainid: string; customerid: string }>
}) => {
  const { customerid, domainid } = await params
  const questions = await onDomainCustomerResponses(customerid)
  const products = await onGetDomainProductsAndConnectedAccountId(domainid)

  if (!questions) return null

  return (
    <PortalForm
      email={questions.email!}
      products={products?.products.map((p) => ({ name: p.name, image: p.image ?? '', price: p.price }))}
      amount={products?.amount}
      domainid={domainid}
      customerId={customerid}
      questions={(questions.questions ?? []).map((q, i) => ({ id: String(i), ...q }))}
      dodoMerchantId={products?.dodoMerchantId || undefined}
      type="Payment"
    />
  )
}

export default CustomerPaymentPage
