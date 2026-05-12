import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Baby, Heart, Stethoscope, ChevronRight, Clock } from 'lucide-react'
import api from '@/utils/api'

const iconMap: Record<string, typeof ClipboardCheck> = {
  general: ClipboardCheck,
  pregnant: Baby,
  elderly: Heart,
  chronic_disease: Stethoscope,
}

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  general: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200 hover:border-emerald-400' },
  pregnant: { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'border-pink-200 hover:border-pink-400' },
  elderly: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200 hover:border-blue-400' },
  chronic_disease: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-200 hover:border-amber-400' },
}

interface AssessmentType {
  id: string
  name: string
  description: string
  questions: { id: string; text: string; options: string[] }[]
}

interface HistoryItem {
  id: number
  type: string
  score: number
  risk_level: string
  created_at: string
}

const typeNames: Record<string, string> = {
  general: '通用健康测评',
  pregnant: '孕妇专属测评',
  elderly: '老年健康测评',
  chronic_disease: '慢病风险评估',
}

export default function AssessmentIndex() {
  const navigate = useNavigate()
  const [types, setTypes] = useState<AssessmentType[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    api.get<AssessmentType[]>('/assessments/types').then(setTypes).catch(() => {})
    api.get<{ items: HistoryItem[] }>('/assessments/history').then((data) => {
      setHistory(data.items || [])
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">健康测评</h1>
        <p className="text-gray-500 mt-1">选择适合您的测评类型，了解您的健康状况</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {types.map((type) => {
          const Icon = iconMap[type.id] || ClipboardCheck
          const colors = colorMap[type.id] || colorMap.general
          return (
            <button
              key={type.id}
              onClick={() => navigate(`/assessment/questionnaire?type=${type.id}`)}
              className={`text-left p-6 rounded-xl border-2 ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">{type.name}</h3>
              <p className="text-sm text-gray-500 mt-2">{type.description}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <span>{type.questions.length}题</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  约{type.questions.length}分钟
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">历史测评记录</h2>
        {history.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">暂无测评记录，快去做一次测评吧</p>
        ) : (
          <div className="space-y-3">
            {history.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => navigate(`/assessment/result/${record.id}`)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{typeNames[record.type] || record.type}</p>
                  <p className="text-xs text-gray-400 mt-1">{record.created_at}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-600">{record.score}分</p>
                    <p className="text-xs text-gray-400">{record.risk_level}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
