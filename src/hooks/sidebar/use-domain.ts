
import { onIntegrateDomain } from '@/actions/settings'
import { useToast } from '@/components/ui/use-toast'
import { AddDomainSchema } from '@/schemas/settings.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { uploadFile } from '@/lib/kie-api'
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
    let domain = formData.get('domain') as string
    const imageFile = formData.get('image') as File
    const imageUrl = formData.get('imageUrl') as string

    // Clean domain: remove protocol and trailing slashes
    if (domain) {
      domain = domain
        .replace(/^https?:\/\//, '') // Remove http:// or https://
        .replace(/^www\./, '')       // Remove www.
        .replace(/\/.*$/, '')        // Remove everything after first /
        .trim()
    }

    console.log('📝 Form data:', {
      domain,
      imageFile: imageFile?.name,
      imageSize: imageFile?.size,
      imageUrl,
      allFormData: Array.from(formData.entries())
    })

    if (!domain) {
      toast({
        title: 'Error',
        description: 'Domain is required',
      })
      setLoading(false)
      return
    }

    // Check if we have an already uploaded image URL or need to upload a new file
    let iconReference: string = imageUrl || ''

    if (!imageUrl && (!imageFile || imageFile.size === 0)) {
      toast({
        title: 'Error',
        description: 'Image is required',
      })
      setLoading(false)
      return
    }

    // If no pre-uploaded URL, upload the file
    if (!imageUrl && imageFile && imageFile.size > 0) {
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

      console.log('✅ Upload successful! URL:', uploadResult.data!.downloadUrl)
      iconReference = uploadResult.data?.downloadUrl || ''
    }

    console.log('🔗 Creating domain integration with icon:', iconReference)

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
