
import { onIntegrateDomain } from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'
import { AddDomainSchema } from '@/schemas/settings.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { uploadFile } from '@/lib/uploadcare'
import { usePathname, useRouter } from 'next/navigation'

import { useEffect, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'

export const useDomain = () => {
  const { register, formState: { errors } } = useForm<FieldValues>()

  const pathname = usePathname()
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const [isDomain, setIsDomain] = useState<string | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    setIsDomain(pathname.split('/').pop())
  }, [pathname])

  const onAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log('🚀 Form submission started!')

    const formData = new FormData(e.target as HTMLFormElement)
    const domain = formData.get('domain') as string
    const imageFile = formData.get('image') as File

    console.log('📝 Form data:', {
      domain,
      imageFile: imageFile?.name,
      imageSize: imageFile?.size
    })

    if (!domain) {
      toast({
        title: 'Error',
        description: 'Domain is required',
      })
      setLoading(false)
      return
    }

    if (!imageFile || imageFile.size === 0) {
      toast({
        title: 'Error',
        description: 'Image is required',
      })
      setLoading(false)
      return
    }

    console.log('📤 Starting image upload...')
    const uploadResult = await uploadFile(imageFile)

    if (!uploadResult.success) {
      console.log('❌ Upload failed:', uploadResult.error)
      toast({
        title: 'Error',
        description: `Upload failed: ${uploadResult.error}`,
      })
      setLoading(false)
      return
    }

    console.log('✅ Upload successful! UUID:', uploadResult.data!.uuid)

    console.log('🔗 Creating domain integration...')
    const iconReference = uploadResult.data?.cdnUrl ?? uploadResult.data?.uuid

    const domainResult = await onIntegrateDomain(domain, iconReference || '')

    if (domainResult) {
      console.log('🎉 Domain created successfully!', domainResult)
      setLoading(false)
      toast({
        title: domainResult.status == 200 ? 'Success' : 'Error',
        description: domainResult.message,
      })
      router.refresh()
    } else {
      console.log('❌ Domain creation failed')
      setLoading(false)
      toast({
        title: 'Error',
        description: 'Failed to create domain',
      })
    }
  }

  return {
    register,
    onAddDomain,
    errors,
    loading,
    isDomain,
  }
}
