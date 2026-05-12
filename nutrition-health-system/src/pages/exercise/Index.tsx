import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Dumbbell, Flame, Clock, TrendingUp, ChevronRight, Plus } from 'lucide-react'

const todayStats = {
  steps: 6800,
  stepsGoal: 10000,
  calories: 280,
  caloriesGoal: 500,
  duration: 35,
  durationGoal: 60,
}

const weeklyCalories = [320, 280, 0, 450, 380, 280, 0]
const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const recentExercises = [
  { name: '慢跑', duration: 30, calories: 280, time: '今天 07:00' },
  { name: '瑜伽', duration: 45, calories: 150, time: '昨天 18:00' },
  { name: '游泳', duration: 40, calories: 350, time: '5月10日 16:00' },
]

export default function ExerciseIndex() {
  const navigate = useNavigate()

  const barOption = {
    tooltip: { trigger: 'axis' },
    grid: { top: 10, right: 10, bottom: 30, left: 40 },
    xAxis: {
      type: 'category',
      data: weekLabels,
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
        type: 'bar',
        data: weeklyCalories,
        itemStyle: {
          color: '#10B981',
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '40%',
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">运动建议</h1>
          <p className="text-gray-500 mt-1">科学运动，健康生活</p>
        </div>
        <button
          onClick={() => navigate('/exercise/record')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          记录运动
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">今日步数</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{todayStats.steps}</span>
            <span className="text-sm text-gray-400">/ {todayStats.stepsGoal}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(todayStats.steps / todayStats.stepsGoal) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-gray-500">消耗热量</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{todayStats.calories}</span>
            <span className="text-sm text-gray-400">/ {todayStats.caloriesGoal}kcal</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(todayStats.calories / todayStats.caloriesGoal) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">运动时长</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900">{todayStats.duration}</span>
            <span className="text-sm text-gray-400">/ {todayStats.durationGoal}分钟</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(todayStats.duration / todayStats.durationGoal) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            本周运动消耗
          </h2>
          <ReactECharts option={barOption} style={{ height: '250px' }} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近运动</h2>
          <div className="space-y-3">
            {recentExercises.map((ex, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                    <p className="text-xs text-gray-400">{ex.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{ex.calories}kcal</p>
                  <p className="text-xs text-gray-400">{ex.duration}分钟</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/exercise/assessment')}
          className="flex items-center gap-3 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-gray-900">运动评估</p>
            <p className="text-xs text-gray-400">评估您的运动习惯</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={() => navigate('/exercise/plan')}
          className="flex items-center gap-3 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium text-gray-900">运动处方</p>
            <p className="text-xs text-gray-400">获取个性化运动方案</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
