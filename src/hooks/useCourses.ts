import { useState, useEffect, useCallback } from 'react'
import type { Course, CourseSearchParams, Platform, Category, Difficulty } from '@shared/types'
import { searchCourses, getFavoriteIds, toggleFavorite as toggleFavApi, getProficiency as getProfApi, setProficiency as setProfApi } from '../services/api'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (params: CourseSearchParams & { sort?: string }) => {
    setLoading(true)
    const result = await searchCourses(params)
    setCourses(result.courses)
    setTotal(result.total)
    setLoading(false)
  }, [])

  useEffect(() => {
    search({})
  }, [search])

  return { courses, total, loading, search }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    getFavoriteIds().then((ids) => setFavoriteIds(new Set(ids)))
  }, [])

  const toggle = useCallback(async (courseId: string) => {
    const added = await toggleFavApi(courseId)
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (added) {
        next.add(courseId)
      } else {
        next.delete(courseId)
      }
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (courseId: string) => favoriteIds.has(courseId),
    [favoriteIds]
  )

  return { favoriteIds, toggle, isFavorite }
}

export function useFilters() {
  const [keyword, setKeyword] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [difficulties, setDifficulties] = useState<Difficulty[]>([])

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]

  const togglePlatform = (p: Platform) => setPlatforms((prev) => toggleArrayItem(prev, p))
  const toggleCategory = (c: Category) => setCategories((prev) => toggleArrayItem(prev, c))
  const toggleDifficulty = (d: Difficulty) => setDifficulties((prev) => toggleArrayItem(prev, d))

  const clearAll = () => {
    setKeyword('')
    setPlatforms([])
    setCategories([])
    setDifficulties([])
  }

  return {
    keyword,
    setKeyword,
    platforms,
    categories,
    difficulties,
    togglePlatform,
    toggleCategory,
    toggleDifficulty,
    clearAll,
  }
}

export function useProficiency() {
  const [proficiency, setProficiency] = useState<Record<string, number>>({})

  useEffect(() => {
    getProfApi().then(setProficiency)
  }, [])

  const setLevel = useCallback(async (courseId: string, level: number) => {
    await setProfApi(courseId, level)
    setProficiency((prev) => {
      const next = { ...prev }
      if (level === 0) {
        delete next[courseId]
      } else {
        next[courseId] = level
      }
      return next
    })
  }, [])

  const getLevel = useCallback(
    (courseId: string): number => proficiency[courseId] ?? 0,
    [proficiency]
  )

  return { proficiency, setLevel, getLevel }
}
