/**
 * 认证中间件
 * 验证JWT token并提取用户信息
 */
import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'nutrihealth-secret-key-2024'

// 扩展Express Request类型，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        username: string
        email: string
        role: string
      }
    }
  }
}

/**
 * 验证JWT token的中间件
 * 从Authorization头中提取token，验证并附加用户信息到request
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: '未提供认证令牌',
    })
    return
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number
      username: string
      email: string
      role: string
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch {
    res.status(401).json({
      success: false,
      error: '认证令牌无效或已过期',
    })
  }
}

/**
 * 管理员权限验证中间件
 * 在authMiddleware之后使用，验证用户是否为管理员
 */
export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: '请先登录',
    })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: '权限不足，需要管理员权限',
    })
    return
  }

  next()
}

export { JWT_SECRET }
