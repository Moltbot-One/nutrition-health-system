import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { CheckCircle, ChevronRight } from 'lucide-react'

const questions = [
  { id: 1, text: '您每周运动的频率？', options: ['几乎不运动', '1-2次', '3-4次', '5次以上'] },
  { id: 2, text: '您每次运动的时长？', options: ['少于15分钟', '15-30分钟', '30-60分钟', '60分钟以上'] },
  { id: 3, text: '您偏好的运动类型？', options: ['无', '散步/慢跑', '球类运动', '力量训练'] },
  { id: 4, text: '您运动后的恢复情况？', options: ['非常疲惫', '比较疲惫', '正常', '精力充沛'] },
  { id: 5, text: '您是否有运动损伤史？', options: ['有，较严重', '有，轻微', '没有', '不确定'] },
]

export default function ExerciseAssessment() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'quiz' | 'result'>('quiz')
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [current, setCurrent] = useState(0)

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex })
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300)
    }
  }

  const handleSubmit = () => {
    setStep('result')
  }

  const allAnswered = Object.keys(answers).length === questions.length

  if (step === 'result') {
    const radarOption = {
      tooltip: {},
      radar: {
        indicator: [
          { name: '有氧能力', max: 100 },
          { name: '力量水平', max: 100 },
          { name: '柔韧性', max: 100 },
          { name: '耐力', max: 100 },
          { name: '恢复能力', max: 100 },
        ],
        shape: 'circle',
        splitNumber: 4,
        axisName: { color: '#6B7280', fontSize: 12 },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [65, 50, 55, 70, 75],
              areaStyle: { color: 'rgba(16, 185, 129, 0.2)' },
              lineStyle: { color: '#10B981' },
              itemStyle: { color: '#10B981' },
            },
          ],
        },
      ],
    }

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">运动评估结果</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-3">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">中等运动水平</h2>
            <p className="text-gray-500 mt-1">您的运动习惯还有提升空间</p>
          </div>
          <ReactECharts option={radarOption} style={{ height: '280px' }} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">改善建议</h2>
          <div className="space-y-3">
            {[
              '建议增加有氧运动频率，每周至少3次，每次30分钟以上',
              '适当增加力量训练，提高基础代谢率',
              '运动前做好热身，运动后注意拉伸，预防运动损伤',
              '循序渐进增加运动强度，避免过度训练',
            ].map((tip, i) => (
              <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-medium shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/exercise/plan')}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          获取运动处方
        </button>
      </div>
    )
  }

  const question = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">运动评估</h1>
        <p className="text-gray-500 mt-1">了解您的运动习惯和体能水平</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>第 {current + 1} 题 / 共 {questions.length} 题</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <h2 className="text-lg font-medium text-gray-900 mb-6">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(question.id, i)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                answers[question.id] === i
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{option}</span>
                {answers[question.id] === i && <CheckCircle className="w-5 h-5 text-emerald-500" />}
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300"
          >
            上一题
          </button>
          {current === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed"
            >
              查看结果
            </button>
          ) : (
            <button
              onClick={() => setCurrent(current + 1)}
              disabled={answers[question.id] === undefined}
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 disabled:text-gray-300"
            >
              下一题 <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
