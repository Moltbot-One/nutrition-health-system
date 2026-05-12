import { useState } from 'react'
import { Search, Plus, Edit, Trash2, X, Eye } from 'lucide-react'

interface ArticleItem {
  id: string
  title: string
  category: string
  status: 'published' | 'draft'
  views: number
  date: string
  author: string
}

const articles: ArticleItem[] = [
  { id: '1', title: '如何科学补充蛋白质？这些食物你不能错过', category: '营养知识', status: 'published', views: 2340, date: '2026-05-10', author: '营养师A' },
  { id: '2', title: '每天走一万步真的科学吗？', category: '运动指导', status: 'published', views: 1856, date: '2026-05-08', author: '运动专家B' },
  { id: '3', title: '地中海饮食：被全球营养师推荐的饮食模式', category: '营养知识', status: 'published', views: 3120, date: '2026-05-05', author: '营养师A' },
  { id: '4', title: '睡眠质量如何影响你的体重？', category: '健康生活', status: 'published', views: 1560, date: '2026-05-03', author: '健康顾问C' },
  { id: '5', title: '高血压患者的饮食指南', category: '疾病预防', status: 'published', views: 2780, date: '2026-04-28', author: '营养师A' },
  { id: '6', title: '夏季饮食注意事项（草稿）', category: '营养知识', status: 'draft', views: 0, date: '2026-05-11', author: '营养师A' },
]

export default function AdminContent() {
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editArticle, setEditArticle] = useState<ArticleItem | null>(null)
  const [form, setForm] = useState({ title: '', category: '营养知识', content: '' })

  const filtered = articles.filter((a) => a.title.includes(search))

  const handleEdit = (article: ArticleItem) => {
    setEditArticle(article)
    setForm({ title: article.title, category: article.category, content: '' })
    setShowEditor(true)
  }

  const handleNew = () => {
    setEditArticle(null)
    setForm({ title: '', category: '营养知识', content: '' })
    setShowEditor(true)
  }

  const handleSave = () => {
    setShowEditor(false)
    setEditArticle(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">内容管理</h1>
          <p className="text-gray-500 mt-1">管理知识库文章</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增文章
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索文章标题..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">标题</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">分类</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">状态</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">阅读量</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">日期</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{article.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{article.author}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs">{article.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      article.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {article.status === 'published' ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{article.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-500"
                      >
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
          共 {filtered.length} 篇文章
        </div>
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  {editArticle ? '编辑文章' : '新增文章'}
                </h2>
                <button onClick={() => setShowEditor(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">文章标题</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="请输入文章标题"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">分类</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="营养知识">营养知识</option>
                    <option value="运动指导">运动指导</option>
                    <option value="健康生活">健康生活</option>
                    <option value="疾病预防">疾病预防</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">文章内容</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="请输入文章内容..."
                    rows={10}
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
