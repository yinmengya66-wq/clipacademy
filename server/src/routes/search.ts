import { Router } from 'express'
import { searchCourses } from '../services/cache.js'
import { searchVideos, toCourse, assignCategory } from '../services/bilibili.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const {
      keyword,
      categories,
      difficulties,
      platforms,
      sort = 'play_count',
      page = '1',
      pageSize = '20',
    } = req.query

    const searchOpts = {
      keyword: keyword as string | undefined,
      categories: categories ? (categories as string).split(',') : undefined,
      difficulties: difficulties ? (difficulties as string).split(',') : undefined,
      platforms: platforms ? (platforms as string).split(',') : undefined,
      sort: sort as string,
      page: parseInt(page as string, 10) || 1,
      pageSize: Math.min(parseInt(pageSize as string, 10) || 20, 50),
    }

    let result = searchCourses(searchOpts)

    // If cache has insufficient results and a keyword is provided, try live B站 search
    if (result.courses.length < 5 && searchOpts.keyword) {
      try {
        const { videos } = await searchVideos(searchOpts.keyword, 1, 'click')
        const liveResults = videos
          .filter((v) => v.playCount >= 3000 && v.duration >= 120)
          .map((v) => toCourse(v, assignCategory(searchOpts.keyword!)))

        if (liveResults.length > 0) {
          result = {
            courses: liveResults.slice(0, searchOpts.pageSize),
            total: liveResults.length,
            page: 1,
            pageSize: searchOpts.pageSize,
            hasMore: liveResults.length > searchOpts.pageSize,
          }
        }
      } catch {
        // Live search failed, use cached results as-is
      }
    }

    res.json(result)
  } catch (err) {
    console.error('Search error:', err)
    res.status(500).json({ error: '搜索失败，请稍后重试' })
  }
})

export default router
