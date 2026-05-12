import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileBarChart, Calendar, ChevronRight } from 'lucide-react'

type ReportType = 'daily' | 'weekly' | 'monthly'

interface Report {
  id: string
  title: string
  date: string
  score: number
  type: ReportType
  summary: string
}

const reports: Report[] = [
  { id: '1', title: '每日健康报告', date: '2026-05-12', score: 82, type: 'daily', summary: '今日饮食均衡，运动量达标，睡眠质量良好' },
  { id: '2', title: '每日健康报告', date: '2026-05-11', score: 75, type: 'daily', summary: '蛋白质摄入不足，建议增加优质蛋白' },
  { id: '3', title: '每周健康报告', date: '2026-05-05', score: 78, type: 'weekly', summary: '本周运动完成率65%，需增加有氧运动频次' },
  { id: '4', title: '每周健康报告', date: '2026-04-28', score: 72, type: 'weekly', summary: '饮食结构需优化，膳食纤维摄入偏低' },
  { id: '5', title: '每月健康报告', date: '2026-05-01', score: 76, type: 'monthly', summary: '本月整体健康状况良好，BMI保持在正常范围' },
  { id: '6', title: '每月健康报告', date: '2026-04-01', score: 70, type: 'monthly', summary: '运动量偏少，建议增加每周运动次数' },
]

const typeLabels: Record<ReportType, string> = {
  daily: '日报',
  weekly: '周报',
  monthly: '月报',
}

const typeColors: Record<ReportType, string> = {
  daily: 'bg-emerald-100 text-emerald-700',
  weekly: 'bg-blue-100 text-blue-700',
  monthly: 'bg-purple-100 text-purple-700',
}

export default function ReportsIndex() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState<ReportType | 'all'>('all')

  const filtered = activeType === 'all' ? reports : reports.filter((r) => r.type === activeType)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">健康报告</h1>
        <p className="text-gray-500 mt-1">全面了解您的健康状况变化趋势</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'daily', 'weekly', 'monthly'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeType === type
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? '全部' : typeLabels[type]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((report) => (
          <div
            key={report.id}
            onClick={() => navigate(`/reports/detail?id=${report.id}&type=${report.type}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[report.type]}`}>
                {typeLabels[report.type]}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {report.date}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">{report.title}</h3>
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{report.summary}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <FileBarChart className="w-4 h-4 text-emerald-500" />
                <span className="text-lg font-bold text-emerald-600">{report.score}分</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileBarChart className="w-10 h-10 mx-auto mb-2" />
          <p>暂无报告</p>
        </div>
      )}
    </div>
  )
}
