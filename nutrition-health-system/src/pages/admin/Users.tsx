import { useState } from 'react'
import { Search, MoreHorizontal, UserCheck, UserX, Shield } from 'lucide-react'

interface UserItem {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  joinDate: string
  lastLogin: string
}

const users: UserItem[] = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', role: 'user', status: 'active', joinDate: '2026-01-15', lastLogin: '2026-05-12' },
  { id: '2', name: '李四', email: 'lisi@example.com', role: 'user', status: 'active', joinDate: '2026-02-20', lastLogin: '2026-05-11' },
  { id: '3', name: '王五', email: 'wangwu@example.com', role: 'user', status: 'inactive', joinDate: '2026-03-05', lastLogin: '2026-04-15' },
  { id: '4', name: '赵六', email: 'zhaoliu@example.com', role: 'admin', status: 'active', joinDate: '2026-01-01', lastLogin: '2026-05-12' },
  { id: '5', name: '孙七', email: 'sunqi@example.com', role: 'user', status: 'active', joinDate: '2026-04-10', lastLogin: '2026-05-10' },
  { id: '6', name: '周八', email: 'zhouba@example.com', role: 'user', status: 'inactive', joinDate: '2026-03-18', lastLogin: '2026-04-01' },
  { id: '7', name: '吴九', email: 'wujiu@example.com', role: 'user', status: 'active', joinDate: '2026-05-01', lastLogin: '2026-05-12' },
  { id: '8', name: '郑十', email: 'zhengshi@example.com', role: 'user', status: 'active', joinDate: '2026-04-25', lastLogin: '2026-05-09' },
]

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const filtered = users.filter((u) => {
    const matchSearch = u.name.includes(search) || u.email.includes(search)
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-500 mt-1">管理平台用户账户</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索用户名或邮箱..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'all' ? '全部' : s === 'active' ? '活跃' : '停用'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">用户</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">角色</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">状态</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">注册日期</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">最后登录</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-emerald-600">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? '活跃' : '停用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.joinDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                      {menuOpen === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              <Shield className="w-3 h-3" />
                              修改角色
                            </button>
                            {user.status === 'active' ? (
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                <UserX className="w-3 h-3" />
                                停用账户
                              </button>
                            ) : (
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50">
                                <UserCheck className="w-3 h-3" />
                                启用账户
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
          共 {filtered.length} 条记录
        </div>
      </div>
    </div>
  )
}
