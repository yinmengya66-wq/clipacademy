import { Router } from 'express'
import { getCategoryStats } from '../services/cache.js'
import { CATEGORY_LABELS } from '../constants.js'

const router = Router()

router.get('/', (_req, res) => {
  try {
    const stats = getCategoryStats()
    const result = stats.map((s) => ({
      category: s.category,
      label: CATEGORY_LABELS[s.category] ?? s.category,
      count: s.count,
    }))
    res.json(result)
  } catch (err) {
    console.error('Categories error:', err)
    res.status(500).json({ error: '获取分类失败' })
  }
})

export default router
