import { useState } from 'react'

interface PremiumHamburgerProps {
  items?: Array<{
    label: string
    href: string
  }>
}

const defaultItems = [
  { label: 'Boeken', href: '/booking/' },
  { label: 'Volg uw rit', href: '/tracking/' },
  { label: 'Diensten', href: '/diensten/' },
  { label: 'LV VIP', href: '/vip/' },
  { label: 'Contact', href: '/contact/' },
]

export function PremiumHamburger({ items = defaultItems }: PremiumHamburgerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lv-premium-hamburger">
      <button
        type="button"
        className="lv-premium-hamburger__toggle"
        aria-expanded={open}
        aria-label="Menu openen"
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <nav className="lv-premium-hamburger__panel">
          {items.map((item) => (
            <a key={item.href} href={item.href} className="lv-premium-hamburger__link">
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
