import { useSearchParams, useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

const typeLabels: Record<string, string> = {
  daily: '每日健康报告',
  weekly: '每周健康报告',
  monthly: '每月健康报告',
}

const suggestions = [
  { type: 'good', text: 'BMI指数保持在正常范围，继续保持' },
  { type: 'warning', text: '蛋白质摄入偏低，建议增加鸡蛋、鱼肉等优质蛋白' },
  { type: 'warning', text: '本周有氧运动不足，建议增加2次30分钟以上的有氧运动' },
  { type: 'good', text: '睡眠质量良好，作息规律' },
  { type: 'warning', text: '膳食纤维摄入不足，建议增加全谷物和蔬菜' },
]

export default function ReportDetail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || 'daily'
  const score = 78

  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: type === 'daily'
        ? ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']
        : type === 'weekly'
        ? ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        : ['第1周', '第2周', '第3周', '第4周'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#E5E7EB' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9CA3AF' },
      splitLine: { lineStyle: { color: '#F3F4F6' } },
    },
    series: [
      {
        name: '热量摄入',
        type: 'line',
        data: type === 'daily' ? [0, 420, 1000, 1050, 1200, 1580, 1530] : [1580, 1650, 1420, 1700],
        smooth: true,
        lineStyle: { color: '#10B981', width: 2 },
        itemStyle: { color: '#10B981' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.15)' }, { offset: 1, color: 'rgba(16,185,129,0)' }] } },
      },
    ],
  }

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '饮食', max: 100 },
        { name: '运动', max: 100 },
        { name: '睡眠', max: 100 },
        { name: '心理', max: 100 },
        { name: '体重', max: 100 },
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
            value: [82, 65, 85, 70, 88],
            areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
            lineStyle: { color: '#10B981' },
            itemStyle: { color: '#10B981' },
          },
        ],
      },
    ],
  }

  const barOption = {
    tooltip: { trigger: 'axis' },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: ['蛋白质', '碳水', '脂肪', '纤维', '维生素C', '钙'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#E5E7EB' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9CA3AF', formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#F3F4F6' } },
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: 85, itemStyle: { color: '#10B981' } },
          { value: 88, itemStyle: { color: '#10B981' } },
          { value: 75, itemStyle: { color: '#F59E0B' } },
          { value: 72, itemStyle: { color: '#F59E0B' } },
          { value: 75, itemStyle: { color: '#F59E0B' } },
          { value: 81, itemStyle: { color: '#10B981' } },
        ],
        itemStyle: { borderRadius: [4, 4, 0, 0] },
        barWidth: '40%',
      },
    ],
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/reports')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        返回报告列表
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{typeLabels[type]}</h1>
            <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('zh-CN')}</p>
          </div>
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="#E5E7EB" strokeWidth="6" fill="none" />
                <circle cx="40" cy="40" r="34" stroke="#10B981" strokeWidth="6" fill="none"
                  strokeDasharray={`${(score / 100) * 214} 214`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{score}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">综合评分</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              健康趋势
            </h2>
            <ReactECharts option={trendOption} style={{ height: '250px' }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">健康维度</h2>
            <ReactECharts option={radarOption} style={{ height: '250px' }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">营养达标率</h2>
        <ReactECharts option={barOption} style={{ height: '250px' }} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">改善建议</h2>
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${s.type === 'good' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              {s.type === 'good' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <p className="text-sm text-gray-700">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
