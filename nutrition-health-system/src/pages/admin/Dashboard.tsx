import ReactECharts from 'echarts-for-react'
import { Users, FileText, BookOpen, TrendingUp } from 'lucide-react'

const statsCards = [
  { label: '总用户数', value: '1,286', change: '+12%', icon: Users, color: 'emerald' },
  { label: '文章数量', value: '156', change: '+5%', icon: FileText, color: 'blue' },
  { label: '食谱数量', value: '89', change: '+8%', icon: BookOpen, color: 'amber' },
  { label: '活跃率', value: '68%', change: '+3%', icon: TrendingUp, color: 'purple' },
]

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-purple-50 text-purple-600',
}

export default function AdminDashboard() {
  const userGrowthOption = {
    tooltip: { trigger: 'axis' },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
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
        type: 'line',
        data: [820, 932, 1050, 1120, 1200, 1286],
        smooth: true,
        lineStyle: { color: '#10B981', width: 2 },
        itemStyle: { color: '#10B981' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.15)' }, { offset: 1, color: 'rgba(16,185,129,0)' }] } },
      },
    ],
  }

  const activityOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['测评', '膳食记录', '运动记录'], bottom: 0 },
    grid: { top: 20, right: 20, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#E5E7EB' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9CA3AF' },
      splitLine: { lineStyle: { color: '#F3F4F6' } },
    },
    series: [
      { name: '测评', type: 'bar', data: [120, 150, 180, 200, 220, 250], itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }, barWidth: '20%' },
      { name: '膳食记录', type: 'bar', data: [350, 400, 420, 480, 520, 560], itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }, barWidth: '20%' },
      { name: '运动记录', type: 'bar', data: [200, 230, 260, 280, 310, 340], itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] }, barWidth: '20%' },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-500 mt-1">系统数据概览与管理</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">用户增长趋势</h2>
          <ReactECharts option={userGrowthOption} style={{ height: '280px' }} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">平台活跃度</h2>
          <ReactECharts option={activityOption} style={{ height: '280px' }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近动态</h2>
        <div className="space-y-3">
          {[
            { text: '新用户 张三 完成注册', time: '5分钟前', type: 'user' },
            { text: '用户 李四 完成健康测评', time: '15分钟前', type: 'assessment' },
            { text: '新文章《夏季饮食指南》已发布', time: '1小时前', type: 'article' },
            { text: '新食谱「低卡沙拉」已添加', time: '2小时前', type: 'recipe' },
            { text: '用户 王五 记录了今日膳食', time: '3小时前', type: 'diet' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
