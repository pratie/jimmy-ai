import { useEffect, useState } from 'react'
import {
  onCreateSubscriptionPaymentLink,
  onCreateCustomerPaymentLink,
  onUpdateSubscription,
  onConnectDodoPayments,
} from '@/actions/dodo'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'

export const useDodoPayments = () => {
  const [onDodoAccountPending, setOnDodoAccountPending] =
    useState<boolean>(false)
  const { toast } = useToast()

  const onDodoConnect = async () => {
    try {
      setOnDodoAccountPending(true)
      const result = await onConnectDodoPayments()
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect Dodo Payments account',
        variant: 'destructive',
      })
      console.error(error)
    } finally {
      setOnDodoAccountPending(false)
    }
  }
  return { onDodoConnect, onDodoAccountPending }
}

export const useDodoCustomer = (
  products: { id: string; name: string; price: number }[],
  customerEmail: string,
  domainId: string,
  customerId: string
) => {
  const [paymentLink, setPaymentLink] = useState<string>('')
  const [loadForm, setLoadForm] = useState<boolean>(false)
  const { toast } = useToast()

  const onCreatePaymentLink = async () => {
    try {
      setLoadForm(true)
      const result = await onCreateCustomerPaymentLink(
        products,
        customerEmail,
        domainId,
        customerId
      )
      if (result) {
        setLoadForm(false)
        setPaymentLink(result.paymentLink)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create payment link',
        variant: 'destructive',
      })
      console.error(error)
      setLoadForm(false)
    }
  }

  useEffect(() => {
    if (products.length > 0) {
      onCreatePaymentLink()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products])

  return { paymentLink, loadForm }
}

export const useCompleteCustomerPayment = () => {
  const { toast } = useToast()

  const onRedirectToPayment = (paymentLink: string) => {
    if (paymentLink) {
      window.location.href = paymentLink
    } else {
      toast({
        title: 'Error',
        description: 'Payment link not available',
        variant: 'destructive',
      })
    }
  }

  return { onRedirectToPayment }
}

export const useSubscriptions = (plan: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
  const [loading, setLoading] = useState<boolean>(false)
  const [payment, setPayment] = useState<'STANDARD' | 'PRO' | 'ULTIMATE'>(plan)
  const { toast } = useToast()
  const router = useRouter()

  const onUpdateToFreeTier = async () => {
    try {
      setLoading(true)
      const free = await onUpdateSubscription('STANDARD')
      if (free) {
        setLoading(false)
        toast({
          title: 'Success',
          description: free.message,
        })
        router.refresh()
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const onSetPayment = (payment: 'STANDARD' | 'PRO' | 'ULTIMATE') =>
    setPayment(payment)

  return {
    loading,
    onSetPayment,
    payment,
    onUpdateToFreeTier,
  }
}

export const useDodoSubscription = (payment: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
  const [paymentLink, setPaymentLink] = useState<string>('')
  const [loadForm, setLoadForm] = useState<boolean>(false)
  const { toast } = useToast()

  const onGetSubscriptionLink = async (plans: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
    try {
      setLoadForm(true)
      if (plans === 'STANDARD') {
        // Free plan, no payment needed
        setLoadForm(false)
        return
      }

      const result = await onCreateSubscriptionPaymentLink(plans)
      if (result && 'paymentLink' in result) {
        setLoadForm(false)
        setPaymentLink(result.paymentLink)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create subscription payment link',
        variant: 'destructive',
      })
      console.error(error)
      setLoadForm(false)
    }
  }

  useEffect(() => {
    onGetSubscriptionLink(payment)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment])

  return { paymentLink, loadForm }
}

export const useCompleteSubscriptionPayment = (
  payment: 'STANDARD' | 'PRO' | 'ULTIMATE'
) => {
  const { toast } = useToast()

  const onRedirectToSubscriptionPayment = (paymentLink: string) => {
    if (payment === 'STANDARD') {
      // Handle free plan upgrade directly
      onUpdateSubscription('STANDARD').then((result) => {
        if (result) {
          toast({
            title: 'Success',
            description: result.message,
          })
        }
      })
      return
    }

    if (paymentLink) {
      window.location.href = paymentLink
    } else {
      toast({
        title: 'Error',
        description: 'Payment link not available',
        variant: 'destructive',
      })
    }
  }

  return { onRedirectToSubscriptionPayment }
}

export const useCancelSubscription = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const onCancel = async () => {
    try {
      setLoading(true)
      const result = await onCancelSubscription({ atPeriodEnd: true })

      if (result.status === 200) {
        toast({
          title: 'Subscription Cancelled',
          description: result.message,
        })
        router.refresh()
        return true
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to cancel subscription',
          variant: 'destructive',
        })
        return false
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel subscription',
        variant: 'destructive',
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return { onCancel, loading }
}
