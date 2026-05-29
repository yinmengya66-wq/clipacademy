import type { Course, CourseSearchParams, Category } from '@shared/types'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

// ===== URL 检测 & 外部课程抓取 =====

const BV_RE = /BV[0-9A-Za-z]{10}/
const AV_RE = /av(\d+)/i
const B23_RE = /b23\.tv\/([A-Za-z0-9]+)/

const URL_PATTERNS: { platform: string; re: RegExp }[] = [
  { platform: 'bilibili', re: /bilibili\.com\/video\// },
  { platform: 'bilibili', re: /b23\.tv\// },
  { platform: 'xiaohongshu', re: /xiaohongshu\.com\// },
  { platform: 'douyin', re: /douyin\.com\// },
  { platform: 'youtube', re: /youtube\.com\/watch/ },
  { platform: 'youtube', re: /youtu\.be\// },
]

export function detectURLPlatform(url: string): string | null {
  for (const { platform, re } of URL_PATTERNS) {
    if (re.test(url)) return platform
  }
  return null
}

export function extractURL(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s]+/)
  return match ? match[0] : null
}

export function isURL(text: string): boolean {
  return /https?:\/\//.test(text.trim())
}

export async function fetchCourseFromURL(url: string): Promise<Course | null> {
  const platform = detectURLPlatform(url)
  if (platform === 'bilibili') return fetchBilibiliCourse(url)
  return null
}

async function fetchBilibiliCourse(url: string): Promise<Course | null> {
  try {
    const resp = await fetch(`${API_BASE}/fetch-course?url=${encodeURIComponent(url)}`)
    if (!resp.ok) return null
    const json = await resp.json() as any
    if (json.error) return null

    const id = `user-${Date.now()}`
    const bvMatch = url.match(BV_RE)
    const bvId = json.bvId ?? (bvMatch ? bvMatch[0] : '')

    return {
      id,
      title: json.title ?? '',
      author: json.author ?? '',
      platform: 'bilibili',
      url: json.url ?? url,
      category: guessCategory(json.title ?? '', json.description ?? '', ''),
      difficulty: 'beginner',
      duration: json.duration ?? null,
      description: json.description ?? '暂无描述',
      tags: extractTags(json.title ?? '', json.description ?? ''),
      thumbnailURL: json.thumbnailURL ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bvId,
      playCount: json.playCount ?? 0,
      favorites: json.favorites ?? 0,
    }
  } catch {
    return null
  }
}

function guessCategory(title: string, desc: string, tname: string): Category {
  const text = (title + desc + tname).toLowerCase()
  const map: [RegExp, Category][] = [
    [/转场|过渡/, 'transitions'],
    [/调色|滤镜|颜色|lut/, 'colorGrading'],
    [/音效|bgm|背景音乐|音频|配乐/, 'audioDesign'],
    [/字幕|花字|文字|标题动画/, 'subtitles'],
    [/漫剪|动漫|amv/, 'animeEdit'],
    [/混剪|踩点|卡点/, 'mashup'],
    [/口播|vlog|日常/, 'talkingHead'],
    [/带货|电商|卖货/, 'ecommerce'],
    [/知识|科普|教程|教学/, 'knowledgeShare'],
    [/综艺|搞笑|娱乐/, 'varietyShow'],
    [/特效|ae|合成|抠像|关键帧/, 'effects'],
    [/卡点|节奏|踩点/, 'beatSync'],
  ]
  for (const [re, cat] of map) {
    if (re.test(text)) return cat
  }
  return 'basics'
}

function extractTags(title: string, desc: string): string[] {
  const text = title + ' ' + desc
  const tagSet = new Set<string>()
  const patterns = [/剪映/g, /PR/g, /AE/g, /达芬奇/g, /FCPX?/g, /调色/g, /卡点/g, /转场/g, /混剪/g,
    /字幕/g, /关键帧/g, /蒙版/g, /抠像/g, /变速/g, /曲线/g]
  for (const p of patterns) {
    if (p.test(text)) tagSet.add(p.source.replace(/\\/g, ''))
  }
  return [...tagSet].slice(0, 8)
}

// ===== 用户课程本地存储 =====

const USER_COURSES_KEY = 'clipacademy-user-courses'

export function getUserCourses(): Course[] {
  try {
    return JSON.parse(localStorage.getItem(USER_COURSES_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addUserCourse(course: Course): void {
  const courses = getUserCourses()
  // 去重：同 URL 不重复添加
  if (courses.some((c) => c.url === course.url)) return
  courses.unshift(course)
  localStorage.setItem(USER_COURSES_KEY, JSON.stringify(courses))
}

export function removeUserCourse(id: string): void {
  const courses = getUserCourses().filter((c) => c.id !== id)
  localStorage.setItem(USER_COURSES_KEY, JSON.stringify(courses))
}

interface PaginatedResponse {
  courses: Course[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

interface CategoryStat {
  category: Category
  label: string
  count: number
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function searchCourses(
  params: CourseSearchParams & { page?: number; sort?: string }
): Promise<PaginatedResponse> {
  const sp = new URLSearchParams()
  if (params.keyword) sp.set('keyword', params.keyword)
  if (params.platforms?.length) sp.set('platforms', params.platforms.join(','))
  if (params.categories?.length) sp.set('categories', params.categories.join(','))
  if (params.difficulties?.length) sp.set('difficulties', params.difficulties.join(','))
  if (params.page) sp.set('page', String(params.page))
  if (params.sort) sp.set('sort', params.sort)
  const qs = sp.toString()
  return fetchJSON<PaginatedResponse>(`${API_BASE}/search${qs ? '?' + qs : ''}`)
}

export async function getCourseByBvId(bvId: string): Promise<Course | null> {
  return fetchJSON<Course | null>(`${API_BASE}/courses/${bvId}`)
}

export async function getCategoryStats(): Promise<CategoryStat[]> {
  return fetchJSON<CategoryStat[]>(`${API_BASE}/categories`)
}

export async function getSuggestions(q: string): Promise<string[]> {
  return fetchJSON<string[]>(`${API_BASE}/search/suggestions?q=${encodeURIComponent(q)}`)
}

export async function getFavoriteIds(): Promise<string[]> {
  return JSON.parse(localStorage.getItem('clipacademy-favorites') ?? '[]')
}

export async function toggleFavorite(courseId: string): Promise<boolean> {
  const favs: string[] = JSON.parse(localStorage.getItem('clipacademy-favorites') ?? '[]')
  const idx = favs.indexOf(courseId)
  if (idx >= 0) {
    favs.splice(idx, 1)
    localStorage.setItem('clipacademy-favorites', JSON.stringify(favs))
    return false
  }
  favs.push(courseId)
  localStorage.setItem('clipacademy-favorites', JSON.stringify(favs))
  return true
}

export async function getProficiency(): Promise<Record<string, number>> {
  return JSON.parse(localStorage.getItem('clipacademy-proficiency') ?? '{}')
}

export async function setProficiency(courseId: string, level: number): Promise<void> {
  const prof: Record<string, number> = JSON.parse(
    localStorage.getItem('clipacademy-proficiency') ?? '{}'
  )
  if (level === 0) {
    delete prof[courseId]
  } else {
    prof[courseId] = level
  }
  localStorage.setItem('clipacademy-proficiency', JSON.stringify(prof))
}

export function openExternalLink(url: string): void {
  window.open(url, '_blank')
}
