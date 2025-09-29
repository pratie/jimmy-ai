'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    console.log('[Auth] Starting sign out process...')
    try {
      await signOut(() => {
        console.log('[Auth] Sign out successful, redirecting to home...')
        router.push('/')
      })
    } catch (error) {
      console.error('[Auth] Sign out error:', error)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="outline"
      className="flex items-center gap-2"
    >
      <LogOut size={16} />
      Sign Out
    </Button>
  )
}