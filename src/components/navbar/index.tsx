import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <>
    <div className="flex gap-5 justify-between items-center px-7 py-3 font-bold leading-[154.5%] max-md:flex-wrap max-md:px-5">
      <div className="flex gap-1.5 justify-center self-stretch my-auto text-2xl tracking-tighter text-text-primary">
        <Image
          src="/images/logo.svg"
          alt="Logo"
          sizes="100vw"
          style={{
            width: '50px',
            height: 'auto',
          }}
          width={0}
          height={0}
        />
      </div>
      <ul className="gap-8 justify-between self-stretch my-auto text-sm leading-5 text-text-secondary max-md:flex-wrap max-md:max-w-full font-normal hidden md:flex">
        <li className="cursor-pointer hover:text-text-primary hover:underline decoration-interactive-pink decoration-2 underline-offset-4 transition-all">Features</li>
        <li className="cursor-pointer hover:text-text-primary hover:underline decoration-interactive-pink decoration-2 underline-offset-4 transition-all">Pricing</li>
      </ul>
      <Link
        href="/dashboard"
        className="px-6 py-2.5 text-sauce-black font-bold hover:underline transition-all"
      >
        Start Automating Now
      </Link>
    </div>
    <div className="w-full h-px bg-sauce-black/10"></div>
    </>
  )
}

export default NavBar
