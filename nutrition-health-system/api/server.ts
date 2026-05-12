/**
 * 本地开发服务器入口
 * 启动Express服务器并初始化数据库
 */
import app from './app.js'

const PORT = process.env.PORT || 3001

const server = app.listen(PORT, () => {
  console.log(`服务器已启动，端口: ${PORT}`)
  console.log(`API地址: http://localhost:${PORT}/api`)
  console.log(`健康检查: http://localhost:${PORT}/api/health`)
})

process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('收到SIGINT信号')
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })
})

export default app
