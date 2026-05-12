import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  ClipboardCheck,
  Utensils,
  Dumbbell,
  BookOpen,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from 'lucide-react'
import { useUserStore } from '@/store'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/assessment', label: '健康测评', icon: ClipboardCheck },
  { path: '/diet', label: '膳食规划', icon: Utensils },
  { path: '/exercise', label: '运动建议', icon: Dumbbell },
  { path: '/knowledge', label: '知识库', icon: BookOpen },
  { path: '/reports', label: '健康报告', icon: FileBarChart },
  { path: '/admin', label: '管理后台', icon: Settings },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-emerald-800 to-emerald-900 text-white transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-emerald-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-emerald-900" />
            </div>
            <span className="text-lg font-bold">营养健康</span>
          </div>
          <button
            className="lg:hidden text-emerald-300 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600/40 text-white'
                    : 'text-emerald-100 hover:bg-emerald-700/50 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-700">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nickname || '用户'}</p>
              <p className="text-xs text-emerald-300 truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="relative">
            <button
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-700" />
              </div>
              <span className="hidden sm:inline">{user?.nickname || '用户'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate('/profile')
                    }}
                  >
                    <User className="w-4 h-4" />
                    个人资料
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
