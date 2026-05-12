import { useState } from 'react'
import { Search, Filter, Clock, Flame, X, ChevronRight } from 'lucide-react'

interface Recipe {
  id: string
  name: string
  image: string
  calories: number
  time: string
  difficulty: string
  tags: string[]
  ingredients: string[]
  steps: string[]
}

const recipes: Recipe[] = [
  { id: '1', name: '清蒸鲈鱼', image: '', calories: 180, time: '25分钟', difficulty: '简单', tags: ['低脂', '高蛋白'], ingredients: ['鲈鱼1条', '葱姜适量', '蒸鱼豉油2勺', '料酒1勺'], steps: ['鲈鱼处理干净，划刀', '铺葱姜，淋料酒', '大火蒸8分钟', '淋蒸鱼豉油，浇热油'] },
  { id: '2', name: '鸡胸肉沙拉', image: '', calories: 250, time: '15分钟', difficulty: '简单', tags: ['减脂', '高蛋白'], ingredients: ['鸡胸肉200g', '生菜', '番茄', '橄榄油1勺', '柠檬汁'], steps: ['鸡胸肉煮熟切片', '蔬菜洗净切好', '摆盘，淋橄榄油和柠檬汁'] },
  { id: '3', name: '糙米蔬菜饭', image: '', calories: 320, time: '40分钟', difficulty: '简单', tags: ['粗粮', '均衡'], ingredients: ['糙米100g', '胡萝卜', '豌豆', '玉米粒', '鸡蛋1个'], steps: ['糙米提前浸泡2小时', '蔬菜切丁', '煮糙米饭', '炒蔬菜丁和鸡蛋，拌入糙米饭'] },
  { id: '4', name: '紫薯燕麦粥', image: '', calories: 180, time: '30分钟', difficulty: '简单', tags: ['早餐', '粗粮'], ingredients: ['紫薯1个', '燕麦50g', '牛奶200ml'], steps: ['紫薯蒸熟压泥', '燕麦加水煮开', '加入紫薯泥和牛奶', '小火煮5分钟'] },
  { id: '5', name: '番茄牛肉汤', image: '', calories: 280, time: '60分钟', difficulty: '中等', tags: ['补铁', '高蛋白'], ingredients: ['牛腩300g', '番茄2个', '洋葱半个', '土豆1个'], steps: ['牛腩焯水切块', '番茄去皮切块', '炒香洋葱，加番茄炒出汁', '加牛肉和水炖1小时', '加土豆炖20分钟'] },
  { id: '6', name: '三文鱼牛油果碗', image: '', calories: 350, time: '20分钟', difficulty: '简单', tags: ['低脂', '高蛋白', '轻食'], ingredients: ['三文鱼100g', '牛油果半个', '糙米饭', '毛豆', '酱油'], steps: ['三文鱼切片', '牛油果切片', '糙米饭打底', '摆上三文鱼和牛油果', '淋酱油'] },
]

const allTags = ['低脂', '高蛋白', '减脂', '粗粮', '均衡', '早餐', '补铁', '轻食']

export default function Recipes() {
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const filtered = recipes.filter((r) => {
    const matchSearch = r.name.includes(search)
    const matchTag = !selectedTag || r.tags.includes(selectedTag)
    return matchSearch && matchTag
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">食谱推荐</h1>
        <p className="text-gray-500 mt-1">发现健康美味的食谱</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索食谱..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div className="h-40 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900">{recipe.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {recipe.calories}kcal
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {recipe.time}
                </span>
                <span>{recipe.difficulty}</span>
              </div>
              <div className="flex gap-1.5 mt-3">
                {recipe.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>没有找到相关食谱</p>
        </div>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedRecipe.name}</h2>
                <button onClick={() => setSelectedRecipe(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><Flame className="w-4 h-4" />{selectedRecipe.calories}kcal</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{selectedRecipe.time}</span>
                <span>{selectedRecipe.difficulty}</span>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">食材</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <ChevronRight className="w-3 h-3 text-emerald-500" />
                      {ing}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">做法</h3>
                <div className="space-y-3">
                  {selectedRecipe.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-medium shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-600 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
