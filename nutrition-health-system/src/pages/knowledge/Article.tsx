import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Clock, Share2, BookOpen } from 'lucide-react'

const articleData: Record<string, { title: string; date: string; views: number; category: string; content: string[] }> = {
  '1': {
    title: '如何科学补充蛋白质？这些食物你不能错过',
    date: '2026-05-10',
    views: 2340,
    category: '营养知识',
    content: [
      '蛋白质是人体必需的三大宏量营养素之一，是构成细胞、组织和器官的基本成分。成年人每天需要摄入0.8-1.2克/公斤体重的蛋白质，运动人群则需要更多。',
      '优质蛋白质来源包括：\n\n1. 动物性食物：鸡蛋、牛奶、鱼肉、瘦肉等，这些食物含有完整的必需氨基酸，吸收利用率高。\n\n2. 植物性食物：大豆及其制品（豆腐、豆浆）、藜麦、坚果等，虽然部分植物蛋白氨基酸组成不够完整，但通过搭配食用可以达到互补效果。',
      '蛋白质摄入建议：\n\n• 将蛋白质均匀分配到每餐中，每餐20-30克\n• 运动后30分钟内补充蛋白质效果最佳\n• 优先选择优质蛋白来源\n• 注意不要过量摄入，过量可能增加肾脏负担',
      '常见误区：\n\n• 误区一：蛋白质越多越好。实际上过量摄入不仅浪费，还可能增加肾脏负担。\n• 误区二：只吃肉才能补充蛋白质。实际上豆类、谷物等植物性食物也是良好的蛋白质来源。\n• 误区三：蛋白粉是必需品。对于大多数人来说，通过日常饮食即可满足蛋白质需求。',
    ],
  },
  '2': {
    title: '每天走一万步真的科学吗？',
    date: '2026-05-08',
    views: 1856,
    category: '运动指导',
    content: [
      '"日行万步"的说法源自1965年日本的一场营销活动，当时一家公司推出了名为"万步计"的计步器。这个数字并非基于科学研究，但却广为流传。',
      '最新研究表明：\n\n• 每天走7000-8000步就能获得显著的健康益处\n• 步数与健康收益之间存在递减关系，超过10000步后额外收益有限\n• 步行的速度和强度同样重要，快走比慢走效果更好',
      '不同人群的步数建议：\n\n• 老年人：6000-8000步即可，注意避免过度疲劳\n• 中年人：8000-10000步为宜\n• 年轻人：可以达到10000步以上，但不必强求\n• 有关节问题的人：应咨询医生，选择合适的运动量',
    ],
  },
}

const relatedArticles = [
  { id: '3', title: '地中海饮食：被全球营养师推荐的饮食模式', views: 3120 },
  { id: '5', title: '高血压患者的饮食指南', views: 2780 },
]

export default function Article() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const id = searchParams.get('id') || '1'
  const article = articleData[id] || articleData['1']

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/knowledge')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        返回知识库
      </button>

      <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
            {article.category}
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">{article.title}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.views}阅读
            </span>
            <button className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <Share2 className="w-4 h-4" />
              分享
            </button>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          {article.content.map((paragraph, i) => (
            <div key={i} className="mb-5">
              {paragraph.split('\n').map((line, j) => {
                if (line.startsWith('•')) {
                  return <p key={j} className="text-gray-600 ml-4 my-1">{line}</p>
                }
                if (line.match(/^\d+\./)) {
                  return <p key={j} className="text-gray-600 ml-4 my-1">{line}</p>
                }
                return <p key={j} className="text-gray-600 my-2">{line}</p>
              })}
            </div>
          ))}
        </div>
      </article>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-500" />
          相关推荐
        </h2>
        <div className="space-y-3">
          {relatedArticles.map((ra) => (
            <div
              key={ra.id}
              onClick={() => navigate(`/knowledge/article?id=${ra.id}`)}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-700">{ra.title}</span>
              <span className="text-xs text-gray-400">{ra.views}阅读</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
