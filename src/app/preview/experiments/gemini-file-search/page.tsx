import React, { Suspense } from 'react'
import ClientPreview from './ClientPreview'

export default function Page() {
  return (
    <div className="min-h-screen w-full flex items-start justify-center py-10 px-4">
      <Suspense fallback={<div className="w-full max-w-[980px]">Loading preview…</div>}>
        <ClientPreview />
      </Suspense>
    </div>
  )
}
