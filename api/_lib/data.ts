import fs from 'fs'
import path from 'path'

interface Course {
  id: string
  title: string
  author: string
  platform: string
  url: string
  category: string
  difficulty: string
  duration: number
  description: string
  tags: string[]
  thumbnailURL: string | null
  bvId?: string
  playCount?: number
  danmaku?: number
  favorites?: number
  createdAt: string
  updatedAt: string
}

const CATEGORY_LABELS: Record<string, string> = {
  basics: '基础操作',
  transitions: '转场特效',
  colorGrading: '调色滤镜',
  audioDesign: '音效BGM',
  subtitles: '字幕动画',
  animeEdit: '漫剪',
  mashup: '混剪',
  talkingHead: '口播',
  ecommerce: '电商带货',
  knowledgeShare: '知识分享',
  varietyShow: '综艺类',
  effects: '视觉特效',
  vlog: 'Vlog日常',
  beatSync: '卡点节奏',
}

function extractBvId(url: string): string {
  const m = url.match(/BV[0-9A-Za-z]{10}/)
  return m ? m[0] : ''
}

let _courses: Course[] | null = null

function loadCourses(): Course[] {
  if (_courses) return _courses
  const filePath = path.join(process.cwd(), 'server/src/data/seed.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  _courses = JSON.parse(raw) as Course[]
  // ensure bvId is populated
  for (const c of _courses) {
    if (!c.bvId) {
      c.bvId = extractBvId(c.url)
    }
  }
  return _courses
}

function parseArray(val: string | null): string[] | undefined {
  if (!val) return undefined
  return val.split(',').filter(Boolean)
}

export function searchCourses(opts: {
  keyword?: string
  platforms?: string[]
  categories?: string[]
  difficulties?: string[]
  sort?: string
  page?: number
  pageSize?: number
}) {
  let list = [...loadCourses()]
  const kw = opts.keyword?.toLowerCase()

  if (kw) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(kw) ||
        c.author.toLowerCase().includes(kw) ||
        c.tags.some((t) => t.toLowerCase().includes(kw)) ||
        c.description.toLowerCase().includes(kw)
    )
  }

  if (opts.platforms?.length) {
    list = list.filter((c) => opts.platforms!.includes(c.platform))
  }

  if (opts.categories?.length) {
    list = list.filter((c) => opts.categories!.includes(c.category))
  }

  if (opts.difficulties?.length) {
    list = list.filter((c) => opts.difficulties!.includes(c.difficulty))
  }

  switch (opts.sort) {
    case 'play_count':
      list.sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
      break
    case 'favorites':
      list.sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0))
      break
    case 'newest':
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      break
    case 'duration':
      list.sort((a, b) => b.duration - a.duration)
      break
    default:
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  const total = list.length
  const page = opts.page ?? 1
  const pageSize = Math.min(opts.pageSize ?? 20, 50)
  const start = (page - 1) * pageSize
  const paged = list.slice(start, start + pageSize)

  return { courses: paged, total, page, pageSize, hasMore: start + pageSize < total }
}

export function getCourseByBvId(bvId: string): Course | null {
  if (!bvId) return null
  return loadCourses().find((c) => c.bvId === bvId) ?? null
}

export function getCategoryStats() {
  const courses = loadCourses()
  const map: Record<string, number> = {}
  for (const c of courses) {
    map[c.category] = (map[c.category] ?? 0) + 1
  }
  return Object.entries(map).map(([category, count]) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    count,
  }))
}

export function getSuggestions(q: string, limit = 8): string[] {
  const kw = q.toLowerCase()
  const seen = new Set<string>()
  const result: string[] = []
  for (const c of loadCourses()) {
    if (
      c.title.toLowerCase().includes(kw) &&
      !seen.has(c.title)
    ) {
      seen.add(c.title)
      result.push(c.title)
      if (result.length >= limit) break
    }
  }
  return result
}
