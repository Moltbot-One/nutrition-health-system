/**
 * 膳食规划路由
 * 提供食物搜索、饮食记录、营养分析、食谱推荐、膳食方案生成
 */
import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 搜索食物
 * GET /api/diet/foods/search
 */
router.get('/foods/search', (req: Request, res: Response): void => {
  try {
    const { keyword, category, limit = '20', offset = '0' } = req.query

    let query = 'SELECT * FROM foods WHERE 1=1'
    const params: (string | number)[] = []

    if (keyword) {
      query += ' AND name LIKE ?'
      params.push(`%${keyword}%`)
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category as string)
    }

    query += ' ORDER BY id LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const foods = db.prepare(query).all(...params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM foods WHERE 1=1'
    const countParams: (string | number)[] = []
    if (keyword) {
      countQuery += ' AND name LIKE ?'
      countParams.push(`%${keyword}%`)
    }
    if (category) {
      countQuery += ' AND category = ?'
      countParams.push(category as string)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    res.json({
      success: true,
      data: {
        items: foods,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '搜索食物失败',
    })
  }
})

/**
 * 记录饮食
 * POST /api/diet/records
 */
router.post('/records', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { food_id, food_name, meal_type, amount, date, calories, protein, fat, carbs } = req.body

    if (!meal_type || !date) {
      res.status(400).json({
        success: false,
        error: '请提供餐次类型和日期',
      })
      return
    }

    const result = db.prepare(
      'INSERT INTO diet_records (user_id, food_id, food_name, meal_type, amount, date, calories, protein, fat, carbs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      req.user!.id,
      food_id || null,
      food_name || '',
      meal_type,
      amount || 100,
      date,
      calories || 0,
      protein || 0,
      fat || 0,
      carbs || 0,
    )

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        food_id,
        food_name,
        meal_type,
        amount,
        date,
        calories,
        protein,
        fat,
        carbs,
      },
      message: '饮食记录添加成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '添加饮食记录失败',
    })
  }
})

/**
 * 获取饮食记录
 * GET /api/diet/records
 */
router.get('/records', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { date, start_date, end_date, meal_type, limit = '30', offset = '0' } = req.query

    let query = 'SELECT * FROM diet_records WHERE user_id = ?'
    const params: (string | number)[] = [req.user!.id]

    if (date) {
      query += ' AND date = ?'
      params.push(date as string)
    }

    if (start_date && end_date) {
      query += ' AND date BETWEEN ? AND ?'
      params.push(start_date as string, end_date as string)
    }

    if (meal_type) {
      query += ' AND meal_type = ?'
      params.push(meal_type as string)
    }

    query += ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const records = db.prepare(query).all(...params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM diet_records WHERE user_id = ?'
    const countParams: (string | number)[] = [req.user!.id]
    if (date) {
      countQuery += ' AND date = ?'
      countParams.push(date as string)
    }
    if (start_date && end_date) {
      countQuery += ' AND date BETWEEN ? AND ?'
      countParams.push(start_date as string, end_date as string)
    }
    if (meal_type) {
      countQuery += ' AND meal_type = ?'
      countParams.push(meal_type as string)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    res.json({
      success: true,
      data: {
        items: records,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取饮食记录失败',
    })
  }
})

/**
 * 营养分析
 * GET /api/diet/analysis
 */
router.get('/analysis', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { start_date, end_date } = req.query

    if (!start_date || !end_date) {
      res.status(400).json({
        success: false,
        error: '请提供分析日期范围',
      })
      return
    }

    // 获取日期范围内的饮食记录汇总
    const summary = db.prepare(`
      SELECT
        COUNT(*) as record_count,
        SUM(calories) as total_calories,
        SUM(protein) as total_protein,
        SUM(fat) as total_fat,
        SUM(carbs) as total_carbs,
        COUNT(DISTINCT date) as days
      FROM diet_records
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `).get(req.user!.id, start_date, end_date) as {
      record_count: number
      total_calories: number | null
      total_protein: number | null
      total_fat: number | null
      total_carbs: number | null
      days: number
    }

    const days = summary.days || 1
    const avgCalories = Math.round((summary.total_calories || 0) / days)
    const avgProtein = Math.round((summary.total_protein || 0) / days)
    const avgFat = Math.round((summary.total_fat || 0) / days)
    const avgCarbs = Math.round((summary.total_carbs || 0) / days)

    // 获取用户档案以计算推荐摄入量
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user!.id) as {
      gender: string
      age: number
      height: number
      weight: number
    } | undefined

    // 计算推荐摄入量（简化版Harris-Benedict公式）
    let recommendedCalories = 2000
    if (profile && profile.weight && profile.height && profile.age) {
      if (profile.gender === '男') {
        recommendedCalories = Math.round(66.5 + 13.8 * profile.weight + 5 * profile.height - 6.8 * profile.age)
      } else {
        recommendedCalories = Math.round(655.1 + 9.6 * profile.weight + 1.9 * profile.height - 4.7 * profile.age)
      }
    }

    // 营养素比例分析
    const totalMacroCal = avgProtein * 4 + avgFat * 9 + avgCarbs * 4
    const proteinRatio = totalMacroCal > 0 ? Math.round((avgProtein * 4 / totalMacroCal) * 100) : 0
    const fatRatio = totalMacroCal > 0 ? Math.round((avgFat * 9 / totalMacroCal) * 100) : 0
    const carbsRatio = totalMacroCal > 0 ? 100 - proteinRatio - fatRatio : 0

    // 生成建议
    const suggestions: string[] = []
    if (avgCalories > recommendedCalories * 1.1) {
      suggestions.push(`日均热量摄入(${avgCalories}kcal)超过推荐量(${recommendedCalories}kcal)，建议适当控制`)
    } else if (avgCalories < recommendedCalories * 0.8) {
      suggestions.push(`日均热量摄入(${avgCalories}kcal)低于推荐量(${recommendedCalories}kcal)，建议适当增加`)
    }

    if (proteinRatio < 10) {
      suggestions.push('蛋白质摄入比例偏低，建议增加鱼禽蛋奶豆等优质蛋白')
    }
    if (fatRatio > 35) {
      suggestions.push('脂肪摄入比例偏高，建议减少油炸食品，选择低脂烹饪方式')
    }
    if (carbsRatio > 65) {
      suggestions.push('碳水化合物比例偏高，建议增加蛋白质和蔬菜摄入')
    }

    if (suggestions.length === 0) {
      suggestions.push('营养摄入基本均衡，请继续保持')
    }

    res.json({
      success: true,
      data: {
        period: { start_date, end_date, days },
        average: {
          calories: avgCalories,
          protein: avgProtein,
          fat: avgFat,
          carbs: avgCarbs,
        },
        recommended: {
          calories: recommendedCalories,
          protein: Math.round(recommendedCalories * 0.15 / 4),
          fat: Math.round(recommendedCalories * 0.25 / 9),
          carbs: Math.round(recommendedCalories * 0.60 / 4),
        },
        ratio: {
          protein: proteinRatio,
          fat: fatRatio,
          carbs: carbsRatio,
        },
        suggestions,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '营养分析失败',
    })
  }
})

/**
 * 食谱推荐
 * GET /api/diet/recommendations
 */
router.get('/recommendations', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { category, tags, limit = '10' } = req.query

    let query = 'SELECT * FROM recipes WHERE 1=1'
    const params: (string | number)[] = []

    if (category) {
      query += ' AND category = ?'
      params.push(category as string)
    }

    if (tags) {
      query += ' AND tags LIKE ?'
      params.push(`%${tags}%`)
    }

    query += ' ORDER BY RANDOM() LIMIT ?'
    params.push(Number(limit))

    const recipes = db.prepare(query).all(...params)

    // 解析JSON字段
    const parsedRecipes = recipes.map((r: Record<string, unknown>) => ({
      ...r,
      ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients,
      steps: typeof r.steps === 'string' ? JSON.parse(r.steps) : r.steps,
      nutrition: typeof r.nutrition === 'string' ? JSON.parse(r.nutrition) : r.nutrition,
    }))

    res.json({
      success: true,
      data: parsedRecipes,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取食谱推荐失败',
    })
  }
})

/**
 * 生成膳食方案
 * POST /api/diet/plans/generate
 */
router.post('/plans/generate', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { target_calories, meals_per_day = 3, preferences, avoid_foods } = req.body

    const targetCal = target_calories || 2000

    // 获取用户档案
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user!.id) as {
      gender: string
      age: number
      height: number
      weight: number
      dietary_preferences: string
      allergies: string
    } | undefined

    // 根据目标热量分配三餐
    const mealDistribution = meals_per_day === 3
      ? { breakfast: 0.3, lunch: 0.4, dinner: 0.3 }
      : { breakfast: 0.25, morning_snack: 0.1, lunch: 0.3, afternoon_snack: 0.1, dinner: 0.25 }

    // 获取所有食物
    const allFoods = db.prepare('SELECT * FROM foods').all() as Array<Record<string, unknown>>

    // 获取所有食谱
    let recipeQuery = 'SELECT * FROM recipes WHERE 1=1'
    const recipeParams: string[] = []
    if (preferences) {
      recipeQuery += ' AND (tags LIKE ? OR category LIKE ?)'
      recipeParams.push(`%${preferences}%`, `%${preferences}%`)
    }
    const allRecipes = db.prepare(recipeQuery).all(...recipeParams) as Array<Record<string, unknown>>

    // 简单的膳食方案生成逻辑
    const plan: Record<string, unknown> = {
      target_calories: targetCal,
      meals: {},
    }

    const mealNames: Record<string, string> = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      morning_snack: '上午加餐',
      afternoon_snack: '下午加餐',
    }

    for (const [mealKey, ratio] of Object.entries(mealDistribution)) {
      const mealCal = Math.round(targetCal * ratio)
      const mealRecipes = allRecipes
        .sort(() => Math.random() - 0.5)
        .slice(0, 2)
        .map(r => ({
          ...r,
          ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients as string) : r.ingredients,
          steps: typeof r.steps === 'string' ? JSON.parse(r.steps as string) : r.steps,
          nutrition: typeof r.nutrition === 'string' ? JSON.parse(r.nutrition as string) : r.nutrition,
        }))

      const mealFoods = allFoods
        .filter(f => {
          if (avoid_foods && (avoid_foods as string[]).includes(f.name as string)) return false
          return true
        })
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      ;(plan.meals as Record<string, unknown>)[mealKey] = {
        name: mealNames[mealKey],
        target_calories: mealCal,
        recipes: mealRecipes,
        foods: mealFoods,
      }
    }

    // 生成营养建议
    const tips: string[] = []
    if (profile?.allergies) {
      tips.push(`注意避免过敏食物：${profile.allergies}`)
    }
    if (targetCal < 1500) {
      tips.push('低热量饮食需注意保证蛋白质和微量营养素摄入')
    }
    if (targetCal > 2500) {
      tips.push('高热量饮食建议配合运动，避免体重过度增加')
    }
    tips.push('建议每天饮水1500-1700ml')
    tips.push('饮食多样化，每天摄入12种以上食物')

    ;(plan as Record<string, unknown>).tips = tips

    res.json({
      success: true,
      data: plan,
      message: '膳食方案生成成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '生成膳食方案失败',
    })
  }
})

export default router
