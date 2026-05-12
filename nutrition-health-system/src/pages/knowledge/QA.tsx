import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle, Sparkles } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const suggestedQuestions = [
  '如何改善睡眠质量？',
  '每天需要喝多少水？',
  '减肥期间如何保证营养？',
  '哪些食物富含铁元素？',
  '运动前应该吃什么？',
  '如何控制血糖？',
]

const aiResponses: Record<string, string> = {
  '如何改善睡眠质量？': '改善睡眠质量可以从以下几个方面入手：\n\n1. **规律作息**：每天固定时间上床和起床，包括周末\n2. **睡前准备**：睡前1小时避免使用电子设备，可以阅读或冥想\n3. **环境优化**：保持卧室温度在18-22°C，确保黑暗和安静\n4. **饮食调整**：避免睡前3小时进食，限制咖啡因和酒精摄入\n5. **适度运动**：白天进行适量运动，但避免睡前2小时剧烈运动\n\n如果持续失眠，建议咨询医生。',
  '每天需要喝多少水？': '成年人每天建议饮水量为1500-2000毫升（约6-8杯水）。具体需求因人而异：\n\n• 运动后需要额外补充水分\n• 天气炎热时增加饮水量\n• 孕妇和哺乳期女性需要更多水分\n• 某些疾病患者需遵医嘱调整饮水量\n\n判断水分是否充足的方法：尿液呈淡黄色说明水分摄入充足，深黄色则需要多喝水。',
  '减肥期间如何保证营养？': '减肥期间保证营养的关键是"减热量不减营养"：\n\n1. **蛋白质充足**：每天1.2-1.5g/kg体重，选择鸡胸肉、鱼、蛋、豆制品\n2. **蔬菜多样化**：每天500g以上，深色蔬菜占一半\n3. **主食替换**：用粗粮替代部分精制碳水\n4. **健康脂肪**：适量摄入坚果、橄榄油、鱼油\n5. **微量营养素**：注意补充钙、铁、锌和维生素\n\n建议每天热量缺口控制在300-500kcal，不要过度节食。',
}

export default function QA() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是AI健康助手，可以回答您关于营养、运动、健康生活等方面的问题。请随时向我提问！',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text?: string) => {
    const question = text || input.trim()
    if (!question) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response = aiResponses[question] || '这是一个很好的问题！根据营养学研究和健康指南，我建议您：\n\n1. 保持均衡饮食，确保各类营养素摄入充足\n2. 坚持规律运动，每周至少150分钟中等强度运动\n3. 保证充足睡眠，每天7-8小时\n4. 保持良好的心态，适当减压\n\n如需更个性化的建议，建议进行健康测评获取详细分析。'
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      }
      setMessages((prev) => [...prev, aiMsg])
      setTyping(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI健康问答</h1>
        <p className="text-gray-500 mt-1">智能健康助手，随时为您解答</p>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">AI助手</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 mb-2">推荐问题：</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs hover:bg-emerald-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的健康问题..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || typing}
              className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
