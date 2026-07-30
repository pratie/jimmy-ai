type IntegrationsListItemProps = {
  id: string
  // Internal key kept as 'stripe' for DB/back-compat; the user-facing
  // provider is Dodo Payments.
  name: 'stripe'
  label: string
  logo: string
  description: string
  title: string
  modalDescription: string
}

export const INTEGRATION_LIST_ITEMS: IntegrationsListItemProps[] = [
  {
    id: '1',
    name: 'stripe',
    label: 'Dodo Payments',
    description:
      'Connect Dodo Payments so client agents can hand qualified visitors into a secure checkout flow.',
    logo: '914be637-39bf-47e6-bb81-37b553163945',
    title: 'Connect Dodo Payments',
    modalDescription:
      'You will be redirected to Dodo Payments to authorize the connection securely.',
  },
]
