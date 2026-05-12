import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { Utensils, Plus, ChevronRight, Flame, Apple, Droplets } from 'lucide-react'

const todayMeals = [
  { name: '早餐', time: '07:30', items: ['全麦面包', '鸡蛋', '牛奶'], calories: 420, done: true },
  { name: '午餐', time: '12:00', items: ['糙米饭', '清蒸鱼', '西兰花'], calories: 580, done: true },
  { name: '晚餐', time: '18:00', items: ['杂粮粥', '鸡胸肉沙拉'], calories: 380, done: false },
  { name: '加餐', time: '15:00', items: ['酸奶', '坚果'], calories: 150, done: false },
]

const nutrients = [
  { name: '蛋白质', current: 55, target: 65, unit: 'g', color: '#3B82F6' },
  { name: '碳水化合物', current: 220, target: 250, unit: 'g', color: '#10B981' },
  { name: '脂肪', current: 45, target: 60, unit: 'g', color: '#F59E0B' },
  { name: '膳食纤维', current: 18, target: 25, unit: 'g', color: '#8B5CF6' },
]

export default function DietIndex() {
  const navigate = useNavigate()
  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0)
  const consumedCalories = todayMeals.filter((m) => m.done).reduce((sum, m) => sum + m.calories, 0)

  const ringOption = {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['65%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          position: 'center',
          formatter: () => `${consumedCalories}`,
          fontSize: 24,
          fontWeight: 'bold',
          color: '#10B981',
        },
        data: [
          { value: consumedCalories, name: '已摄入', itemStyle: { color: '#10B981' } },
          { value: totalCalories - consumedCalories, name: '未摄入', itemStyle: { color: '#E5E7EB' } },
        ],
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">膳食规划</h1>
          <p className="text-gray-500 mt-1">合理膳食，均衡营养</p>
        </div>
        <button
          onClick={() => navigate('/diet/record')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          记录饮食
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日热量</h2>
          <ReactECharts option={ringOption} style={{ height: '200px' }} />
          <div className="flex items-center justify-center gap-6 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              已摄入 {consumedCalories}kcal
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              目标 {totalCalories}kcal
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">今日饮食</h2>
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <div
                key={meal.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meal.done ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    <Utensils className={`w-5 h-5 ${meal.done ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{meal.name}</span>
                      <span className="text-xs text-gray-400">{meal.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{meal.items.join('、')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    {meal.calories}kcal
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">营养摄入进度</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {nutrients.map((n) => {
            const percent = Math.min((n.current / n.target) * 100, 100)
            return (
              <div key={n.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{n.name}</span>
                  <span className="text-xs text-gray-400">{n.current}/{n.target}{n.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${percent}%`, backgroundColor: n.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/diet/analysis')}
          className="flex items-center gap-3 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Apple className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">营养分析</p>
            <p className="text-xs text-gray-400">查看详细营养摄入</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/diet/recipes')}
          className="flex items-center gap-3 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">食谱推荐</p>
            <p className="text-xs text-gray-400">发现健康美味食谱</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/diet/plan')}
          className="flex items-center gap-3 p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Droplets className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">膳食方案</p>
            <p className="text-xs text-gray-400">个性化膳食计划</p>
          </div>
        </button>
      </div>
    </div>
  )
}
