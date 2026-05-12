/**
 * 应用主入口
 * 配置Express应用，注册中间件和路由
 */
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 初始化数据库（导入即执行建表和初始数据插入）
import './database.js'

// 导入路由
import authRoutes from './routes/auth.js'
import assessmentRoutes from './routes/assessments.js'
import dietRoutes from './routes/diet.js'
import exerciseRoutes from './routes/exercise.js'
import knowledgeRoutes from './routes/knowledge.js'
import reportRoutes from './routes/reports.js'
import adminRoutes from './routes/admin.js'

// 注册API路由
app.use('/api/auth', authRoutes)
app.use('/api/assessments', assessmentRoutes)
app.use('/api/diet', dietRoutes)
app.use('/api/exercise', exerciseRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/admin', adminRoutes)

// 健康检查接口
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

// 错误处理中间件
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', error.message)
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
  })
})

// 404处理
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API接口不存在',
  })
})

export default app
