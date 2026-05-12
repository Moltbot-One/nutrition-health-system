import { useState } from 'react'
import { ShoppingBag, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

interface DayPlan {
  day: string
  meals: {
    type: string
    name: string
    calories: number
    items: string[]
  }[]
}

const weekPlan: DayPlan[] = [
  { day: '周一', meals: [
    { type: '早餐', name: '紫薯燕麦粥+鸡蛋', calories: 320, items: ['紫薯燕麦粥', '水煮蛋1个', '牛奶1杯'] },
    { type: '午餐', name: '糙米饭+清蒸鱼', calories: 520, items: ['糙米饭1碗', '清蒸鲈鱼', '西兰花', '紫菜蛋花汤'] },
    { type: '晚餐', name: '鸡胸肉沙拉', calories: 380, items: ['鸡胸肉沙拉', '全麦面包1片', '酸奶1杯'] },
  ]},
  { day: '周二', meals: [
    { type: '早餐', name: '全麦三明治+牛奶', calories: 350, items: ['全麦三明治', '牛奶1杯', '苹果1个'] },
    { type: '午餐', name: '杂粮饭+番茄牛肉', calories: 560, items: ['杂粮饭1碗', '番茄牛肉汤', '炒时蔬'] },
    { type: '晚餐', name: '三文鱼牛油果碗', calories: 400, items: ['三文鱼牛油果碗', '味噌汤'] },
  ]},
  { day: '周三', meals: [
    { type: '早餐', name: '豆浆+全麦面包', calories: 280, items: ['豆浆1杯', '全麦面包2片', '鸡蛋1个'] },
    { type: '午餐', name: '糙米饭+白灼虾', calories: 480, items: ['糙米饭1碗', '白灼虾', '蒜蓉菜心', '冬瓜汤'] },
    { type: '晚餐', name: '蔬菜汤+杂粮馒头', calories: 320, items: ['蔬菜浓汤', '杂粮馒头1个', '凉拌黄瓜'] },
  ]},
  { day: '周四', meals: [
    { type: '早餐', name: '酸奶水果碗', calories: 300, items: ['酸奶1杯', '混合坚果', '蓝莓', '燕麦片'] },
    { type: '午餐', name: '全麦意面+鸡胸肉', calories: 540, items: ['全麦意面', '烤鸡胸肉', '蔬菜沙拉'] },
    { type: '晚餐', name: '清蒸鲈鱼+糙米粥', calories: 360, items: ['清蒸鲈鱼', '糙米粥', '炒菠菜'] },
  ]},
  { day: '周五', meals: [
    { type: '早餐', name: '小米粥+鸡蛋饼', calories: 330, items: ['小米粥1碗', '鸡蛋饼', '小番茄'] },
    { type: '午餐', name: '杂粮饭+宫保鸡丁', calories: 550, items: ['杂粮饭1碗', '宫保鸡丁', '清炒豆角'] },
    { type: '晚餐', name: '蔬菜沙拉+全麦面包', calories: 300, items: ['凯撒沙拉', '全麦面包1片', '橙汁'] },
  ]},
  { day: '周六', meals: [
    { type: '早餐', name: '牛奶麦片+水果', calories: 310, items: ['牛奶麦片', '香蕉1根', '核桃3个'] },
    { type: '午餐', name: '糙米饭+红烧豆腐', calories: 490, items: ['糙米饭1碗', '红烧豆腐', '炒西兰花', '番茄蛋汤'] },
    { type: '晚餐', name: '三文鱼+蔬菜', calories: 420, items: ['煎三文鱼', '烤蔬菜', '藜麦沙拉'] },
  ]},
  { day: '周日', meals: [
    { type: '早餐', name: '豆浆+包子', calories: 340, items: ['豆浆1杯', '素菜包2个', '鸡蛋1个'] },
    { type: '午餐', name: '杂粮饭+清蒸排骨', calories: 580, items: ['杂粮饭1碗', '清蒸排骨', '炒时蔬', '紫菜汤'] },
    { type: '晚餐', name: '蔬菜粥+馒头', calories: 280, items: ['蔬菜粥', '杂粮馒头', '凉拌木耳'] },
  ]},
]

const shoppingList = [
  { category: '主食', items: ['糙米 1kg', '全麦面包 1袋', '燕麦片 500g', '杂粮馒头 4个', '全麦意面 1包'] },
  { category: '蛋白质', items: ['鸡胸肉 500g', '鲈鱼 1条', '三文鱼 200g', '鸡蛋 10个', '豆腐 2块'] },
  { category: '蔬菜', items: ['西兰花 2个', '菠菜 1把', '番茄 4个', '黄瓜 2根', '菜心 1把'] },
  { category: '水果', items: ['苹果 3个', '香蕉 3根', '蓝莓 1盒', '橙子 3个'] },
  { category: '乳制品', items: ['牛奶 2L', '酸奶 4杯'] },
]

export default function DietPlan() {
  const [expandedDay, setExpandedDay] = useState<string | null>('周一')
  const [showShopping, setShowShopping] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleRegenerate = () => {
    setGenerating(true)
    setTimeout(() => setGenerating(false), 1500)
  }

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">膳食方案</h1>
          <p className="text-gray-500 mt-1">根据您的健康目标定制的膳食计划</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? '生成中...' : '重新生成'}
          </button>
          <button
            onClick={() => setShowShopping(!showShopping)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            购物清单
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {weekPlan.map((day) => (
          <div key={day.day} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => toggleDay(day.day)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{day.day}</span>
                <span className="text-xs text-gray-400">
                  {day.meals.reduce((s, m) => s + m.calories, 0)}kcal
                </span>
              </div>
              {expandedDay === day.day ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {expandedDay === day.day && (
              <div className="px-4 pb-4 space-y-3">
                {day.meals.map((meal) => (
                  <div key={meal.type} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        {meal.type}
                      </span>
                      <span className="text-xs text-gray-400">{meal.calories}kcal</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{meal.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{meal.items.join('、')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showShopping && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-500" />
                  一周购物清单
                </h2>
                <button onClick={() => setShowShopping(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                {shoppingList.map((cat) => (
                  <div key={cat.category}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{cat.category}</h3>
                    <div className="space-y-1">
                      {cat.items.map((item) => (
                        <label key={item} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="checkbox" className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
