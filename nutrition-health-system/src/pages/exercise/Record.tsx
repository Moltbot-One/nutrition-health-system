import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dumbbell, Clock, Flame, Check, Search } from 'lucide-react'
import api from '@/utils/api'

interface ExerciseItem {
  id: number
  name: string
  category: string
  intensity: string
  calories_per_hour: number
  description: string
}

export default function ExerciseRecord() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState<ExerciseItem[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [duration, setDuration] = useState(30)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get<{ items: ExerciseItem[] }>('/exercise/library').then((data) => {
      setExercises(data.items || [])
    }).catch(() => {})
  }, [])

  const filtered = exercises.filter((e) =>
    e.name.includes(search) || e.category.includes(search)
  )
  const selectedExercise = exercises.find((e) => e.id === selected)
  const calories = selectedExercise ? Math.round((selectedExercise.calories_per_hour / 60) * duration) : 0

  const handleSave = async () => {
    if (!selectedExercise) return
    setSaving(true)
    try {
      await api.post('/exercise/records', {
        exercise_id: selectedExercise.id,
        exercise_name: selectedExercise.name,
        duration,
        calories,
        date: new Date().toISOString().split('T')[0],
      })
      setSaved(true)
      setTimeout(() => navigate('/exercise'), 1500)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">记录成功！</h2>
        <p className="text-gray-500 mt-2">
          {selectedExercise?.name} {duration}分钟，消耗{calories}kcal
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">运动记录</h1>
        <p className="text-gray-500 mt-1">记录您的运动情况</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">选择运动类型</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索运动..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {filtered.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelected(ex.id)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                selected === ex.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <Dumbbell className={`w-5 h-5 ${selected === ex.id ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="text-xs text-gray-600">{ex.name}</span>
              <span className="text-[10px] text-gray-400">{ex.intensity}强度</span>
            </button>
          ))}
        </div>
      </div>

      {selectedExercise && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4">运动时长</h2>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={120}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 accent-emerald-500"
              />
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{duration}分钟</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">预计消耗</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-bold text-gray-900">{calories}</span>
                    <span className="text-sm text-gray-400">kcal</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">运动类型</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{selectedExercise.category}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {saving ? '保存中...' : '保存记录'}
          </button>
        </>
      )}
    </div>
  )
}
