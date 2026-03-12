import { NavLink } from 'react-router-dom'
import { Bell, PawPrint } from 'lucide-react'

const navItems = [
  { to: '/guide', label: '보호자 가이드' },
  { to: '/food', label: '위험 음식' },
  { to: '/training', label: '훈련 가이드' },
  { to: '/health', label: '건강 체크' },
  { to: '/map', label: '동물병원 찾기' },
  { to: '/feeding', label: '급식 관리' },
  { to: '/walk', label: '산책' },
  { to: '/ai-diagnosis', label: 'AI 진단' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* 로고 */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <PawPrint size={24} className="text-amber-500" />
          <span className="text-lg font-bold text-stone-800">펫케어</span>
        </NavLink>

        {/* 데스크탑 메뉴 - md 이상에서만 표시 */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* 우측 아이콘 */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="p-2 rounded-full hover:bg-stone-100 transition-colors">
            <Bell size={20} className="text-stone-600" />
          </button>
        </div>
      </div>
    </header>
  )
}
