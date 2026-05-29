import type { Handler, HandlerEvent } from '@netlify/functions'

const BV_RE = /BV[0-9A-Za-z]{10}/
const AV_RE = /av(\d+)/i

interface BilibiliData {
  bvid: string
  title: string
  pic: string
  duration: number
  desc: string
  owner: { name: string }
  stat: { view: number; favorite: number }
}

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    const url = event.queryStringParameters?.url ?? ''

    const bvMatch = url.match(BV_RE)
    const avMatch = url.match(AV_RE)

    let apiURL = ''
    if (bvMatch) {
      apiURL = `https://api.bilibili.com/x/web-interface/view?bvid=${bvMatch[0]}`
    } else if (avMatch) {
      apiURL = `https://api.bilibili.com/x/web-interface/view?aid=${parseInt(avMatch[1])}`
    }

    if (!apiURL) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: '无法从链接中提取视频 ID，目前仅支持 bilibili.com/video/ 链接' }),
      }
    }

    const resp = await fetch(apiURL, {
      headers: { Referer: 'https://www.bilibili.com' },
    })

    if (!resp.ok) {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'B站 API 请求失败' }),
      }
    }

    const json = await resp.json() as any
    if (json.code !== 0 || !json.data) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: '视频不存在或已下架' }),
      }
    }

    const d = json.data as BilibiliData
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: d.title,
        author: d.owner?.name ?? '',
        url: `https://www.bilibili.com/video/${d.bvid}/`,
        bvId: d.bvid,
        duration: d.duration,
        description: (d.desc ?? '').slice(0, 200) || '暂无描述',
        thumbnailURL: (d.pic ?? '').replace(/^http:/, 'https:'),
        playCount: d.stat?.view ?? 0,
        favorites: d.stat?.favorite ?? 0,
      }),
    }
  } catch (err) {
    console.error('fetch-course error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '获取课程信息失败，请稍后重试' }),
    }
  }
}
