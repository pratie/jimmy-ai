'use client'

import React from 'react'
import AppDrawer from '@/components/drawer'
import { Button } from '@/components/ui/button'
import { Sparkles, Plus, Globe, Code, ImageIcon } from 'lucide-react'
import FormGenerator from '@/components/forms/form-generator'
import UploadButton from '@/components/upload-button'
import { useDomain } from '@/hooks/sidebar/use-domain'

const AddDomainCTA = () => {
  const { register, onAddDomain, loading, errors } = useDomain()

  return (
    <div className="w-full rounded-xl border bg-white/70 backdrop-blur p-5 md:p-6 flex items-start gap-5">
      <div className="hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-interactive-pink/20 text-text-primary">
        <Sparkles />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">
              Activate your chatbot in minutes
            </h2>
            <p className="text-text-secondary mt-1">
              Add your domain, paste the snippet, and start capturing leads 24/7.
            </p>
          </div>
          <AppDrawer
            title="Add your business domain"
            description="Add your domain and upload an icon to integrate your chatbot"
            onOpen={
              <Button className="gap-2">
                <Plus size={16} />
                Add Domain
              </Button>
            }
          >
            <form
              className="mt-3 w-full md:w-6/12 flex flex-col gap-3"
              onSubmit={onAddDomain}
            >
              <FormGenerator
                inputType="input"
                register={register}
                label="Domain"
                name="domain"
                errors={errors}
                placeholder="example.com"
                type="text"
              />
              <UploadButton
                register={register}
                label="Upload Icon"
                errors={errors}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Domain'}
              </Button>
            </form>
          </AppDrawer>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm">
          <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
            <Globe className="mt-0.5" size={16} />
            <div>
              <p className="font-medium text-text-primary">1. Add domain</p>
              <p className="text-text-secondary">Connect your website URL</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
            <ImageIcon className="mt-0.5" size={16} />
            <div>
              <p className="font-medium text-text-primary">2. Upload icon</p>
              <p className="text-text-secondary">Brand your chat widget</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
            <Code className="mt-0.5" size={16} />
            <div>
              <p className="font-medium text-text-primary">3. Paste snippet</p>
              <p className="text-text-secondary">Embed chatbot on your site</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddDomainCTA

