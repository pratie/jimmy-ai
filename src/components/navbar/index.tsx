import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <>
    <div className="flex gap-5 justify-between items-center px-7 py-3 font-bold leading-[154.5%] max-md:flex-wrap max-md:px-5">
      <div className="flex gap-1.5 justify-center self-stretch my-auto text-2xl tracking-tighter text-brand-primary">
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
      <ul className="gap-8 justify-between self-stretch my-auto text-sm leading-5 text-brand-primary/70 max-md:flex-wrap max-md:max-w-full font-normal hidden md:flex items-center">
        <li>
          <a
            href="#features"
            className="cursor-pointer hover:text-brand-primary hover:underline decoration-brand-accent decoration-2 underline-offset-4 transition-all"
          >
            Features
          </a>
        </li>
        <li>
          <a
            href="#pricing"
            className="cursor-pointer hover:text-brand-primary hover:underline decoration-brand-accent decoration-2 underline-offset-4 transition-all"
          >
            Pricing
          </a>
        </li>
      </ul>
      <Link
        href="/dashboard"
        className="px-4 py-2.5 rounded-base bg-main text-black font-heading border-2 border-border shadow-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
      >
        Start Automating Now
      </Link>
    </div>
    <div className="w-full h-px bg-brand-base-300"></div>
    </>
  )
}

export default NavBar
