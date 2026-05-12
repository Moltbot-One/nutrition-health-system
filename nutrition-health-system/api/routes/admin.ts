/**
 * 管理后台路由
 * 提供用户管理、数据看板、文章管理、食谱管理等功能
 */
import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()

// 所有管理后台路由都需要管理员权限
router.use(authMiddleware, adminMiddleware)

/**
 * 获取用户列表
 * GET /api/admin/users
 */
router.get('/users', (req: Request, res: Response): void => {
  try {
    const { keyword, status, role, limit = '20', offset = '0' } = req.query

    let query = 'SELECT id, username, email, role, status, created_at, updated_at FROM users WHERE 1=1'
    const params: (string | number)[] = []

    if (keyword) {
      query += ' AND (username LIKE ? OR email LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    if (status) {
      query += ' AND status = ?'
      params.push(status as string)
    }

    if (role) {
      query += ' AND role = ?'
      params.push(role as string)
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const users = db.prepare(query).all(...params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1'
    const countParams: (string | number)[] = []
    if (keyword) {
      countQuery += ' AND (username LIKE ? OR email LIKE ?)'
      countParams.push(`%${keyword}%`, `%${keyword}%`)
    }
    if (status) {
      countQuery += ' AND status = ?'
      countParams.push(status as string)
    }
    if (role) {
      countQuery += ' AND role = ?'
      countParams.push(role as string)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    res.json({
      success: true,
      data: {
        items: users,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户列表失败',
    })
  }
})

/**
 * 修改用户状态
 * PUT /api/admin/users/:id/status
 */
router.put('/users/:id/status', (req: Request, res: Response): void => {
  try {
    const { status } = req.body

    if (!status || !['active', 'disabled'].includes(status)) {
      res.status(400).json({
        success: false,
        error: '无效的状态值，只支持 active 或 disabled',
      })
      return
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id) as { id: number } | undefined
    if (!user) {
      res.status(404).json({
        success: false,
        error: '用户不存在',
      })
      return
    }

    db.prepare('UPDATE users SET status = ?, updated_at = datetime("now", "localtime") WHERE id = ?').run(status, req.params.id)

    res.json({
      success: true,
      data: { id: Number(req.params.id), status },
      message: `用户状态已更新为${status === 'active' ? '启用' : '禁用'}`,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '修改用户状态失败',
    })
  }
})

/**
 * 数据看板统计
 * GET /api/admin/dashboard
 */
router.get('/dashboard', (_req: Request, res: Response): void => {
  try {
    // 用户统计
    const userStats = db.prepare(`
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) as disabled_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_users
      FROM users
    `).get() as {
      total_users: number
      active_users: number
      disabled_users: number
      admin_users: number
    }

    // 测评统计
    const assessmentStats = db.prepare(`
      SELECT
        COUNT(*) as total_assessments,
        SUM(CASE WHEN risk_level = '低风险' THEN 1 ELSE 0 END) as low_risk,
        SUM(CASE WHEN risk_level = '中风险' THEN 1 ELSE 0 END) as medium_risk,
        SUM(CASE WHEN risk_level = '较高风险' THEN 1 ELSE 0 END) as high_risk,
        SUM(CASE WHEN risk_level = '高风险' THEN 1 ELSE 0 END) as very_high_risk
      FROM health_assessments
    `).get() as {
      total_assessments: number
      low_risk: number
      medium_risk: number
      high_risk: number
      very_high_risk: number
    }

    // 饮食记录统计
    const dietStats = db.prepare(`
      SELECT COUNT(*) as total_records FROM diet_records
    `).get() as { total_records: number }

    // 运动记录统计
    const exerciseStats = db.prepare(`
      SELECT
        COUNT(*) as total_records,
        SUM(duration) as total_duration,
        SUM(calories) as total_calories
      FROM exercise_records
    `).get() as {
      total_records: number
      total_duration: number | null
      total_calories: number | null
    }

    // 文章统计
    const articleStats = db.prepare(`
      SELECT
        COUNT(*) as total_articles,
        SUM(views) as total_views
      FROM knowledge_articles
    `).get() as {
      total_articles: number
      total_views: number | null
    }

    // 问答统计
    const qaStats = db.prepare(`
      SELECT COUNT(*) as total_conversations FROM qa_conversations
    `).get() as { total_conversations: number }

    // 报告统计
    const reportStats = db.prepare(`
      SELECT COUNT(*) as total_reports FROM reports
    `).get() as { total_reports: number }

    // 最近7天注册用户数
    const recentUsers = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= datetime('now', '-7 days', 'localtime')
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all()

    // 热门文章
    const topArticles = db.prepare(`
      SELECT id, title, category, views FROM knowledge_articles ORDER BY views DESC LIMIT 5
    `).all()

    res.json({
      success: true,
      data: {
        users: userStats,
        assessments: assessmentStats,
        diet: dietStats,
        exercise: exerciseStats,
        articles: articleStats,
        qa: qaStats,
        reports: reportStats,
        recent_users: recentUsers,
        top_articles: topArticles,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取数据看板失败',
    })
  }
})

/**
 * 获取文章列表（管理）
 * GET /api/admin/articles
 */
router.get('/articles', (req: Request, res: Response): void => {
  try {
    const { keyword, category, limit = '10', offset = '0' } = req.query

    let query = 'SELECT * FROM knowledge_articles WHERE 1=1'
    const params: (string | number)[] = []

    if (keyword) {
      query += ' AND (title LIKE ? OR content LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category as string)
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const articles = db.prepare(query).all(...params)

    let countQuery = 'SELECT COUNT(*) as total FROM knowledge_articles WHERE 1=1'
    const countParams: (string | number)[] = []
    if (keyword) {
      countQuery += ' AND (title LIKE ? OR content LIKE ?)'
      countParams.push(`%${keyword}%`, `%${keyword}%`)
    }
    if (category) {
      countQuery += ' AND category = ?'
      countParams.push(category as string)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    res.json({
      success: true,
      data: {
        items: articles,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取文章列表失败',
    })
  }
})

/**
 * 创建文章
 * POST /api/admin/articles
 */
router.post('/articles', (req: Request, res: Response): void => {
  try {
    const { title, category, content, summary, tags, author } = req.body

    if (!title || !content || !category) {
      res.status(400).json({
        success: false,
        error: '请提供标题、分类和内容',
      })
      return
    }

    const result = db.prepare(
      'INSERT INTO knowledge_articles (title, category, content, summary, tags, author) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, category, content, summary || '', tags || '', author || '管理员')

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        title,
        category,
        content,
        summary,
        tags,
        author,
      },
      message: '文章创建成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建文章失败',
    })
  }
})

/**
 * 更新文章
 * PUT /api/admin/articles/:id
 */
router.put('/articles/:id', (req: Request, res: Response): void => {
  try {
    const article = db.prepare('SELECT id FROM knowledge_articles WHERE id = ?').get(req.params.id) as { id: number } | undefined

    if (!article) {
      res.status(404).json({
        success: false,
        error: '文章不存在',
      })
      return
    }

    const { title, category, content, summary, tags, author } = req.body

    const updates: string[] = []
    const params: (string | number)[] = []

    if (title !== undefined) { updates.push('title = ?'); params.push(title) }
    if (category !== undefined) { updates.push('category = ?'); params.push(category) }
    if (content !== undefined) { updates.push('content = ?'); params.push(content) }
    if (summary !== undefined) { updates.push('summary = ?'); params.push(summary) }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(tags) }
    if (author !== undefined) { updates.push('author = ?'); params.push(author) }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: '没有需要更新的字段',
      })
      return
    }

    params.push(Number(req.params.id))
    db.prepare(`UPDATE knowledge_articles SET ${updates.join(', ')} WHERE id = ?`).run(...params)

    res.json({
      success: true,
      message: '文章更新成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新文章失败',
    })
  }
})

/**
 * 删除文章
 * DELETE /api/admin/articles/:id
 */
router.delete('/articles/:id', (req: Request, res: Response): void => {
  try {
    const article = db.prepare('SELECT id FROM knowledge_articles WHERE id = ?').get(req.params.id) as { id: number } | undefined

    if (!article) {
      res.status(404).json({
        success: false,
        error: '文章不存在',
      })
      return
    }

    db.prepare('DELETE FROM knowledge_articles WHERE id = ?').run(req.params.id)

    res.json({
      success: true,
      message: '文章删除成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除文章失败',
    })
  }
})

/**
 * 获取食谱列表（管理）
 * GET /api/admin/recipes
 */
router.get('/recipes', (req: Request, res: Response): void => {
  try {
    const { keyword, category, limit = '10', offset = '0' } = req.query

    let query = 'SELECT * FROM recipes WHERE 1=1'
    const params: (string | number)[] = []

    if (keyword) {
      query += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category as string)
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const recipes = db.prepare(query).all(...params)

    let countQuery = 'SELECT COUNT(*) as total FROM recipes WHERE 1=1'
    const countParams: (string | number)[] = []
    if (keyword) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)'
      countParams.push(`%${keyword}%`, `%${keyword}%`)
    }
    if (category) {
      countQuery += ' AND category = ?'
      countParams.push(category as string)
    }
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number }

    res.json({
      success: true,
      data: {
        items: recipes,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取食谱列表失败',
    })
  }
})

/**
 * 创建食谱
 * POST /api/admin/recipes
 */
router.post('/recipes', (req: Request, res: Response): void => {
  try {
    const { name, category, description, ingredients, steps, nutrition, calories, tags } = req.body

    if (!name) {
      res.status(400).json({
        success: false,
        error: '请提供食谱名称',
      })
      return
    }

    const result = db.prepare(
      'INSERT INTO recipes (name, category, description, ingredients, steps, nutrition, calories, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      name,
      category || '',
      description || '',
      typeof ingredients === 'object' ? JSON.stringify(ingredients) : ingredients || '[]',
      typeof steps === 'object' ? JSON.stringify(steps) : steps || '[]',
      typeof nutrition === 'object' ? JSON.stringify(nutrition) : nutrition || '{}',
      calories || 0,
      tags || '',
    )

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        name,
        category,
        description,
        ingredients,
        steps,
        nutrition,
        calories,
        tags,
      },
      message: '食谱创建成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建食谱失败',
    })
  }
})

/**
 * 更新食谱
 * PUT /api/admin/recipes/:id
 */
router.put('/recipes/:id', (req: Request, res: Response): void => {
  try {
    const recipe = db.prepare('SELECT id FROM recipes WHERE id = ?').get(req.params.id) as { id: number } | undefined

    if (!recipe) {
      res.status(404).json({
        success: false,
        error: '食谱不存在',
      })
      return
    }

    const { name, category, description, ingredients, steps, nutrition, calories, tags } = req.body

    const updates: string[] = []
    const params: (string | number)[] = []

    if (name !== undefined) { updates.push('name = ?'); params.push(name) }
    if (category !== undefined) { updates.push('category = ?'); params.push(category) }
    if (description !== undefined) { updates.push('description = ?'); params.push(description) }
    if (ingredients !== undefined) { updates.push('ingredients = ?'); params.push(typeof ingredients === 'object' ? JSON.stringify(ingredients) : ingredients) }
    if (steps !== undefined) { updates.push('steps = ?'); params.push(typeof steps === 'object' ? JSON.stringify(steps) : steps) }
    if (nutrition !== undefined) { updates.push('nutrition = ?'); params.push(typeof nutrition === 'object' ? JSON.stringify(nutrition) : nutrition) }
    if (calories !== undefined) { updates.push('calories = ?'); params.push(calories) }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(tags) }

    if (updates.length === 0) {
      res.status(400).json({
        success: false,
        error: '没有需要更新的字段',
      })
      return
    }

    params.push(Number(req.params.id))
    db.prepare(`UPDATE recipes SET ${updates.join(', ')} WHERE id = ?`).run(...params)

    res.json({
      success: true,
      message: '食谱更新成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新食谱失败',
    })
  }
})

/**
 * 删除食谱
 * DELETE /api/admin/recipes/:id
 */
router.delete('/recipes/:id', (req: Request, res: Response): void => {
  try {
    const recipe = db.prepare('SELECT id FROM recipes WHERE id = ?').get(req.params.id) as { id: number } | undefined

    if (!recipe) {
      res.status(404).json({
        success: false,
        error: '食谱不存在',
      })
      return
    }

    db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id)

    res.json({
      success: true,
      message: '食谱删除成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除食谱失败',
    })
  }
})

export default router
