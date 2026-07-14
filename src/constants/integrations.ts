type IntegrationsListItemProps = {
  id: string
  name: 'stripe'
  logo: string
  description: string
  title: string
  modalDescription: string
}

export const INTEGRATION_LIST_ITEMS: IntegrationsListItemProps[] = [
  {
    id: '1',
    name: 'stripe',
    description:
      'Connect a Stripe account so client agents can hand qualified visitors into a secure payment flow.',
    logo: '914be637-39bf-47e6-bb81-37b553163945',
    title: 'Connect Stripe Account',
    modalDescription:
      'You will be redirected to Stripe to authorize the connection securely.',
  },
]
