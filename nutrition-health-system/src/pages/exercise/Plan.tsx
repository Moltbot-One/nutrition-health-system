import { Dumbbell, Clock, Flame, Calendar, ChevronRight } from 'lucide-react'

interface ExercisePlan {
  day: string
  exercises: {
    name: string
    type: string
    duration: number
    intensity: string
    calories: number
    description: string
  }[]
}

const weekPlan: ExercisePlan[] = [
  { day: '周一', exercises: [
    { name: '慢跑', type: '有氧', duration: 30, intensity: '中等', calories: 280, description: '保持心率在120-140之间，匀速慢跑' },
    { name: '拉伸放松', type: '柔韧', duration: 10, intensity: '低', calories: 30, description: '全身拉伸，重点关注腿部和腰部' },
  ]},
  { day: '周二', exercises: [
    { name: '哑铃训练', type: '力量', duration: 40, intensity: '中等', calories: 200, description: '上肢：哑铃弯举、肩推、俯身划船，每个动作3组x12次' },
    { name: '平板支撑', type: '核心', duration: 10, intensity: '中等', calories: 50, description: '3组x30秒，组间休息30秒' },
  ]},
  { day: '周三', exercises: [
    { name: '休息日', type: '休息', duration: 0, intensity: '无', calories: 0, description: '适当散步，保持轻度活动' },
  ]},
  { day: '周四', exercises: [
    { name: '游泳', type: '有氧', duration: 40, intensity: '中等', calories: 350, description: '自由泳和蛙泳交替，注意呼吸节奏' },
    { name: '拉伸放松', type: '柔韧', duration: 10, intensity: '低', calories: 30, description: '肩部和背部重点拉伸' },
  ]},
  { day: '周五', exercises: [
    { name: '深蹲+弓步', type: '力量', duration: 35, intensity: '中等', calories: 220, description: '下肢：深蹲4组x15次、弓步3组x12次/侧' },
    { name: '卷腹', type: '核心', duration: 10, intensity: '中等', calories: 40, description: '3组x20次，组间休息30秒' },
  ]},
  { day: '周六', exercises: [
    { name: '骑行', type: '有氧', duration: 45, intensity: '中等', calories: 320, description: '户外骑行或动感单车，保持中等速度' },
  ]},
  { day: '周日', exercises: [
    { name: '瑜伽', type: '柔韧', duration: 50, intensity: '低', calories: 150, description: '哈他瑜伽，注重呼吸和体式保持' },
  ]},
]

const typeColors: Record<string, string> = {
  '有氧': 'bg-emerald-100 text-emerald-700',
  '力量': 'bg-blue-100 text-blue-700',
  '核心': 'bg-purple-100 text-purple-700',
  '柔韧': 'bg-amber-100 text-amber-700',
  '休息': 'bg-gray-100 text-gray-500',
}

export default function ExercisePlanPage() {
  const totalCalories = weekPlan.reduce((sum, day) => sum + day.exercises.reduce((s, e) => s + e.calories, 0), 0)
  const totalDuration = weekPlan.reduce((sum, day) => sum + day.exercises.reduce((s, e) => s + e.duration, 0), 0)
  const activeDays = weekPlan.filter((d) => d.exercises.some((e) => e.type !== '休息')).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">运动处方</h1>
        <p className="text-gray-500 mt-1">根据您的健康状况定制的运动计划</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-gray-500">运动天数</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeDays}<span className="text-sm text-gray-400 font-normal">天/周</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">总运动时长</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalDuration}<span className="text-sm text-gray-400 font-normal">分钟/周</span></p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-gray-500">预计消耗</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCalories}<span className="text-sm text-gray-400 font-normal">kcal/周</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">运动强度建议</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm font-medium text-emerald-700">有氧运动</p>
            <p className="text-xs text-gray-500 mt-1">每周3-4次，每次30-45分钟</p>
            <p className="text-xs text-gray-400 mt-1">心率保持在最大心率的60-75%</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-700">力量训练</p>
            <p className="text-xs text-gray-500 mt-1">每周2-3次，每次30-40分钟</p>
            <p className="text-xs text-gray-400 mt-1">选择中等重量，每组12-15次</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm font-medium text-amber-700">柔韧训练</p>
            <p className="text-xs text-gray-500 mt-1">每天10-15分钟</p>
            <p className="text-xs text-gray-400 mt-1">运动前后拉伸，预防损伤</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {weekPlan.map((day) => (
          <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-gray-900 w-8">{day.day}</span>
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">
                {day.exercises.reduce((s, e) => s + e.duration, 0)}分钟 · {day.exercises.reduce((s, e) => s + e.calories, 0)}kcal
              </span>
            </div>
            <div className="space-y-3">
              {day.exercises.map((ex, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[ex.type] || 'bg-gray-100 text-gray-500'}`}>
                    {ex.type}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{ex.name}</span>
                    </div>
                    {ex.description && (
                      <p className="text-xs text-gray-500 mt-1 ml-6">{ex.description}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-700">{ex.duration}分钟</p>
                    <p className="text-xs text-gray-400">{ex.calories}kcal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
