import express from 'express'
import cors from 'cors'
import compression from 'compression'
import searchRouter from './routes/search.js'
import coursesRouter from './routes/courses.js'
import categoriesRouter from './routes/categories.js'
import suggestionsRouter from './routes/suggestions.js'
import fetchCourseRouter from './routes/fetch-course.js'
import { getCacheStats } from './services/cache.js'

export function createApp(): express.Application {
  const app = express()

  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'] }))
  app.use(compression())
  app.use(express.json())

  // API routes
  app.use('/api/search', searchRouter)
  app.use('/api/courses', coursesRouter)
  app.use('/api/categories', categoriesRouter)
  app.use('/api/search/suggestions', suggestionsRouter)
  app.use('/api/fetch-course', fetchCourseRouter)

  // Health + stats
  app.get('/api/health', (_req, res) => {
    const stats = getCacheStats()
    res.json({ status: 'ok', ...stats })
  })

  // Error handling
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: '服务器内部错误' })
  })

  return app
}
