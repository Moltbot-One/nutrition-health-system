import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BookOpen, MessageCircle, TrendingUp, ChevronRight, Clock, Eye } from 'lucide-react'

const categories = [
  { key: 'all', label: '全部', icon: BookOpen },
  { key: 'nutrition', label: '营养知识', icon: BookOpen },
  { key: 'exercise', label: '运动指导', icon: BookOpen },
  { key: 'health', label: '健康生活', icon: BookOpen },
  { key: 'disease', label: '疾病预防', icon: BookOpen },
]

const articles = [
  { id: '1', title: '如何科学补充蛋白质？这些食物你不能错过', category: 'nutrition', views: 2340, date: '2026-05-10', summary: '蛋白质是人体必需的营养素，了解如何通过日常饮食科学补充蛋白质...' },
  { id: '2', title: '每天走一万步真的科学吗？', category: 'exercise', views: 1856, date: '2026-05-08', summary: '日行万步的说法广为流传，但这个目标是否适合所有人...' },
  { id: '3', title: '地中海饮食：被全球营养师推荐的饮食模式', category: 'nutrition', views: 3120, date: '2026-05-05', summary: '地中海饮食连续多年被评为最佳饮食模式，它有哪些独特之处...' },
  { id: '4', title: '睡眠质量如何影响你的体重？', category: 'health', views: 1560, date: '2026-05-03', summary: '研究表明，睡眠不足与体重增加密切相关，了解背后的科学原理...' },
  { id: '5', title: '高血压患者的饮食指南', category: 'disease', views: 2780, date: '2026-04-28', summary: '高血压是最常见的慢性病之一，合理的饮食调整可以有效控制血压...' },
  { id: '6', title: '办公室久坐族的5分钟拉伸操', category: 'exercise', views: 1920, date: '2026-04-25', summary: '长时间久坐会导致肌肉僵硬和疼痛，这套简单的拉伸操帮你缓解...' },
]

const hotArticles = [
  { id: '3', title: '地中海饮食：被全球营养师推荐的饮食模式', views: 3120 },
  { id: '5', title: '高血压患者的饮食指南', views: 2780 },
  { id: '1', title: '如何科学补充蛋白质？', views: 2340 },
]

export default function KnowledgeIndex() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = articles.filter((a) => {
    const matchCategory = activeCategory === 'all' || a.category === activeCategory
    const matchSearch = !search || a.title.includes(search)
    return matchCategory && matchSearch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
        <p className="text-gray-500 mt-1">专业的营养健康知识，助您科学管理健康</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文章..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={() => navigate('/knowledge/qa')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          AI问答
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.key
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filtered.map((article) => (
            <div
              key={article.id}
              onClick={() => navigate(`/knowledge/article?id=${article.id}`)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{article.summary}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {article.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.date}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 mt-1 shrink-0 ml-3" />
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-2" />
              <p>没有找到相关文章</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              热门文章
            </h2>
            <div className="space-y-3">
              {hotArticles.map((article, i) => (
                <div
                  key={article.id}
                  onClick={() => navigate(`/knowledge/article?id=${article.id}`)}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm text-gray-700 group-hover:text-emerald-600 transition-colors line-clamp-2">{article.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{article.views}阅读</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
            <MessageCircle className="w-8 h-8 mb-3" />
            <h3 className="text-sm font-semibold">AI健康助手</h3>
            <p className="text-xs text-emerald-100 mt-1">有任何营养健康问题，随时向AI助手提问</p>
            <button
              onClick={() => navigate('/knowledge/qa')}
              className="mt-3 px-4 py-2 bg-white text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-50 transition-colors"
            >
              开始提问
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
