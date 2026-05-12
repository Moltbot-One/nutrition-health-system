import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Minus, X, Check, UtensilsCrossed } from 'lucide-react'
import api from '@/utils/api'

interface FoodItem {
  id: number
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  category: string
  unit: string
}

const mealTypes = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
  { key: 'snack', label: '加餐' },
]

export default function DietRecord() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [mealType, setMealType] = useState('lunch')
  const [selectedFoods, setSelectedFoods] = useState<(FoodItem & { quantity: number })[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<FoodItem[]>([])
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (search.length > 0) {
      setSearching(true)
      const timer = setTimeout(() => {
        api.get<{ items: FoodItem[] }>(`/diet/foods/search?keyword=${encodeURIComponent(search)}`)
          .then((data) => setSearchResults(data.items || []))
          .catch(() => setSearchResults([]))
          .finally(() => setSearching(false))
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [search])

  const addFood = (food: FoodItem) => {
    const existing = selectedFoods.find((f) => f.id === food.id)
    if (existing) {
      setSelectedFoods(
        selectedFoods.map((f) =>
          f.id === food.id ? { ...f, quantity: f.quantity + 1 } : f
        )
      )
    } else {
      setSelectedFoods([...selectedFoods, { ...food, quantity: 1 }])
    }
    setShowSearch(false)
    setSearch('')
  }

  const removeFood = (id: number) => {
    setSelectedFoods(selectedFoods.filter((f) => f.id !== id))
  }

  const updateQuantity = (id: number, delta: number) => {
    setSelectedFoods(
      selectedFoods
        .map((f) => (f.id === id ? { ...f, quantity: Math.max(0, f.quantity + delta) } : f))
        .filter((f) => f.quantity > 0)
    )
  }

  const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories * f.quantity, 0)
  const totalProtein = selectedFoods.reduce((sum, f) => sum + f.protein * f.quantity, 0)
  const totalCarbs = selectedFoods.reduce((sum, f) => sum + f.carbs * f.quantity, 0)
  const totalFat = selectedFoods.reduce((sum, f) => sum + f.fat * f.quantity, 0)

  const handleSave = async () => {
    if (selectedFoods.length === 0) return
    setSaving(true)
    try {
      for (const food of selectedFoods) {
        await api.post('/diet/records', {
          food_id: food.id,
          food_name: food.name,
          meal_type: mealType,
          amount: food.quantity * 100,
          date: new Date().toISOString().split('T')[0],
          calories: Math.round(food.calories * food.quantity),
          protein: Math.round(food.protein * food.quantity * 10) / 10,
          fat: Math.round(food.fat * food.quantity * 10) / 10,
          carbs: Math.round(food.carbs * food.quantity * 10) / 10,
        })
      }
      navigate('/diet')
    } catch {
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">膳食记录</h1>
        <p className="text-gray-500 mt-1">记录您的每一餐，了解营养摄入</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">选择餐次</h2>
        <div className="flex gap-2">
          {mealTypes.map((m) => (
            <button
              key={m.key}
              onClick={() => setMealType(m.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mealType === m.key
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700">已添加食物</h2>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm hover:bg-emerald-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加食物
          </button>
        </div>

        {selectedFoods.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <UtensilsCrossed className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">还没有添加食物，点击上方按钮添加</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedFoods.map((food) => (
              <div key={food.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{food.name}</p>
                  <p className="text-xs text-gray-400">
                    {Math.round(food.calories * food.quantity)}kcal · 蛋白{(food.protein * food.quantity).toFixed(1)}g · 碳水{(food.carbs * food.quantity).toFixed(1)}g
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(food.id, -1)}
                    className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{food.quantity}</span>
                  <button
                    onClick={() => updateQuantity(food.id, 1)}
                    className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center hover:bg-emerald-200"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => removeFood(food.id)}
                    className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 ml-1"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedFoods.length > 0 && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-emerald-600">{Math.round(totalCalories)}</p>
                <p className="text-xs text-gray-500">热量(kcal)</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">{totalProtein.toFixed(1)}</p>
                <p className="text-xs text-gray-500">蛋白质(g)</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{totalCarbs.toFixed(1)}</p>
                <p className="text-xs text-gray-500">碳水(g)</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">{totalFat.toFixed(1)}</p>
                <p className="text-xs text-gray-500">脂肪(g)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedFoods.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          {saving ? '保存中...' : '保存记录'}
        </button>
      )}

      {showSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜索食物..."
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button onClick={() => { setShowSearch(false); setSearch('') }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {searching && <p className="text-center text-gray-400 text-sm py-4">搜索中...</p>}
              {!searching && searchResults.map((food) => (
                <button
                  key={food.id}
                  onClick={() => addFood(food)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{food.name}</p>
                    <p className="text-xs text-gray-400">
                      {food.calories}kcal/{food.unit} · 蛋白{food.protein}g · 碳水{food.carbs}g
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-emerald-500" />
                </button>
              ))}
              {!searching && search.length > 0 && searchResults.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">未找到相关食物</p>
              )}
              {!searching && search.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">输入关键词搜索食物</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
