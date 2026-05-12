import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import api from '@/utils/api'

interface Question {
  id: string
  text: string
  options: string[]
}

interface AssessmentType {
  id: string
  name: string
  description: string
  questions: Question[]
}

export default function Questionnaire() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const type = searchParams.get('type') || 'general'

  const [assessmentType, setAssessmentType] = useState<AssessmentType | null>(null)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get<AssessmentType[]>('/assessments/types').then((types) => {
      const found = types.find((t) => t.id === type)
      if (found) {
        setAssessmentType(found)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [type])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    )
  }

  if (!assessmentType) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">未找到测评类型</p>
        <button onClick={() => navigate('/assessment')} className="mt-4 text-emerald-600 hover:underline">
          返回测评首页
        </button>
      </div>
    )
  }

  const questions = assessmentType.questions
  const progress = ((current + 1) / questions.length) * 100
  const answered = Object.keys(answers).length
  const allAnswered = answered === questions.length

  const handleAnswer = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex })
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const result = await api.post<{ id: number; type: string; score: number; riskLevel: string; suggestions: string[] }>(
        '/assessments',
        { type, answers }
      )
      navigate(`/assessment/result/${result.id}`, { state: result })
    } catch {
      navigate('/assessment')
    } finally {
      setSubmitting(false)
    }
  }

  const question = questions[current]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{assessmentType.name}</h1>
        <p className="text-gray-500 mt-1">{assessmentType.description}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>第 {current + 1} 题 / 共 {questions.length} 题</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">{question.text}</h2>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  answers[question.id] === index
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[question.id] === index
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[question.id] === index && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            上一题
          </button>

          {current === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? '提交中...' : '提交测评'}
            </button>
          ) : (
            <button
              onClick={() => setCurrent(current + 1)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-600 hover:text-emerald-700"
            >
              下一题
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
              i === current
                ? 'bg-emerald-500 text-white'
                : answers[q.id] !== undefined
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
