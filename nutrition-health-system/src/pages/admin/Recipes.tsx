import { useState } from 'react'
import { Search, Plus, Edit, Trash2, X, Eye } from 'lucide-react'

interface RecipeItem {
  id: string
  name: string
  category: string
  calories: number
  difficulty: string
  status: 'published' | 'draft'
  views: number
}

const recipes: RecipeItem[] = [
  { id: '1', name: '清蒸鲈鱼', category: '海鲜', calories: 180, difficulty: '简单', status: 'published', views: 1230 },
  { id: '2', name: '鸡胸肉沙拉', category: '轻食', calories: 250, difficulty: '简单', status: 'published', views: 980 },
  { id: '3', name: '糙米蔬菜饭', category: '主食', calories: 320, difficulty: '简单', status: 'published', views: 870 },
  { id: '4', name: '紫薯燕麦粥', category: '早餐', calories: 180, difficulty: '简单', status: 'published', views: 1560 },
  { id: '5', name: '番茄牛肉汤', category: '汤品', calories: 280, difficulty: '中等', status: 'published', views: 2100 },
  { id: '6', name: '三文鱼牛油果碗', category: '轻食', calories: 350, difficulty: '简单', status: 'published', views: 1890 },
  { id: '7', name: '低卡甜品（草稿）', category: '甜品', calories: 150, difficulty: '中等', status: 'draft', views: 0 },
]

export default function AdminRecipes() {
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editRecipe, setEditRecipe] = useState<RecipeItem | null>(null)
  const [form, setForm] = useState({ name: '', category: '轻食', calories: '', difficulty: '简单', ingredients: '', steps: '' })

  const filtered = recipes.filter((r) => r.name.includes(search))

  const handleEdit = (recipe: RecipeItem) => {
    setEditRecipe(recipe)
    setForm({ name: recipe.name, category: recipe.category, calories: recipe.calories.toString(), difficulty: recipe.difficulty, ingredients: '', steps: '' })
    setShowEditor(true)
  }

  const handleNew = () => {
    setEditRecipe(null)
    setForm({ name: '', category: '轻食', calories: '', difficulty: '简单', ingredients: '', steps: '' })
    setShowEditor(true)
  }

  const handleSave = () => {
    setShowEditor(false)
    setEditRecipe(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">食谱管理</h1>
          <p className="text-gray-500 mt-1">管理平台食谱内容</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增食谱
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索食谱名称..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">食谱名称</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">分类</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">热量</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">难度</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">状态</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">阅读量</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((recipe) => (
                <tr key={recipe.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{recipe.name}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{recipe.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{recipe.calories}kcal</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{recipe.difficulty}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      recipe.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {recipe.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {recipe.views}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(recipe)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
          共 {filtered.length} 个食谱
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  {editRecipe ? '编辑食谱' : '新增食谱'}
                </h2>
                <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">食谱名称</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="请输入食谱名称"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">分类</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="轻食">轻食</option>
                      <option value="海鲜">海鲜</option>
                      <option value="主食">主食</option>
                      <option value="早餐">早餐</option>
                      <option value="汤品">汤品</option>
                      <option value="甜品">甜品</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">热量(kcal)</label>
                    <input
                      type="number"
                      value={form.calories}
                      onChange={(e) => setForm({ ...form, calories: e.target.value })}
                      placeholder="热量"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">难度</label>
                    <select
                      value={form.difficulty}
                      onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">食材（每行一个）</label>
                  <textarea
                    value={form.ingredients}
                    onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                    placeholder="鲈鱼1条&#10;葱姜适量&#10;蒸鱼豉油2勺"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">做法（每行一步）</label>
                  <textarea
                    value={form.steps}
                    onChange={(e) => setForm({ ...form, steps: e.target.value })}
                    placeholder="鲈鱼处理干净，划刀&#10;铺葱姜，淋料酒&#10;大火蒸8分钟"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
