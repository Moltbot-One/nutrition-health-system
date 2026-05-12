import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { ArrowLeft, AlertTriangle, Target, Apple, Dumbbell, Droplets } from 'lucide-react'

interface AssessmentResultData {
  id: number
  type: string
  score: number
  riskLevel: string
  suggestions: string[]
}

const riskLevelMap: Record<string, { label: string; color: string; bg: string }> = {
  '低风险': { label: '低风险', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  '中风险': { label: '中等风险', color: 'text-amber-600', bg: 'bg-amber-50' },
  '较高风险': { label: '较高风险', color: 'text-orange-600', bg: 'bg-orange-50' },
  '高风险': { label: '高风险', color: 'text-red-600', bg: 'bg-red-50' },
}

const suggestionIcons = [Apple, Dumbbell, Droplets, Target]

export default function AssessmentResult() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const result = (location.state as AssessmentResultData) || {
    id,
    type: 'general',
    score: 0,
    riskLevel: '中风险',
    suggestions: ['请完成测评以获取个性化建议'],
  }

  const risk = riskLevelMap[result.riskLevel] || riskLevelMap['中风险']

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '饮食营养', max: 100 },
        { name: '运动健身', max: 100 },
        { name: '睡眠质量', max: 100 },
        { name: '心理健康', max: 100 },
        { name: '生活习惯', max: 100 },
        { name: '体重管理', max: 100 },
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: '#6B7280', fontSize: 12 },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              Math.min(result.score + 5, 100),
              Math.max(result.score - 10, 20),
              Math.max(result.score - 5, 30),
              Math.max(result.score - 8, 25),
              Math.min(result.score + 2, 100),
              Math.min(result.score + 8, 100),
            ],
            name: '您的评分',
            areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
            lineStyle: { color: '#10B981' },
            itemStyle: { color: '#10B981' },
          },
        ],
      },
    ],
  }

  const nutritionGoals = [
    { name: '蛋白质', current: Math.round(55 * result.score / 80), target: 65, unit: 'g' },
    { name: '碳水化合物', current: Math.round(220 * result.score / 80), target: 250, unit: 'g' },
    { name: '脂肪', current: Math.round(58 * result.score / 80), target: 60, unit: 'g' },
    { name: '膳食纤维', current: Math.round(18 * result.score / 80), target: 25, unit: 'g' },
    { name: '维生素C', current: Math.round(75 * result.score / 80), target: 100, unit: 'mg' },
    { name: '钙', current: Math.round(650 * result.score / 80), target: 800, unit: 'mg' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/assessment')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        返回测评列表
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">测评结果</h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('zh-CN')} 完成
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${risk.bg}`}>
            <span className={`text-sm font-medium ${risk.color} flex items-center gap-1`}>
              <AlertTriangle className="w-4 h-4" />
              {risk.label}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="8" fill="none" />
              <circle
                cx="64" cy="64" r="56"
                stroke={result.score >= 80 ? '#10B981' : result.score >= 60 ? '#F59E0B' : '#EF4444'}
                strokeWidth="8" fill="none"
                strokeDasharray={`${(result.score / 100) * 352} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{result.score}</span>
              <span className="text-xs text-gray-400">综合评分</span>
            </div>
          </div>
        </div>

        <ReactECharts option={radarOption} style={{ height: '300px' }} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-500" />
          改善建议
        </h2>
        <div className="space-y-4">
          {result.suggestions.map((suggestion, index) => {
            const Icon = suggestionIcons[index % suggestionIcons.length]
            const colors = ['emerald', 'blue', 'purple', 'amber']
            const color = colors[index % colors.length]
            return (
              <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">建议 {index + 1}</h3>
                  <p className="text-sm text-gray-500 mt-1">{suggestion}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">营养目标</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {nutritionGoals.map((goal) => {
            const percent = Math.min((goal.current / goal.target) * 100, 100)
            return (
              <div key={goal.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                  <span className="text-xs text-gray-400">
                    {goal.current}/{goal.target}{goal.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      percent >= 100 ? 'bg-emerald-500' : percent >= 70 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/diet/plan')}
          className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          生成膳食方案
        </button>
        <button
          onClick={() => navigate('/exercise/plan')}
          className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          生成运动方案
        </button>
      </div>
    </div>
  )
}
