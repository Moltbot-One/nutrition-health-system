/**
 * 认证路由
 * 处理用户注册、登录、获取当前用户信息
 */
import { Router, type Request, type Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../database.js'
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js'

const router = Router()

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        error: '请提供用户名、邮箱和密码',
      })
      return
    }

    // 检查用户名是否已存在
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email) as { id: number } | undefined
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: '用户名或邮箱已存在',
      })
      return
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 插入用户
    const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashedPassword)

    // 创建用户档案
    db.prepare('INSERT INTO user_profiles (user_id) VALUES (?)').run(result.lastInsertRowid)

    // 生成JWT token
    const token = jwt.sign(
      { id: result.lastInsertRowid, username, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    res.status(201).json({
      success: true,
      data: {
        id: result.lastInsertRowid,
        username,
        email,
        token,
      },
      message: '注册成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '注册失败，请稍后重试',
    })
  }
})

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: '请提供用户名和密码',
      })
      return
    }

    // 查找用户（支持用户名或邮箱登录）
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as {
      id: number
      username: string
      email: string
      password: string
      role: string
      status: string
    } | undefined

    if (!user) {
      res.status(401).json({
        success: false,
        error: '用户名或密码错误',
      })
      return
    }

    // 检查用户状态
    if (user.status === 'disabled') {
      res.status(403).json({
        success: false,
        error: '账号已被禁用，请联系管理员',
      })
      return
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: '用户名或密码错误',
      })
      return
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' },
    )

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      },
      message: '登录成功',
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试',
    })
  }
})

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get('/me', authMiddleware, (req: Request, res: Response): void => {
  try {
    const user = db.prepare('SELECT id, username, email, role, status, created_at FROM users WHERE id = ?').get(req.user!.id) as {
      id: number
      username: string
      email: string
      role: string
      status: string
      created_at: string
    } | undefined

    if (!user) {
      res.status(404).json({
        success: false,
        error: '用户不存在',
      })
      return
    }

    // 获取用户档案
    const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user!.id) as Record<string, unknown> | undefined

    res.json({
      success: true,
      data: {
        ...user,
        profile: profile || null,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取用户信息失败',
    })
  }
})

export default router
