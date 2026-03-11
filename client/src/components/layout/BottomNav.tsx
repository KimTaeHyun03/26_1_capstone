import { NavLink } from 'react-router-dom'
import { Home, Heart, MapPin, MoreHorizontal } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '홈', end: true },
  { to: '/health', icon: Heart, label: '건강' },
  { to: '/map', icon: MapPin, label: '지도' },
  { to: '/more', icon: MoreHorizontal, label: '더보기' },
]

export default function BottomNav() {
  return (
    /* 모바일에서만 표시 */
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200">
      <ul className="flex">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-amber-500' : 'text-stone-400'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
