import { Router } from 'express'

const BV_RE = /BV[0-9A-Za-z]{10}/
const AV_RE = /av(\d+)/i

const router = Router()

router.get('/', async (req, res) => {
  try {
    const url = (req.query.url as string) ?? ''

    const bvMatch = url.match(BV_RE)
    const avMatch = url.match(AV_RE)

    let apiURL = ''
    if (bvMatch) {
      apiURL = `https://api.bilibili.com/x/web-interface/view?bvid=${bvMatch[0]}`
    } else if (avMatch) {
      apiURL = `https://api.bilibili.com/x/web-interface/view?aid=${parseInt(avMatch[1])}`
    }

    if (!apiURL) {
      res.status(400).json({ error: '无法从链接中提取视频 ID' })
      return
    }

    const resp = await fetch(apiURL, {
      headers: { Referer: 'https://www.bilibili.com' },
    })

    if (!resp.ok) {
      res.status(502).json({ error: 'B站 API 请求失败' })
      return
    }

    const json = await resp.json() as any
    if (json.code !== 0 || !json.data) {
      res.status(404).json({ error: '视频不存在或已下架' })
      return
    }

    const d = json.data
    res.json({
      title: d.title,
      author: d.owner?.name ?? '',
      url: `https://www.bilibili.com/video/${d.bvid}/`,
      bvId: d.bvid,
      duration: d.duration,
      description: (d.desc ?? '').slice(0, 200) || '暂无描述',
      thumbnailURL: (d.pic ?? '').replace(/^http:/, 'https:'),
      playCount: d.stat?.view ?? 0,
      favorites: d.stat?.favorite ?? 0,
    })
  } catch (err) {
    console.error('fetch-course error:', err)
    res.status(500).json({ error: '获取课程信息失败' })
  }
})

export default router
