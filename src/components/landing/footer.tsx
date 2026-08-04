import Image from 'next/image'
import Link from 'next/link'

/**
 * Marketing footer. Mirrors the navigation IA and carries the founder
 * identity — with no testimonials or customer logos yet, being a findable,
 * contactable person is the trust signal we actually have.
 */

const COLUMNS: { heading: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    heading: 'Product',
    links: [
      { href: '/#product', label: 'Capabilities' },
      { href: '/#how-it-works', label: 'How it works' },
      { href: '/#trust', label: 'How answers are grounded' },
      { href: '/#industries', label: 'Industry examples' },
      { href: '/#demo', label: 'Live demo' },
    ],
  },
  {
    heading: 'For agencies',
    links: [
      { href: '/#for-agencies', label: 'Margin calculator' },
      { href: '/#results', label: 'Client reporting' },
      { href: '/#pricing', label: 'Pricing' },
      { href: '/#faq', label: 'FAQ' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/blogs', label: 'Resources' },
      {
        href: 'https://cal.com/prathap-reddy-caxwn4/15min',
        label: 'Book a 15-minute walkthrough',
        external: true,
      },
      { href: 'https://x.com/prthpdev', label: 'Contact the founder', external: true },
    ],
  },
  {
    heading: 'Account',
    links: [
      { href: '/auth/sign-in', label: 'Sign in' },
      { href: '/auth/sign-up', label: 'Build a client demo' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-[#0E1726] px-5 py-14 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="relative h-8 w-8 overflow-hidden rounded-lg bg-white">
                <Image src="/images/chatdock-mark.png" alt="" fill sizes="32px" className="object-contain" />
              </span>
              <span className="font-bold tracking-tight">ChatDock</span>
            </Link>
            <p className="mt-4 max-w-xs text-[13.5px] leading-6 text-white/45">
              An AI receptionist that web, SEO and lead-generation agencies can launch, brand, manage and
              sell to every client on their roster.
            </p>
            <p className="mt-4 max-w-xs text-[12px] leading-5 text-white/30">
              Built and supported by Prathap Reddy. No sales team, no call centre — the founder answers
              support.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                {column.heading}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) =>
                  link.external ? (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13.5px] text-white/55 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13.5px] text-white/55 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-7 text-[12px] text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ChatDock. All rights reserved.</p>
          <p>Dashboard figures shown on this site are sample data, labelled where they appear.</p>
        </div>
      </div>
    </footer>
  )
}
