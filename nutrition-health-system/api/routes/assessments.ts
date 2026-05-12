/**
 * 健康测评路由
 * 提供健康测评类型列表、提交测评、获取测评详情和历史记录
 */
import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// 测评类型定义
const assessmentTypes = [
  {
    id: 'general',
    name: '通用健康测评',
    description: '基于BMI、生活方式、饮食习惯、健康指标综合评估您的健康状况',
    questions: [
      { id: 'bmi', text: '您的BMI指数范围', options: ['<18.5偏瘦', '18.5-24正常', '24-28超重', '≥28肥胖'] },
      { id: 'exercise_freq', text: '每周运动频率', options: ['几乎不运动', '1-2次', '3-4次', '5次以上'] },
      { id: 'diet_balance', text: '饮食均衡程度', options: ['经常外卖', '偶尔注意', '基本均衡', '非常注重'] },
      { id: 'sleep_quality', text: '睡眠质量', options: ['经常失眠', '偶尔不好', '一般', '很好'] },
      { id: 'stress_level', text: '压力水平', options: ['非常大', '较大', '一般', '较小'] },
      { id: 'smoking', text: '吸烟情况', options: ['每天吸烟', '偶尔吸烟', '已戒烟', '从不吸烟'] },
      { id: 'drinking', text: '饮酒情况', options: ['经常饮酒', '偶尔饮酒', '很少饮酒', '从不饮酒'] },
      { id: 'water_intake', text: '每日饮水量', options: ['<500ml', '500-1000ml', '1000-1500ml', '>1500ml'] },
    ],
  },
  {
    id: 'pregnant',
    name: '孕妇健康测评',
    description: '关注孕期营养、体重管理、微量元素补充等方面的健康评估',
    questions: [
      { id: 'pregnancy_stage', text: '孕期阶段', options: ['孕早期(1-3月)', '孕中期(4-6月)', '孕晚期(7-9月)', '备孕期'] },
      { id: 'weight_gain', text: '体重增长情况', options: ['增长过快', '增长正常', '增长不足', '尚未关注'] },
      { id: 'folic_acid', text: '叶酸补充情况', options: ['未补充', '偶尔补充', '规律补充', '不清楚'] },
      { id: 'calcium_intake', text: '钙摄入情况', options: ['不足', '一般', '充足', '不清楚'] },
      { id: 'iron_status', text: '铁营养状况', options: ['贫血', '偏低', '正常', '不清楚'] },
      { id: 'dha_intake', text: 'DHA摄入情况', options: ['未补充', '偶尔吃鱼', '规律补充', '不清楚'] },
      { id: 'nausea', text: '孕吐情况', options: ['严重', '中度', '轻度', '无'] },
      { id: 'mood', text: '情绪状态', options: ['焦虑抑郁', '波动较大', '偶尔低落', '稳定良好'] },
    ],
  },
  {
    id: 'elderly',
    name: '老年健康测评',
    description: '关注慢性病、骨密度、认知功能等方面的健康评估',
    questions: [
      { id: 'chronic_disease', text: '慢性病情况', options: ['3种以上', '1-2种', '无', '不清楚'] },
      { id: 'bone_health', text: '骨骼健康状况', options: ['骨质疏松', '骨量减少', '正常', '未检查'] },
      { id: 'cognitive', text: '记忆力变化', options: ['明显下降', '有所下降', '基本正常', '良好'] },
      { id: 'mobility', text: '行动能力', options: ['需要辅助', '行动缓慢', '基本正常', '灵活'] },
      { id: 'appetite', text: '食欲状况', options: ['很差', '一般', '较好', '很好'] },
      { id: 'social', text: '社交活动', options: ['很少', '偶尔', '经常', '非常活跃'] },
      { id: 'medication', text: '用药情况', options: ['5种以上', '2-4种', '1种', '无'] },
      { id: 'fall_risk', text: '跌倒风险', options: ['曾跌倒', '偶尔不稳', '较稳定', '很稳定'] },
    ],
  },
  {
    id: 'chronic_disease',
    name: '慢病风险评估',
    description: '心血管、糖尿病、代谢综合征等慢性疾病风险评估',
    questions: [
      { id: 'family_history', text: '家族病史', options: ['多种慢病', '1-2种', '无', '不清楚'] },
      { id: 'waistline', text: '腰围情况', options: ['男≥90cm/女≥85cm', '接近标准', '正常', '不清楚'] },
      { id: 'blood_pressure', text: '血压状况', options: ['高血压', '偏高', '正常', '不清楚'] },
      { id: 'blood_sugar', text: '血糖状况', options: ['糖尿病', '偏高', '正常', '不清楚'] },
      { id: 'blood_lipid', text: '血脂状况', options: ['异常', '偏高', '正常', '不清楚'] },
      { id: 'exercise', text: '运动习惯', options: ['久坐不动', '偶尔运动', '规律运动', '经常运动'] },
      { id: 'diet_habit', text: '饮食习惯', options: ['高油高盐', '一般', '较健康', '非常健康'] },
      { id: 'sleep', text: '睡眠时长', options: ['<5小时', '5-6小时', '6-8小时', '>8小时'] },
    ],
  },
]

/**
 * 通用健康测评评分算法
 */
function calculateGeneralScore(answers: Record<string, number>): { score: number; riskLevel: string; suggestions: string[] } {
  let score = 0
  const suggestions: string[] = []

  // BMI评分（0-20分）
  const bmiScore = [10, 20, 12, 5][answers.bmi || 0]
  score += bmiScore
  if (answers.bmi === 0) suggestions.push('您的体重偏轻，建议增加营养摄入，保证蛋白质和碳水化合物的充足供给')
  if (answers.bmi === 2) suggestions.push('您的体重超重，建议控制饮食总热量，增加运动量，目标每周减重0.5-1kg')
  if (answers.bmi === 3) suggestions.push('您的体重肥胖，建议咨询营养师制定减重方案，每天减少300-500kcal热量摄入')

  // 运动频率评分（0-15分）
  const exerciseScore = [2, 8, 12, 15][answers.exercise_freq || 0]
  score += exerciseScore
  if (answers.exercise_freq <= 1) suggestions.push('运动量不足，建议每周至少进行150分钟中等强度有氧运动，如快走、游泳')

  // 饮食均衡评分（0-20分）
  const dietScore = [5, 10, 16, 20][answers.diet_balance || 0]
  score += dietScore
  if (answers.diet_balance <= 1) suggestions.push('饮食不够均衡，建议每天摄入12种以上食物，多吃蔬菜水果和全谷物')

  // 睡眠质量评分（0-15分）
  const sleepScore = [3, 8, 11, 15][answers.sleep_quality || 0]
  score += sleepScore
  if (answers.sleep_quality <= 1) suggestions.push('睡眠质量不佳，建议保持规律作息，睡前避免使用电子设备')

  // 压力水平评分（0-10分）
  const stressScore = [2, 5, 8, 10][answers.stress_level || 0]
  score += stressScore
  if (answers.stress_level <= 1) suggestions.push('压力较大，建议学习放松技巧如冥想、深呼吸，适当运动缓解压力')

  // 吸烟评分（0-10分）
  const smokingScore = [0, 5, 8, 10][answers.smoking || 0]
  score += smokingScore
  if (answers.smoking === 0) suggestions.push('吸烟严重危害健康，强烈建议戒烟，可寻求戒烟门诊帮助')

  // 饮酒评分（0-5分）
  const drinkingScore = [1, 3, 4, 5][answers.drinking || 0]
  score += drinkingScore
  if (answers.drinking === 0) suggestions.push('饮酒过量有害健康，建议限制饮酒量，男性每天不超过25g酒精')

  // 饮水评分（0-5分）
  const waterScore = [1, 2, 4, 5][answers.water_intake || 0]
  score += waterScore
  if (answers.water_intake <= 1) suggestions.push('饮水量不足，建议每天饮水1500-1700ml，少量多次饮用')

  const riskLevel = score >= 80 ? '低风险' : score >= 60 ? '中风险' : score >= 40 ? '较高风险' : '高风险'
  if (suggestions.length === 0) suggestions.push('您的健康状况良好，请继续保持健康的生活方式')

  return { score, riskLevel, suggestions }
}

/**
 * 孕妇健康测评评分算法
 */
function calculatePregnantScore(answers: Record<string, number>): { score: number; riskLevel: string; suggestions: string[] } {
  let score = 0
  const suggestions: string[] = []

  // 孕期阶段评分
  score += [10, 12, 10, 15][answers.pregnancy_stage || 0]

  // 体重增长评分
  const weightScore = [5, 15, 8, 10][answers.weight_gain || 0]
  score += weightScore
  if (answers.weight_gain === 0) suggestions.push('体重增长过快，建议控制饮食热量，避免高糖高脂食物，适当活动')
  if (answers.weight_gain === 2) suggestions.push('体重增长不足，建议增加优质蛋白和碳水化合物的摄入')

  // 叶酸评分
  const folicScore = [3, 8, 15, 5][answers.folic_acid || 0]
  score += folicScore
  if (answers.folic_acid === 0) suggestions.push('叶酸补充非常重要，建议每天补充400μg叶酸，预防胎儿神经管缺陷')

  // 钙摄入评分
  const calciumScore = [3, 8, 15, 5][answers.calcium_intake || 0]
  score += calciumScore
  if (answers.calcium_intake <= 1) suggestions.push('钙摄入不足，建议每天摄入1000mg钙，多喝牛奶、吃豆制品')

  // 铁营养评分
  const ironScore = [2, 8, 15, 5][answers.iron_status || 0]
  score += ironScore
  if (answers.iron_status <= 1) suggestions.push('铁营养状况不佳，建议多吃红肉、动物肝脏，必要时补充铁剂')

  // DHA评分
  const dhaScore = [3, 10, 15, 5][answers.dha_intake || 0]
  score += dhaScore
  if (answers.dha_intake === 0) suggestions.push('DHA对胎儿大脑发育重要，建议每周吃2-3次深海鱼或补充DHA')

  // 孕吐评分
  const nauseaScore = [3, 8, 12, 15][answers.nausea || 0]
  score += nauseaScore
  if (answers.nausea <= 1) suggestions.push('孕吐较严重，建议少食多餐，选择清淡易消化食物，可适量补充维生素B6')

  // 情绪评分
  const moodScore = [3, 8, 12, 15][answers.mood || 0]
  score += moodScore
  if (answers.mood <= 1) suggestions.push('情绪波动较大，建议与家人多沟通，适当散步，必要时寻求心理支持')

  const riskLevel = score >= 90 ? '低风险' : score >= 70 ? '中风险' : score >= 50 ? '较高风险' : '高风险'
  if (suggestions.length === 0) suggestions.push('孕期健康状况良好，请继续保持，定期产检')

  return { score, riskLevel, suggestions }
}

/**
 * 老年健康测评评分算法
 */
function calculateElderlyScore(answers: Record<string, number>): { score: number; riskLevel: string; suggestions: string[] } {
  let score = 0
  const suggestions: string[] = []

  // 慢性病评分
  const chronicScore = [3, 8, 15, 10][answers.chronic_disease || 0]
  score += chronicScore
  if (answers.chronic_disease === 0) suggestions.push('多种慢性病并存，建议定期复查，遵医嘱用药，注意药物相互作用')

  // 骨骼健康评分
  const boneScore = [3, 8, 15, 10][answers.bone_health || 0]
  score += boneScore
  if (answers.bone_health <= 1) suggestions.push('骨骼健康状况不佳，建议补充钙和维生素D，进行适量负重运动')

  // 认知评分
  const cognitiveScore = [3, 8, 13, 15][answers.cognitive || 0]
  score += cognitiveScore
  if (answers.cognitive <= 1) suggestions.push('记忆力有所下降，建议多进行脑力活动如阅读、下棋，保持社交活动')

  // 行动能力评分
  const mobilityScore = [3, 8, 13, 15][answers.mobility || 0]
  score += mobilityScore
  if (answers.mobility <= 1) suggestions.push('行动能力受限，建议进行适度的康复运动，注意防跌倒')

  // 食欲评分
  const appetiteScore = [3, 8, 13, 15][answers.appetite || 0]
  score += appetiteScore
  if (answers.appetite <= 1) suggestions.push('食欲不佳，建议少食多餐，食物细软易消化，增加食物色香味')

  // 社交评分
  const socialScore = [5, 10, 13, 15][answers.social || 0]
  score += socialScore
  if (answers.social <= 1) suggestions.push('社交活动较少，建议多参加社区活动，保持与家人朋友的联系')

  // 用药评分
  const medicationScore = [3, 8, 12, 15][answers.medication || 0]
  score += medicationScore
  if (answers.medication === 0) suggestions.push('用药种类较多，建议定期整理药物清单，注意药物相互作用')

  // 跌倒风险评分
  const fallScore = [3, 8, 13, 15][answers.fall_risk || 0]
  score += fallScore
  if (answers.fall_risk <= 1) suggestions.push('跌倒风险较高，建议改善居家环境，安装扶手，穿防滑鞋')

  const riskLevel = score >= 90 ? '低风险' : score >= 70 ? '中风险' : score >= 50 ? '较高风险' : '高风险'
  if (suggestions.length === 0) suggestions.push('老年健康状况良好，请继续保持健康的生活方式，定期体检')

  return { score, riskLevel, suggestions }
}

/**
 * 慢病风险评估算法
 */
function calculateChronicScore(answers: Record<string, number>): { score: number; riskLevel: string; suggestions: string[] } {
  let score = 0
  const suggestions: string[] = []

  // 家族病史评分
  const familyScore = [3, 8, 15, 10][answers.family_history || 0]
  score += familyScore
  if (answers.family_history <= 1) suggestions.push('有慢病家族史，建议定期体检，关注血压、血糖、血脂指标')

  // 腰围评分
  const waistScore = [3, 8, 15, 10][answers.waistline || 0]
  score += waistScore
  if (answers.waistline === 0) suggestions.push('腹型肥胖是代谢综合征的重要指标，建议控制腰围，男性<90cm，女性<85cm')

  // 血压评分
  const bpScore = [2, 8, 15, 10][answers.blood_pressure || 0]
  score += bpScore
  if (answers.blood_pressure <= 1) suggestions.push('血压偏高，建议低盐饮食（每天<5g），规律运动，定期监测血压')

  // 血糖评分
  const bsScore = [2, 8, 15, 10][answers.blood_sugar || 0]
  score += bsScore
  if (answers.blood_sugar <= 1) suggestions.push('血糖异常，建议控制精制糖摄入，选择低GI食物，定期监测血糖')

  // 血脂评分
  const blScore = [3, 8, 15, 10][answers.blood_lipid || 0]
  score += blScore
  if (answers.blood_lipid <= 1) suggestions.push('血脂异常，建议减少饱和脂肪摄入，增加膳食纤维，每周吃2次深海鱼')

  // 运动评分
  const exerciseScore = [3, 8, 13, 15][answers.exercise || 0]
  score += exerciseScore
  if (answers.exercise <= 1) suggestions.push('缺乏运动是慢病的重要危险因素，建议每周至少150分钟中等强度运动')

  // 饮食评分
  const dietScore = [3, 8, 13, 15][answers.diet_habit || 0]
  score += dietScore
  if (answers.diet_habit === 0) suggestions.push('高油高盐饮食增加慢病风险，建议清淡饮食，每天盐<5g，油25-30g')

  // 睡眠评分
  const sleepScore = [3, 8, 13, 15][answers.sleep || 0]
  score += sleepScore
  if (answers.sleep <= 1) suggestions.push('睡眠不足影响代谢，建议保证6-8小时睡眠，保持规律作息')

  const riskLevel = score >= 90 ? '低风险' : score >= 70 ? '中风险' : score >= 50 ? '较高风险' : '高风险'
  if (suggestions.length === 0) suggestions.push('慢病风险较低，请继续保持健康的生活方式')

  return { score, riskLevel, suggestions }
}

/**
 * 获取测评类型列表
 * GET /api/assessments/types
 */
router.get('/types', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: assessmentTypes,
  })
})

/**
 * 提交测评
 * POST /api/assessments
 */
router.post('/', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { type, answers } = req.body

    if (!type || !answers) {
      res.status(400).json({
        success: false,
        error: '请提供测评类型和答案',
      })
      return
    }

    // 根据类型计算评分
    let result
    switch (type) {
      case 'general':
        result = calculateGeneralScore(answers)
        break
      case 'pregnant':
        result = calculatePregnantScore(answers)
        break
      case 'elderly':
        result = calculateElderlyScore(answers)
        break
      case 'chronic_disease':
        result = calculateChronicScore(answers)
        break
      default:
        res.status(400).json({
          success: false,
          error: '无效的测评类型',
        })
        return
    }

    // 保存测评记录
    const insertResult = db.prepare(
      'INSERT INTO health_assessments (user_id, type, score, risk_level, answers, suggestions) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      req.user!.id,
      type,
      result.score,
      result.riskLevel,
      JSON.stringify(answers),
      JSON.stringify(result.suggestions),
    )

    res.status(201).json({
      success: true,
      data: {
        id: insertResult.lastInsertRowid,
        type,
        score: result.score,
        riskLevel: result.riskLevel,
        suggestions: result.suggestions,
      },
      message: '测评完成',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '测评提交失败',
    })
  }
})

/**
 * 获取测评历史
 * GET /api/assessments/history
 */
router.get('/history', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { type, limit = '20', offset = '0' } = req.query

    let query = 'SELECT * FROM health_assessments WHERE user_id = ?'
    const params: (string | number)[] = [req.user!.id]

    if (type) {
      query += ' AND type = ?'
      params.push(type as string)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const assessments = db.prepare(query).all(...params) as Array<{
      id: number
      type: string
      score: number
      risk_level: string
      answers: string
      suggestions: string
      created_at: string
    }>

    let countQuery = 'SELECT COUNT(*) as total FROM health_assessments WHERE user_id = ?'
    const countParams: (string | number)[] = [req.user!.id]
    if (type) {
      countQuery += ' AND type = ?'
      countParams.push(type as string)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    res.json({
      success: true,
      data: {
        items: assessments.map(a => ({
          ...a,
          answers: JSON.parse(a.answers),
          suggestions: JSON.parse(a.suggestions),
        })),
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取测评历史失败',
    })
  }
})

/**
 * 获取测评详情
 * GET /api/assessments/:id
 */
router.get('/:id', authMiddleware, (req: Request, res: Response): void => {
  try {
    const assessment = db.prepare('SELECT * FROM health_assessments WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as {
      id: number
      user_id: number
      type: string
      score: number
      risk_level: string
      answers: string
      suggestions: string
      created_at: string
    } | undefined

    if (!assessment) {
      res.status(404).json({
        success: false,
        error: '测评记录不存在',
      })
      return
    }

    res.json({
      success: true,
      data: {
        ...assessment,
        answers: JSON.parse(assessment.answers),
        suggestions: JSON.parse(assessment.suggestions),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取测评详情失败',
    })
  }
})

export default router
