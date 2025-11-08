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
    <div className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 md:p-12">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        {/* Icon */}
        <div className="w-16 h-16 mb-6 items-center justify-center rounded-full bg-[#FF622D]/10 text-[#FF622D] flex">
          <Sparkles size={32} />
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Activate your chatbot in minutes
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-8">
          Add your domain, paste the snippet, and start capturing leads 24/7.
        </p>

        {/* Centered CTA Button */}
        <AppDrawer
          title="Add your business domain"
          description="Add your domain and upload an icon to integrate your chatbot"
          onOpen={
            <Button
              size="lg"
              className="bg-[#FF622D] hover:bg-[#E24D1C] text-white font-bold px-8 py-4 text-base rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000] transition-all"
            >
              <Plus size={20} className="mr-2" />
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

        {/* Simple Step Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mt-12 w-full">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Globe size={18} className="text-gray-600 dark:text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">1. Add domain</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Connect your website URL</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <ImageIcon size={18} className="text-gray-600 dark:text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">2. Upload icon</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Brand your chat widget</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Code size={18} className="text-gray-600 dark:text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">3. Paste snippet</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Embed chatbot on your site</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddDomainCTA

