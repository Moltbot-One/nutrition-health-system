import { useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { TrendingUp, AlertCircle } from 'lucide-react'

type Period = 'daily' | 'weekly'

const dailyData = {
  labels: ['早餐', '午餐', '晚餐', '加餐'],
  calories: [420, 580, 380, 150],
  protein: [15, 25, 18, 5],
  carbs: [55, 72, 48, 20],
  fat: [12, 18, 10, 5],
}

const weeklyData = {
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  calories: [1580, 1650, 1420, 1700, 1550, 1800, 1480],
  protein: [58, 62, 52, 65, 55, 68, 54],
  carbs: [210, 225, 195, 230, 208, 240, 200],
  fat: [48, 52, 42, 55, 47, 58, 44],
}

const gaps = [
  { name: '膳食纤维', current: 18, target: 25, unit: 'g', severity: 'high' },
  { name: '维生素C', current: 75, target: 100, unit: 'mg', severity: 'medium' },
  { name: '钙', current: 650, target: 800, unit: 'mg', severity: 'medium' },
  { name: '铁', current: 12, target: 15, unit: 'mg', severity: 'low' },
]

export default function DietAnalysis() {
  const [period, setPeriod] = useState<Period>('daily')
  const data = period === 'daily' ? dailyData : weeklyData

  const barOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['蛋白质', '碳水化合物', '脂肪'], bottom: 0 },
    grid: { top: 20, right: 20, bottom: 40, left: 50 },
    xAxis: { type: 'category', data: data.labels, axisTick: { show: false }, axisLine: { lineStyle: { color: '#E5E7EB' } } },
    yAxis: { type: 'value', axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
    series: [
      { name: '蛋白质', type: 'bar', data: data.protein, itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] }, barWidth: '20%' },
      { name: '碳水化合物', type: 'bar', data: data.carbs, itemStyle: { color: '#10B981', borderRadius: [4, 4, 0, 0] }, barWidth: '20%' },
      { name: '脂肪', type: 'bar', data: data.fat, itemStyle: { color: '#F59E0B', borderRadius: [4, 4, 0, 0] }, barWidth: '20%' },
    ],
  }

  const lineOption = {
    tooltip: { trigger: 'axis' },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: { type: 'category', data: data.labels, axisTick: { show: false }, axisLine: { lineStyle: { color: '#E5E7EB' } } },
    yAxis: { type: 'value', axisLabel: { color: '#9CA3AF' }, splitLine: { lineStyle: { color: '#F3F4F6' } } },
    series: [
      {
        name: '热量',
        type: 'line',
        data: data.calories,
        smooth: true,
        lineStyle: { color: '#10B981', width: 2 },
        itemStyle: { color: '#10B981' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.2)' }, { offset: 1, color: 'rgba(16,185,129,0)' }] } },
        markLine: period === 'weekly' ? { data: [{ yAxis: 1530, name: '目标', lineStyle: { color: '#F59E0B', type: 'dashed' } }] } : undefined,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">营养分析</h1>
          <p className="text-gray-500 mt-1">了解您的营养摄入情况</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === 'daily' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            每日
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === 'weekly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            每周
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          热量趋势
        </h2>
        <ReactECharts option={lineOption} style={{ height: '280px' }} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">营养素分布</h2>
        <ReactECharts option={barOption} style={{ height: '280px' }} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          营养缺口提示
        </h2>
        <div className="space-y-3">
          {gaps.map((gap) => {
            const percent = (gap.current / gap.target) * 100
            const severityColor = gap.severity === 'high' ? 'text-red-600 bg-red-50' : gap.severity === 'medium' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'
            return (
              <div key={gap.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColor}`}>
                    {gap.severity === 'high' ? '严重不足' : gap.severity === 'medium' ? '略有不足' : '轻微不足'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{gap.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          gap.severity === 'high' ? 'bg-red-500' : gap.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-24 text-right">
                    {gap.current}/{gap.target}{gap.unit}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
