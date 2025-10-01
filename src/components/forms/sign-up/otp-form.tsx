import OTPInput from '@/components/otp'
import React, { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSignUp } from '@clerk/nextjs'
import { useToast } from '@/components/ui/use-toast'

type Props = {
  setOTP: React.Dispatch<React.SetStateAction<string>>
  onOTP: string
}

const OTPForm = ({ onOTP, setOTP }: Props) => {
  const { signUp, isLoaded } = useSignUp()
  const { toast } = useToast()
  const [resendCooldown, setResendCooldown] = useState<number>(0)
  const [resending, setResending] = useState<boolean>(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const onResend = useCallback(async () => {
    if (!isLoaded || !signUp) return
    try {
      setResending(true)
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      toast({ title: 'Code sent', description: 'We emailed you a new 6-digit code.' })
      // start 45s cooldown
      setResendCooldown(45)
    } catch (error: any) {
      const description = error?.errors?.[0]?.longMessage || error?.message || 'Failed to resend code'
      toast({ title: 'Error', description, variant: 'destructive' })
    } finally {
      setResending(false)
    }
  }, [isLoaded, signUp, toast])

  return (
    <>
      <h2 className="text-gravel md:text-4xl font-bold">Enter OTP</h2>
      <p className="text-iridium md:text-sm">
        Enter the one time password that was sent to your email.
      </p>
      <div className="w-full justify-center flex py-5">
        <OTPInput
          otp={onOTP}
          setOtp={setOTP}
        />
      </div>
      <div className="w-full flex justify-center">
        <Button
          type="button"
          disabled={!isLoaded || resending || resendCooldown > 0}
          onClick={onResend}
          variant="outline"
        >
          {resending
            ? 'Sending...'
            : resendCooldown > 0
            ? `Resend code in ${resendCooldown}s`
            : 'Resend code'}
        </Button>
      </div>
    </>
  )
}

export default OTPForm
