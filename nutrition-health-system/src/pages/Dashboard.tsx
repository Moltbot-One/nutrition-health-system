import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  Activity,
  Apple,
  Dumbbell,
  TrendingUp,
  ClipboardCheck,
  Utensils,
  BookOpen,
  Bell,
  ChevronRight,
} from 'lucide-react'
import { useUserStore } from '@/store'

const stats = [
  { label: 'BMI指数', value: '22.5', unit: '', status: '正常', icon: Activity, color: 'emerald' },
  { label: '健康评分', value: '85', unit: '分', status: '良好', icon: TrendingUp, color: 'blue' },
  { label: '营养达标率', value: '78', unit: '%', status: '一般', icon: Apple, color: 'amber' },
  { label: '运动完成率', value: '65', unit: '%', status: '待提升', icon: Dumbbell, color: 'rose' },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
}

const reminders = [
  { text: '今日饮水量不足，建议再喝4杯水', type: 'warning' },
  { text: '午餐蛋白质摄入偏低，可适当补充', type: 'info' },
  { text: '本周运动目标还差2次有氧运动', type: 'warning' },
]

export default function Dashboard() {
  const { user } = useUserStore()
  const navigate = useNavigate()
  const chartRef = useRef<ReactECharts>(null)

  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance()
    if (chart) {
      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const ringOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          position: 'center',
          formatter: () => '68%',
          fontSize: 28,
          fontWeight: 'bold',
          color: '#10B981',
        },
        data: [
          { value: 45, name: '碳水化合物', itemStyle: { color: '#10B981' } },
          { value: 23, name: '蛋白质', itemStyle: { color: '#3B82F6' } },
          { value: 15, name: '脂肪', itemStyle: { color: '#F59E0B' } },
          { value: 17, name: '未摄入', itemStyle: { color: '#E5E7EB' } },
        ],
      },
    ],
  }

  const quickActions = [
    { label: '健康测评', icon: ClipboardCheck, path: '/assessment', color: 'bg-emerald-500' },
    { label: '膳食记录', icon: Utensils, path: '/diet/record', color: 'bg-blue-500' },
    { label: '运动记录', icon: Dumbbell, path: '/exercise/record', color: 'bg-amber-500' },
    { label: '知识库', icon: BookOpen, path: '/knowledge', color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            你好，{user?.nickname || '用户'}
          </h1>
          <p className="text-gray-500 mt-1">今天是健康的一天，继续保持！</p>
        </div>
        <span className="text-sm text-gray-400">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                {stat.status}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-sm text-gray-400">{stat.unit}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日饮食进度</h2>
          <ReactECharts ref={chartRef} option={ringOption} style={{ height: '240px' }} />
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { name: '碳水', color: '#10B981', val: '45%' },
              { name: '蛋白质', color: '#3B82F6', val: '23%' },
              { name: '脂肪', color: '#F59E0B', val: '15%' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600">{item.name}</span>
                <span className="text-gray-400">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">健康提醒</h2>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {reminders.map((reminder, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  reminder.type === 'warning' ? 'bg-amber-50' : 'bg-blue-50'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    reminder.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                  }`}
                />
                <p className="text-sm text-gray-700">{reminder.text}</p>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
