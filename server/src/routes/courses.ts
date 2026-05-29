import { Router } from 'express'
import { getCourseByBvId } from '../services/cache.js'

const router = Router()

router.get('/:bvId', (req, res) => {
  try {
    const course = getCourseByBvId(req.params.bvId)
    if (!course) {
      res.status(404).json({ error: '课程未找到' })
      return
    }
    res.json(course)
  } catch (err) {
    console.error('Course detail error:', err)
    res.status(500).json({ error: '获取课程详情失败' })
  }
})

export default router
