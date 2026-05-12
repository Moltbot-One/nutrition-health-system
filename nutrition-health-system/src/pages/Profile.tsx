import { useState } from 'react'
import { useUserStore } from '@/store'
import { User, Save, Ruler, Weight, Calendar } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useUserStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    gender: user?.gender || '男',
    age: user?.age?.toString() || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateUser({
      nickname: form.nickname,
      email: form.email,
      gender: form.gender,
      age: form.age ? Number(form.age) : undefined,
      height: form.height ? Number(form.height) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
    })
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const bmi = form.height && form.weight
    ? (Number(form.weight) / ((Number(form.height) / 100) ** 2)).toFixed(1)
    : '--'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
          >
            编辑资料
          </button>
        )}
      </div>

      {saved && (
        <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg px-4 py-3">
          资料保存成功！
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{user?.nickname || '用户'}</h2>
              <p className="text-emerald-100 text-sm mt-1">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">昵称</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">性别</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                disabled={!editing}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">年龄</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  disabled={!editing}
                  placeholder="请输入年龄"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">身高 (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  disabled={!editing}
                  placeholder="请输入身高"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">体重 (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  disabled={!editing}
                  placeholder="请输入体重"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">健康档案</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{bmi}</p>
            <p className="text-sm text-gray-500 mt-1">BMI指数</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">85</p>
            <p className="text-sm text-gray-500 mt-1">健康评分</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">3</p>
            <p className="text-sm text-gray-500 mt-1">测评次数</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">15</p>
            <p className="text-sm text-gray-500 mt-1">记录天数</p>
          </div>
        </div>
      </div>

      {editing && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setEditing(false)}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      )}
    </div>
  )
}
