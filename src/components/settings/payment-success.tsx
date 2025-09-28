'use client'
import { onUpdateSubscription } from '@/actions/dodo'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'

type Props = {
  plan?: 'STANDARD' | 'PRO' | 'ULTIMATE'
  subscriptionId?: string
  status?: string
}

const PaymentSuccess = ({ plan, subscriptionId, status }: Props) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateComplete, setUpdateComplete] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (plan && status === 'active') {
      handleSubscriptionUpdate()
    }
  }, [plan, status])

  const handleSubscriptionUpdate = async () => {
    if (!plan || updateComplete) return

    setIsUpdating(true)
    try {
      const result = await onUpdateSubscription(plan)
      if (result?.status === 200) {
        setUpdateComplete(true)
        // Force refresh to show updated plan
        router.refresh()
        setTimeout(() => {
          router.replace('/settings')
        }, 3000)
      }
    } catch (error) {
      console.error('Subscription update error:', error)
      setError('Failed to update subscription. Please contact support.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleContinue = () => {
    router.replace('/settings')
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Update Error</CardTitle>
          <CardDescription className="text-red-500">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleContinue} variant="outline">
            Continue to Settings
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          Payment Successful!
        </CardTitle>
        <CardDescription className="text-green-600">
          Your subscription to the {plan} plan has been activated.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscriptionId && (
          <p className="text-sm text-muted-foreground">
            Subscription ID: {subscriptionId}
          </p>
        )}

        {isUpdating && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating your account...</span>
          </div>
        )}

        {updateComplete && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Account updated successfully! Redirecting...</span>
          </div>
        )}

        {!isUpdating && !updateComplete && (
          <Button onClick={handleContinue}>Continue to Settings</Button>
        )}
      </CardContent>
    </Card>
  )
}

export default PaymentSuccess