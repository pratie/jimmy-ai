'use client'

import { useUser, useClerk } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function CurrentUserDisplay() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSwitchAccount = async () => {
    console.log('[Account Switch] Starting account switch...')
    await signOut()
    router.push('/auth/sign-in')
  }

  if (!user) return null

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
      <p className="text-sm text-yellow-800 mb-2">
        Currently signed in as: <strong>{user.emailAddresses?.[0]?.emailAddress}</strong>
      </p>
      <Button
        onClick={handleSwitchAccount}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        Switch Account
      </Button>
    </div>
  )
}