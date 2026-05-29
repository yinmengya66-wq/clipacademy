import type { Course, CourseSearchParams, Category } from '@shared/types'

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

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
