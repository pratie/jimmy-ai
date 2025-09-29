import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <div className="flex gap-5 justify-between items-center px-7 py-1 font-bold border-b border-solid border-zinc-100 leading-[154.5%] max-md:flex-wrap max-md:px-5 bg-transparent">
      <div className="flex gap-1.5 justify-center self-stretch my-auto text-2xl tracking-tighter text-neutral-700">
        <Image
          src="/images/icon-ai-logo.png" // Updated Logo
          alt="Icon AI Logo"
          sizes="100vw"
          style={{
            width: '100px',
            height: 'auto',
          }}
          width={0}
          height={0}
        />
      </div>
      <ul className="gap-8 justify-between self-stretch my-auto text-sm leading-5 text-neutral-700 max-md:flex-wrap max-md:max-w-full font-normal hidden md:flex">
        <li className="cursor-pointer hover:text-red-600 transition-colors">Features</li>
        <li className="cursor-pointer hover:text-red-600 transition-colors">Pricing</li>
      </ul>
      <Link
        href="/dashboard"
        className="bg-red-600 px-4 py-2 rounded-sm text-white hover:bg-red-700 transition-colors"
      >
        Start Automating Now
      </Link>
    </div>
  )
}

export default NavBar
