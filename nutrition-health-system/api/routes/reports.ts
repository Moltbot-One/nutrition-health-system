/**
 * 健康报告路由
 * 提供报告列表、报告详情、生成报告等功能
 */
import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取报告列表
 * GET /api/reports
 */
router.get('/', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { type, limit = '10', offset = '0' } = req.query

    let query = 'SELECT * FROM reports WHERE user_id = ?'
    const params: (string | number)[] = [req.user!.id]

    if (type) {
      query += ' AND type = ?'
      params.push(type as string)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const reports = db.prepare(query).all(...params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM reports WHERE user_id = ?'
    const countParams: (string | number)[] = [req.user!.id]
    if (type) {
      countQuery += ' AND type = ?'
      countParams.push(type as string)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    res.json({
      success: true,
      data: {
        items: reports,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取报告列表失败',
    })
  }
})

/**
 * 获取报告详情
 * GET /api/reports/:id
 */
router.get('/:id', authMiddleware, (req: Request, res: Response): void => {
  try {
    const report = db.prepare('SELECT * FROM reports WHERE id = ? AND user_id = ?').get(req.params.id, req.user!.id) as {
      id: number
      user_id: number
      type: string
      title: string
      content: string
      data: string
      created_at: string
    } | undefined

    if (!report) {
      res.status(404).json({
        success: false,
        error: '报告不存在',
      })
      return
    }

    res.json({
      success: true,
      data: {
        ...report,
        data: report.data ? JSON.parse(report.data) : null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取报告详情失败',
    })
  }
})

/**
 * 生成报告
 * POST /api/reports/generate
 */
router.post('/generate', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { type = 'comprehensive', start_date, end_date } = req.body

    const userId = req.user!.id

    // 获取用户档案
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId) as {
      name: string
      gender: string
      age: number
      height: number
      weight: number
      bmi: number
      health_conditions: string
    } | undefined

    // 计算BMI
    let bmi = profile?.bmi
    if (!bmi && profile?.height && profile?.weight) {
      bmi = Math.round((profile.weight / (profile.height / 100) ** 2) * 10) / 10
    }

    // 获取测评数据
    const assessments = db.prepare(
      'SELECT * FROM health_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 5'
    ).all(userId) as Array<{
      type: string
      score: number
      risk_level: string
      suggestions: string
      created_at: string
    }>

    // 获取饮食记录汇总
    const dietSummary = db.prepare(`
      SELECT
        COUNT(*) as record_count,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(fat) as total_fat,
        SUM(carbs) as total_carbs,
        COUNT(DISTINCT date) as days
      FROM diet_records
      WHERE user_id = ?
      ${start_date && end_date ? ' AND date BETWEEN ? AND ?' : ''}
    `).get(
      userId,
      ...(start_date && end_date ? [start_date, end_date] : [])
    ) as {
      record_count: number
      total_calories: number | null
      total_protein: number | null
      total_fat: number | null
      total_carbs: number | null
      days: number
    }

    // 获取运动记录汇总
    const exerciseSummary = db.prepare(`
      SELECT
        COUNT(*) as total_sessions,
        SUM(duration) as total_duration,
        SUM(calories) as total_calories
      FROM exercise_records
      WHERE user_id = ?
      ${start_date && end_date ? ' AND date BETWEEN ? AND ?' : ''}
    `).get(
      userId,
      ...(start_date && end_date ? [start_date, end_date] : [])
    ) as {
      total_sessions: number
      total_duration: number | null
      total_calories: number | null
    }

    // 生成报告内容
    const dietData = {
      record_count: dietSummary.record_count || 0,
      days: dietSummary.days || 0,
      avg_calories: dietSummary.days ? Math.round((dietSummary.total_calories || 0) / dietSummary.days) : 0,
      avg_protein: dietSummary.days ? Math.round((dietSummary.total_protein || 0) / dietSummary.days) : 0,
      avg_fat: dietSummary.days ? Math.round((dietSummary.total_fat || 0) / dietSummary.days) : 0,
      avg_carbs: dietSummary.days ? Math.round((dietSummary.total_carbs || 0) / dietSummary.days) : 0,
    }

    const exerciseData = {
      total_sessions: exerciseSummary.total_sessions || 0,
      total_duration: exerciseSummary.total_duration || 0,
      total_calories: exerciseSummary.total_calories || 0,
    }

    const reportData = {
      user_profile: profile,
      bmi,
      assessments: assessments.map(a => ({
        ...a,
        suggestions: a.suggestions ? JSON.parse(a.suggestions) : [],
      })),
      diet: dietData,
      exercise: exerciseData,
      period: start_date && end_date ? { start_date, end_date } : null,
    }

    // 生成健康评分
    let healthScore = 70
    if (bmi) {
      if (bmi >= 18.5 && bmi < 24) healthScore += 10
      else if (bmi >= 24 && bmi < 28) healthScore += 5
      else healthScore -= 5
    }
    if (assessments.length > 0) {
      const latestScore = assessments[0].score
      healthScore = Math.round((healthScore + latestScore) / 2)
    }
    if (exerciseSummary.total_sessions && exerciseSummary.total_sessions >= 3) {
      healthScore += 5
    }
    healthScore = Math.min(100, Math.max(0, healthScore))

    // 生成建议
    const suggestions: string[] = []
    if (bmi && bmi >= 28) {
      suggestions.push('BMI偏高，建议控制饮食热量，增加运动量')
    } else if (bmi && bmi < 18.5) {
      suggestions.push('BMI偏低，建议增加营养摄入，保证蛋白质和碳水化合物供给')
    }

    const avgCal = dietData.avg_calories
    if (avgCal > 2500) {
      suggestions.push('日均热量摄入偏高，建议控制在合理范围内')
    } else if (avgCal > 0 && avgCal < 1200) {
      suggestions.push('日均热量摄入偏低，长期低热量饮食可能影响健康')
    }

    if ((exerciseSummary.total_sessions || 0) < 3) {
      suggestions.push('运动频率不足，建议每周至少运动3次，每次30分钟以上')
    }

    if (assessments.length > 0 && assessments[0].risk_level !== '低风险') {
      suggestions.push('健康测评显示存在风险因素，建议关注相关指标并改善生活方式')
    }

    if (suggestions.length === 0) {
      suggestions.push('整体健康状况良好，请继续保持健康的生活方式')
      suggestions.push('建议定期进行健康测评，持续关注健康变化')
    }

    // 构建报告标题
    const typeNames: Record<string, string> = {
      comprehensive: '综合健康报告',
      diet: '膳食营养报告',
      exercise: '运动健康报告',
      assessment: '健康测评报告',
    }

    const title = `${typeNames[type] || '健康报告'} - ${new Date().toLocaleDateString('zh-CN')}`

    // 构建报告内容
    const content = `## ${title}\n\n### 基本信息\n- 姓名：${profile?.name || '未设置'}\n- 性别：${profile?.gender || '未设置'}\n- 年龄：${profile?.age || '未设置'}\n- BMI：${bmi || '未计算'}\n\n### 健康评分：${healthScore}分\n\n### 测评记录\n${assessments.length > 0 ? assessments.map(a => `- ${a.type}：${a.score}分（${a.risk_level}）`).join('\n') : '暂无测评记录'}\n\n### 饮食概况\n- 记录天数：${dietData.days}天\n- 日均热量：${dietData.avg_calories}kcal\n- 日均蛋白质：${dietData.avg_protein}g\n- 日均脂肪：${dietData.avg_fat}g\n- 日均碳水：${dietData.avg_carbs}g\n\n### 运动概况\n- 运动次数：${exerciseData.total_sessions}次\n- 运动总时长：${exerciseData.total_duration}分钟\n- 消耗总热量：${exerciseData.total_calories}kcal\n\n### 健康建议\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`

    // 保存报告
    const result = db.prepare(
      'INSERT INTO reports (user_id, type, title, content, data) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, type, title, content, JSON.stringify({ ...reportData, healthScore, suggestions }))

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        type,
        title,
        health_score: healthScore,
        content,
        data: { ...reportData, healthScore, suggestions },
      },
      message: '报告生成成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '生成报告失败',
    })
  }
})

export default router
