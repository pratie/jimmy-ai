import { useDomain } from '@/hooks/sidebar/use-domain'
import { cn } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import AppDrawer from '../drawer'
import { Plus } from 'lucide-react'
import { Loader } from '../loader'
import FormGenerator from '../forms/form-generator'
import UploadButton from '../upload-button'
import { Button } from '../ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { getKieImageUrl } from '@/lib/kie-api'

type Props = {
  min?: boolean
  domains:
  | {
    id: string
    name: string
    icon: string | null
  }[]
  | null
  | undefined
}

const DomainIcon = ({ icon, name }: { icon: string | null, name: string }) => {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageError(false)
  }, [icon])

  if (!icon || imageError) {
    return (
      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-brand-accent to-brand-primary flex items-center justify-center text-white text-xs font-bold">
        {name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <Image
      src={getKieImageUrl(icon)}
      alt="domain logo"
      width={20}
      height={20}
      className="rounded-full object-cover"
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  )
}

const DomainMenu = ({ domains, min }: Props) => {
  const { register, onAddDomain, loading, errors, isDomain } = useDomain()

  return (
    <div className={cn('flex flex-col gap-3', min ? 'mt-6' : 'mt-3')}>
      <div className="flex justify-between w-full items-center">
        {!min && <p className="text-xs tracking-[0.08em] text-white">AI AGENTS</p>}
        <AppDrawer
          description="add in your domain address to integrate your chatbot"
          title="Add your business domain"
          onOpen={
            <div className={cn(
              'cursor-pointer rounded-full border border-white/40 p-1 text-white/70 transition',
              'hover:border-white hover:text-white'
            )}>
              <Plus className="w-4 h-4" />
            </div>
          }
        >
          <Loader loading={loading}>
            <form
              className="mt-5 w-full max-w-lg flex flex-col gap-6"
              onSubmit={onAddDomain}
            >
              <FormGenerator
                inputType="input"
                register={register}
                label="Domain"
                name="domain"
                errors={errors}
                placeholder="mydomain.com"
                type="text"
              />
              <UploadButton
                register={register}
                label="Upload Icon"
                errors={errors}
              />
              <Button
                type="submit"
                className="w-full h-12 font-bold text-lg"
              >
                Add Domain
              </Button>
            </form>
          </Loader>
        </AppDrawer>
      </div>
      <div className="flex flex-col gap-1 font-medium text-white">
        {domains &&
          domains.map((domain) => (
            <Link
              href={`/settings/${domain.name.split('.')[0]}`}
              key={domain.id}
              className={cn(
                'flex gap-3 rounded-full transition duration-150 ease-in-out cursor-pointer border',
                !min ? 'p-2' : 'py-2',
                domain.name.split('.')[0] == isDomain
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'text-white border-transparent hover:bg-white/10'
              )}
            >
              <DomainIcon
                icon={domain.icon}
                name={domain.name}
              />
              {!min && <p className="text-sm">{domain.name}</p>}
            </Link>
          ))}
      </div>
    </div>
  )
}

export default DomainMenu
