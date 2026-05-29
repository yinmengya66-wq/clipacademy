import { Router } from 'express'
import { getSuggestions } from '../services/cache.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const q = (req.query.q as string) ?? ''
    if (q.length < 2) {
      res.json([])
      return
    }
    const suggestions = getSuggestions(q, 8)
    res.json(suggestions)
  } catch (err) {
    console.error('Suggestions error:', err)
    res.status(500).json({ error: '获取建议失败' })
  }
})

export default router
