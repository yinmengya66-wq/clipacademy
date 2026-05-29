import { signParams } from '../utils/wbi-sign.js'
import he from 'he'

// Local type definitions (mirrors shared types to avoid cross-dir imports)
type Platform = 'xiaohongshu' | 'bilibili' | 'douyin' | 'youtube'
type Category =
  | 'basics' | 'transitions' | 'colorGrading' | 'audioDesign'
  | 'subtitles' | 'animeEdit' | 'mashup' | 'talkingHead'
  | 'ecommerce' | 'knowledgeShare' | 'varietyShow' | 'effects'
  | 'vlog' | 'beatSync'
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Course {
  id: string
  title: string
  author: string
  platform: Platform
  url: string
  category: Category
  difficulty: Difficulty
  duration: number | null
  description: string
  tags: string[]
  thumbnailURL: string | null
  createdAt: string
  updatedAt: string
  bvId?: string
  playCount?: number
  danmaku?: number
  favorites?: number
}

export interface BilibiliVideoResult {
  bvId: string
  title: string
  author: string
  coverUrl: string
  duration: number
  playCount: number
  danmaku: number
  favorites: number
  description: string
  tags: string[]
  pubdate: number
  url: string
}

interface BilibiliSearchResponse {
  code: number
  message?: string
  data?: {
    numResults: number
    numPages: number
    result?: Array<{
      bvid: string
      title: string
      author: string
      mid: number
      play: number
      video_review: number
      favorites: number
      duration: string
      description: string
      pic: string
      pubdate: number
      tag: string
      arcurl: string
    }>
  }
}

const BILIBILI_API_BASE = 'https://api.bilibili.com'

function parseDuration(dur: string): number {
  const parts = dur.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return 0
}

function cleanTitle(title: string): string {
  return he.decode(title).replace(/<em class="keyword">|<\/em>/g, '')
}

function cleanDescription(desc: string): string {
  return he.decode(desc).replace(/<[^>]+>/g, '').trim()
}

export async function searchVideos(
  keyword: string,
  page = 1,
  order: 'click' | 'pubdate' | 'stow' | 'dm' = 'click'
): Promise<{ videos: BilibiliVideoResult[]; total: number; numPages: number }> {
  const signedParams = await signParams({
    keyword,
    search_type: 'video',
    order,
    duration: '0',
    page,
  })

  const url = new URL(`${BILIBILI_API_BASE}/x/web-interface/wbi/search/type`)
  for (const [k, v] of Object.entries(signedParams)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://www.bilibili.com',
      Cookie: 'buvid3=random-uuid-for-search',
    },
  })

  if (!res.ok) {
    throw new Error(`Bilibili API returned ${res.status}`)
  }

  const json = (await res.json()) as BilibiliSearchResponse

  if (json.code !== 0) {
    throw new Error(`Bilibili API error ${json.code}: ${json.message ?? 'unknown'}`)
  }

  const videos: BilibiliVideoResult[] = (json.data?.result ?? []).map((item) => ({
    bvId: item.bvid,
    title: cleanTitle(item.title),
    author: item.author,
    coverUrl: item.pic.startsWith('http:') ? item.pic.replace('http:', 'https:') : item.pic,
    duration: parseDuration(item.duration),
    playCount: item.play,
    danmaku: item.video_review,
    favorites: item.favorites,
    description: cleanDescription(item.description),
    tags: item.tag ? item.tag.split(',').filter(Boolean) : [],
    pubdate: item.pubdate,
    url: `https://www.bilibili.com/video/${item.bvid}/`,
  }))

  return {
    videos,
    total: json.data?.numResults ?? 0,
    numPages: json.data?.numPages ?? 0,
  }
}

export function assignDifficulty(durationSeconds: number): Difficulty {
  if (durationSeconds < 600) return 'beginner'
  if (durationSeconds < 1800) return 'intermediate'
  return 'advanced'
}

export function assignCategory(keyword: string): Category {
  const kw = keyword.toLowerCase()
  const mappings: [Category, string[]][] = [
    ['transitions', ['转场']],
    ['colorGrading', ['调色', '滤镜', 'lut']],
    ['audioDesign', ['音效', 'bgm', '音频', '配音']],
    ['subtitles', ['字幕', '花字', '文字']],
    ['animeEdit', ['漫剪', '动漫', 'amv']],
    ['mashup', ['混剪', '混辑']],
    ['talkingHead', ['口播', '人物', '出镜']],
    ['ecommerce', ['电商', '带货', '商品']],
    ['knowledgeShare', ['知识', '干货', '教学']],
    ['varietyShow', ['综艺']],
    ['effects', ['特效', 'ae', '合成']],
    ['vlog', ['vlog', '日常', '旅拍']],
    ['beatSync', ['卡点', '节奏', '踩点']],
    ['basics', ['入门', '新手', '基础', '零基础', '教程', '剪映']],
  ]

  for (const [cat, keys] of mappings) {
    if (keys.some((k) => kw.includes(k))) return cat
  }
  return 'basics'
}

export function toCourse(video: BilibiliVideoResult, category: Category): Course {
  return {
    id: `bilibili-${video.bvId}`,
    title: video.title,
    author: video.author,
    platform: 'bilibili',
    url: video.url,
    category,
    difficulty: assignDifficulty(video.duration),
    duration: video.duration,
    description: video.description,
    tags: video.tags,
    thumbnailURL: video.coverUrl,
    createdAt: new Date(video.pubdate * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    bvId: video.bvId,
    playCount: video.playCount,
    danmaku: video.danmaku,
    favorites: video.favorites,
  }
}
