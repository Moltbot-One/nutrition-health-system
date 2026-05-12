/**
 * 运动建议路由
 * 提供运动库查询、运动评估、运动处方、运动记录等功能
 */
import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取运动库
 * GET /api/exercise/library
 */
router.get('/library', (req: Request, res: Response): void => {
  try {
    const { category, intensity, keyword, limit = '20', offset = '0' } = req.query

    let query = 'SELECT * FROM exercise_library WHERE 1=1'
    const params: (string | number)[] = []

    if (category) {
      query += ' AND category = ?'
      params.push(category as string)
    }

    if (intensity) {
      query += ' AND intensity = ?'
      params.push(intensity as string)
    }

    if (keyword) {
      query += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    query += ' ORDER BY id LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const exercises = db.prepare(query).all(...params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM exercise_library WHERE 1=1'
    const countParams: (string | number)[] = []
    if (category) {
      countQuery += ' AND category = ?'
      countParams.push(category as string)
    }
    if (intensity) {
      countQuery += ' AND intensity = ?'
      countParams.push(intensity as string)
    }
    if (keyword) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)'
      countParams.push(`%${keyword}%`, `%${keyword}%`)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    res.json({
      success: true,
      data: {
        items: exercises,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取运动库失败',
    })
  }
})

/**
 * 运动评估
 * POST /api/exercise/assessment
 */
router.post('/assessment', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { fitness_level, goals, health_conditions, available_time, preferred_types } = req.body

    if (!fitness_level) {
      res.status(400).json({
        success: false,
        error: '请提供健身水平',
      })
      return
    }

    // 获取用户档案
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user!.id) as {
      age: number
      weight: number
      health_conditions: string
    } | undefined

    // 根据健身水平确定运动强度建议
    const intensityMap: Record<string, string> = {
      beginner: '低',
      intermediate: '中',
      advanced: '高',
    }
    const recommendedIntensity = intensityMap[fitness_level] || '低'

    // 获取适合的运动
    let suitableQuery = 'SELECT * FROM exercise_library WHERE intensity = ?'
    const suitableParams: (string | number)[] = [recommendedIntensity]

    if (preferred_types && preferred_types.length > 0) {
      const placeholders = preferred_types.map(() => '?').join(',')
      suitableQuery += ` AND category IN (${placeholders})`
      suitableParams.push(...preferred_types)
    }

    suitableQuery += ' LIMIT 5'
    const suitableExercises = db.prepare(suitableQuery).all(...suitableParams)

    // 计算建议运动量
    const weeklyMinutes = available_time ? available_time * 7 : 150
    const caloriesTarget = fitness_level === 'beginner' ? 1200 : fitness_level === 'intermediate' ? 1800 : 2500

    // 生成评估结果
    const assessment = {
      fitness_level,
      recommended_intensity: recommendedIntensity,
      weekly_exercise_minutes: weeklyMinutes,
      weekly_calories_target: caloriesTarget,
      suitable_exercises: suitableExercises,
      recommendations: [] as string[],
    }

    // 生成建议
    if (fitness_level === 'beginner') {
      assessment.recommendations.push('建议从低强度运动开始，如快走、太极拳')
      assessment.recommendations.push('每次运动20-30分钟，逐渐增加时间')
      assessment.recommendations.push('每周运动3-4次，给身体充分恢复时间')
    } else if (fitness_level === 'intermediate') {
      assessment.recommendations.push('可以进行中等强度运动，如慢跑、游泳')
      assessment.recommendations.push('每次运动30-45分钟')
      assessment.recommendations.push('每周运动4-5次，可加入力量训练')
    } else {
      assessment.recommendations.push('可以进行高强度运动，如跳绳、力量训练')
      assessment.recommendations.push('每次运动45-60分钟')
      assessment.recommendations.push('每周运动5-6次，注意训练计划安排')
    }

    if (profile?.age && profile.age > 60) {
      assessment.recommendations.push('年龄较大，建议选择低冲击运动，注意关节保护')
    }

    if (health_conditions) {
      assessment.recommendations.push('有健康问题，建议运动前咨询医生')
    }

    assessment.recommendations.push('运动前充分热身，运动后注意拉伸')

    res.json({
      success: true,
      data: assessment,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '运动评估失败',
    })
  }
})

/**
 * 获取运动处方
 * GET /api/exercise/plan
 */
router.get('/plan', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { goal = 'health' } = req.query

    // 获取用户档案
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user!.id) as {
      age: number
      weight: number
      gender: string
      health_conditions: string
    } | undefined

    // 获取最近的测评结果
    const latestAssessment = db.prepare(
      'SELECT * FROM health_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(req.user!.id) as {
      type: string
      score: number
      risk_level: string
      suggestions: string
    } | undefined

    // 根据目标生成运动处方
    const planTemplates: Record<string, Record<string, unknown>> = {
      health: {
        name: '健康维护运动处方',
        goal: '维持身体健康，提升心肺功能',
        frequency: '每周3-5次',
        duration: '每次30-45分钟',
        intensity: '中等强度（最大心率的60-70%）',
        weekly_plan: [
          { day: '周一', exercise: '快走30分钟', calories: 140 },
          { day: '周二', exercise: '力量训练30分钟', calories: 175 },
          { day: '周三', exercise: '休息或轻度拉伸', calories: 50 },
          { day: '周四', exercise: '游泳40分钟', calories: 330 },
          { day: '周五', exercise: '瑜伽45分钟', calories: 150 },
          { day: '周六', exercise: '骑自行车40分钟', calories: 250 },
          { day: '周日', exercise: '休息', calories: 0 },
        ],
      },
      weight_loss: {
        name: '减脂塑形运动处方',
        goal: '减少体脂，改善体型',
        frequency: '每周5-6次',
        duration: '每次40-60分钟',
        intensity: '中高强度（最大心率的65-80%）',
        weekly_plan: [
          { day: '周一', exercise: '慢跑40分钟', calories: 270 },
          { day: '周二', exercise: '力量训练40分钟', calories: 230 },
          { day: '周三', exercise: '跳绳20分钟+快走20分钟', calories: 300 },
          { day: '周四', exercise: '游泳45分钟', calories: 375 },
          { day: '周五', exercise: '力量训练40分钟', calories: 230 },
          { day: '周六', exercise: '登山60分钟', calories: 450 },
          { day: '周日', exercise: '休息或轻度活动', calories: 50 },
        ],
      },
      muscle: {
        name: '增肌力量运动处方',
        goal: '增加肌肉量，提升力量',
        frequency: '每周4-5次',
        duration: '每次45-60分钟',
        intensity: '高强度（最大心率的70-85%）',
        weekly_plan: [
          { day: '周一', exercise: '上肢力量训练50分钟', calories: 290 },
          { day: '周二', exercise: '下肢力量训练50分钟', calories: 290 },
          { day: '周三', exercise: '休息或轻度有氧', calories: 100 },
          { day: '周四', exercise: '核心训练+俯卧撑40分钟', calories: 250 },
          { day: '周五', exercise: '全身力量训练50分钟', calories: 290 },
          { day: '周六', exercise: '有氧运动30分钟', calories: 200 },
          { day: '周日', exercise: '休息', calories: 0 },
        ],
      },
      rehabilitation: {
        name: '康复运动处方',
        goal: '恢复身体功能，预防损伤',
        frequency: '每周3-4次',
        duration: '每次20-30分钟',
        intensity: '低强度（最大心率的50-60%）',
        weekly_plan: [
          { day: '周一', exercise: '太极拳30分钟', calories: 90 },
          { day: '周二', exercise: '八段锦20分钟', calories: 50 },
          { day: '周三', exercise: '休息', calories: 0 },
          { day: '周四', exercise: '快走20分钟+拉伸', calories: 110 },
          { day: '周五', exercise: '瑜伽30分钟', calories: 100 },
          { day: '周六', exercise: '轻度活动', calories: 60 },
          { day: '周日', exercise: '休息', calories: 0 },
        ],
      },
    }

    const plan = planTemplates[goal as string] || planTemplates.health

    // 根据用户情况调整
    const adjustments: string[] = []
    if (profile?.age && profile.age > 60) {
      adjustments.push('年龄较大，建议降低运动强度，增加热身和拉伸时间')
    }
    if (profile?.weight && profile.weight > 80) {
      adjustments.push('体重较大，建议选择低冲击运动如游泳、骑自行车，减少关节负担')
    }
    if (latestAssessment && latestAssessment.risk_level === '高风险') {
      adjustments.push('健康测评风险较高，建议运动前咨询医生，从低强度开始')
    }

    res.json({
      success: true,
      data: {
        ...plan,
        adjustments,
        assessment_reference: latestAssessment ? {
          type: latestAssessment.type,
          score: latestAssessment.score,
          risk_level: latestAssessment.risk_level,
        } : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取运动处方失败',
    })
  }
})

/**
 * 记录运动
 * POST /api/exercise/records
 */
router.post('/records', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { exercise_id, exercise_name, duration, calories, date, notes } = req.body

    if (!exercise_name || !duration || !date) {
      res.status(400).json({
        success: false,
        error: '请提供运动名称、时长和日期',
      })
      return
    }

    const result = db.prepare(
      'INSERT INTO exercise_records (user_id, exercise_id, exercise_name, duration, calories, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(
      req.user!.id,
      exercise_id || null,
      exercise_name,
      duration,
      calories || 0,
      date,
      notes || '',
    )

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        exercise_id,
        exercise_name,
        duration,
        calories,
        date,
        notes,
      },
      message: '运动记录添加成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '添加运动记录失败',
    })
  }
})

/**
 * 获取运动记录
 * GET /api/exercise/records
 */
router.get('/records', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { date, start_date, end_date, limit = '30', offset = '0' } = req.query

    let query = 'SELECT * FROM exercise_records WHERE user_id = ?'
    const params: (string | number)[] = [req.user!.id]

    if (date) {
      query += ' AND date = ?'
      params.push(date as string)
    }

    if (start_date && end_date) {
      query += ' AND date BETWEEN ? AND ?'
      params.push(start_date as string, end_date as string)
    }

    query += ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const records = db.prepare(query).all(...params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM exercise_records WHERE user_id = ?'
    const countParams: (string | number)[] = [req.user!.id]
    if (date) {
      countQuery += ' AND date = ?'
      countParams.push(date as string)
    }
    if (start_date && end_date) {
      countQuery += ' AND date BETWEEN ? AND ?'
      countParams.push(start_date as string, end_date as string)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    // 统计汇总
    const summary = db.prepare(`
      SELECT
        COUNT(*) as total_sessions,
        SUM(duration) as total_duration,
        SUM(calories) as total_calories
      FROM exercise_records
      WHERE user_id = ?
      ${date ? ' AND date = ?' : ''}
      ${start_date && end_date ? ' AND date BETWEEN ? AND ?' : ''}
    `).get(...countParams.slice(1)) as {
      total_sessions: number
      total_duration: number | null
      total_calories: number | null
    }

    res.json({
      success: true,
      data: {
        items: records,
        total,
        limit: Number(limit),
        offset: Number(offset),
        summary: {
          total_sessions: summary.total_sessions || 0,
          total_duration: summary.total_duration || 0,
          total_calories: summary.total_calories || 0,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取运动记录失败',
    })
  }
})

export default router
