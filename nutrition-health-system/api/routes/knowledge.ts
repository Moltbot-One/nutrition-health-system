/**
 * 知识库路由
 * 提供知识分类、文章列表、文章详情、AI问答等功能
 */
import { Router, type Request, type Response } from 'express'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

/**
 * 获取分类列表
 * GET /api/knowledge/categories
 */
router.get('/categories', (_req: Request, res: Response): void => {
  try {
    const categories = db.prepare(
      'SELECT category, COUNT(*) as article_count FROM knowledge_articles GROUP BY category ORDER BY article_count DESC'
    ).all()

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取分类列表失败',
    })
  }
})

/**
 * 获取文章列表
 * GET /api/knowledge/articles
 */
router.get('/articles', (req: Request, res: Response): void => {
  try {
    const { keyword, category, tag, limit = '10', offset = '0', sort = 'created_at', order = 'DESC' } = req.query

    let query = 'SELECT id, title, category, summary, tags, author, views, created_at FROM knowledge_articles WHERE 1=1'
    const params: (string | number)[] = []

    if (keyword) {
      query += ' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?)'
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }

    if (category) {
      query += ' AND category = ?'
      params.push(category as string)
    }

    if (tag) {
      query += ' AND tags LIKE ?'
      params.push(`%${tag}%`)
    }

    // 安全排序
    const allowedSorts = ['created_at', 'views', 'title']
    const sortField = allowedSorts.includes(sort as string) ? sort : 'created_at'
    const orderDir = (order as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

    query += ` ORDER BY ${sortField} ${orderDir} LIMIT ? OFFSET ?`
    params.push(Number(limit), Number(offset))

    const articles = db.prepare(query).all(...params)

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM knowledge_articles WHERE 1=1'
    const countParams: (string | number)[] = []
    if (keyword) {
      countQuery += ' AND (title LIKE ? OR content LIKE ? OR summary LIKE ?)'
      countParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }
    if (category) {
      countQuery += ' AND category = ?'
      countParams.push(category as string)
    }
    if (tag) {
      countQuery += ' AND tags LIKE ?'
      countParams.push(`%${tag}%`)
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
 * 获取文章详情
 * GET /api/knowledge/articles/:id
 */
router.get('/articles/:id', (req: Request, res: Response): void => {
  try {
    const article = db.prepare('SELECT * FROM knowledge_articles WHERE id = ?').get(req.params.id) as {
      id: number
      title: string
      category: string
      content: string
      summary: string
      tags: string
      author: string
      views: number
      created_at: string
    } | undefined

    if (!article) {
      res.status(404).json({
        success: false,
        error: '文章不存在',
      })
      return
    }

    // 增加浏览量
    db.prepare('UPDATE knowledge_articles SET views = views + 1 WHERE id = ?').run(req.params.id)

    // 获取相关文章
    const relatedArticles = db.prepare(
      'SELECT id, title, category, summary, tags, author, views, created_at FROM knowledge_articles WHERE category = ? AND id != ? ORDER BY RANDOM() LIMIT 3'
    ).all(article.category, article.id)

    res.json({
      success: true,
      data: {
        ...article,
        views: article.views + 1,
        related_articles: relatedArticles,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取文章详情失败',
    })
  }
})

/**
 * AI问答
 * POST /api/knowledge/qa
 */
router.post('/qa', authMiddleware, (req: Request, res: Response): void => {
  try {
    const { question } = req.body

    if (!question) {
      res.status(400).json({
        success: false,
        error: '请提供问题',
      })
      return
    }

    // 提取关键词（支持中文分词）
    const cleanQuestion = question.replace(/[？?！!，,。.、：:；;""''（）()【】\[\]{}]/g, ' ')
    const keywords: string[] = []

    // 按空格分割
    const parts = cleanQuestion.split(/\s+/).filter(k => k.length > 0)
    for (const part of parts) {
      if (part.length <= 4) {
        keywords.push(part)
      } else {
        // 对较长的中文片段，提取2-4字的子串作为关键词
        for (let i = 0; i < part.length - 1; i++) {
          keywords.push(part.substring(i, i + 2))
        }
      }
    }

    // 去重
    const uniqueKeywords = [...new Set(keywords.filter(k => k.length >= 2))]

    // 限制关键词数量，取前10个
    const searchKeywords = uniqueKeywords.slice(0, 10)

    // 在知识库中搜索相关文章
    const conditions: string[] = []
    const params: string[] = []

    for (const keyword of searchKeywords) {
      conditions.push('(title LIKE ? OR content LIKE ? OR tags LIKE ? OR summary LIKE ?)')
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
    }

    let matchedArticles: Array<Record<string, unknown>> = []
    if (conditions.length > 0) {
      const relevanceParts = conditions.map(c => `CASE WHEN ${c} THEN 1 ELSE 0 END`)
      const query = `SELECT *, (${relevanceParts.join('+')}) as relevance FROM knowledge_articles WHERE ${conditions.join(' OR ')} ORDER BY relevance DESC, views DESC LIMIT 5`
      matchedArticles = db.prepare(query).all(...params, ...params) as Array<Record<string, unknown>>
    }

    // 生成回答
    let answer: string

    if (matchedArticles.length > 0) {
      // 基于匹配的文章生成回答
      const articleSummaries = matchedArticles.map((a, i) => `${i + 1}. **${a.title}**：${a.summary}`).join('\n')

      const mainArticle = matchedArticles[0]
      const content = (mainArticle.content as string) || ''
      // 截取文章内容的前500字作为回答
      const contentPreview = content.length > 500 ? content.substring(0, 500) + '...' : content

      answer = `根据您的提问，我为您找到以下相关信息：\n\n${contentPreview}\n\n**相关文章推荐：**\n${articleSummaries}\n\n如需了解更多详情，请查看相关文章。`
    } else {
      // 没有匹配的文章
      answer = `抱歉，暂时没有找到与"${question}"直接相关的知识内容。\n\n建议您：\n1. 尝试使用不同的关键词提问\n2. 浏览我们的知识库分类获取相关信息\n3. 咨询专业医生或营养师获取个性化建议\n\n常见问题关键词：营养、运动、减重、血压、血糖、维生素、膳食纤维、孕期、老年健康等`
    }

    // 保存问答记录
    db.prepare(
      'INSERT INTO qa_conversations (user_id, question, answer) VALUES (?, ?, ?)'
    ).run(req.user!.id, question, answer)

    res.json({
      success: true,
      data: {
        question,
        answer,
        related_articles: matchedArticles.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category,
          summary: a.summary,
        })),
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'AI问答服务暂时不可用',
    })
  }
})

export default router
