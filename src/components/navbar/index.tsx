import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

function NavBar() {
  return (
    <div className="flex gap-5 justify-between items-center px-7 py-3 font-bold border-b-2 border-pastel-lavender/40 backdrop-blur-md bg-pastel-cream/60 leading-[154.5%] max-md:flex-wrap max-md:px-5 shadow-sm">
      <div className="flex gap-1.5 justify-center self-stretch my-auto text-2xl tracking-tighter text-text-primary">
        <Image
          src="/images/icon-ai-logo.png"
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
      <ul className="gap-8 justify-between self-stretch my-auto text-sm leading-5 text-text-secondary max-md:flex-wrap max-md:max-w-full font-normal hidden md:flex">
        <li className="cursor-pointer hover:text-text-primary hover:underline decoration-interactive-pink decoration-2 underline-offset-4 transition-all">Features</li>
        <li className="cursor-pointer hover:text-text-primary hover:underline decoration-interactive-pink decoration-2 underline-offset-4 transition-all">Pricing</li>
      </ul>
      <Link
        href="/dashboard"
        className="bg-interactive-pink px-6 py-2.5 rounded-xl text-text-primary font-bold hover:bg-interactive-pink/90 transition-all shadow-md hover:shadow-lg transform hover:scale-105 border-2 border-interactive-pink/40"
      >
        Start Automating Now
      </Link>
    </div>
  )
}

export default NavBar
