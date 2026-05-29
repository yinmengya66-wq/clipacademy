import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Course } from './bilibili.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', '..', 'clipacademy.db')
const SEED_JSON_PATH = path.join(__dirname, '..', 'data', 'seed.json')

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('synchronous = NORMAL')
    initSchema()
  }
  return db
}

function initSchema(): void {
  const d = getDb()
  d.exec(`
    CREATE TABLE IF NOT EXISTS cached_courses (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      author      TEXT NOT NULL,
      platform    TEXT NOT NULL DEFAULT 'bilibili',
      url         TEXT NOT NULL,
      category    TEXT NOT NULL,
      difficulty  TEXT NOT NULL,
      duration    INTEGER,
      description TEXT,
      tags        TEXT,
      thumbnail   TEXT,
      bv_id       TEXT,
      play_count  INTEGER DEFAULT 0,
      danmaku     INTEGER DEFAULT 0,
      favorites   INTEGER DEFAULT 0,
      pubdate     INTEGER,
      search_kw   TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      cached_at   INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_courses_category ON cached_courses(category);
    CREATE INDEX IF NOT EXISTS idx_courses_search_kw ON cached_courses(search_kw);
    CREATE INDEX IF NOT EXISTS idx_courses_play ON cached_courses(play_count DESC);
    CREATE INDEX IF NOT EXISTS idx_courses_bv_id ON cached_courses(bv_id);
  `)
}

export function upsertCourse(course: Course, searchKw: string): void {
  const d = getDb()
  d.prepare(`
    INSERT OR REPLACE INTO cached_courses
      (id, title, author, platform, url, category, difficulty, duration,
       description, tags, thumbnail, bv_id, play_count, danmaku, favorites,
       pubdate, search_kw, created_at, updated_at, cached_at)
    VALUES
      (@id, @title, @author, @platform, @url, @category, @difficulty, @duration,
       @description, @tags, @thumbnail, @bvId, @playCount, @danmaku, @favorites,
       @pubdate, @searchKw, @createdAt, @updatedAt, @cachedAt)
  `).run({
    id: course.id,
    title: course.title,
    author: course.author,
    platform: course.platform,
    url: course.url,
    category: course.category,
    difficulty: course.difficulty,
    duration: course.duration,
    description: course.description,
    tags: JSON.stringify(course.tags),
    thumbnail: course.thumbnailURL,
    bvId: course.bvId ?? null,
    playCount: course.playCount ?? 0,
    danmaku: course.danmaku ?? 0,
    favorites: course.favorites ?? 0,
    pubdate: course.createdAt ? Math.floor(new Date(course.createdAt).getTime() / 1000) : 0,
    searchKw,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    cachedAt: Date.now(),
  })
}

interface SearchOptions {
  keyword?: string
  categories?: string[]
  difficulties?: string[]
  platforms?: string[]
  sort?: string
  page?: number
  pageSize?: number
}

export interface SearchResult {
  courses: Course[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

function rowToCourse(row: Record<string, unknown>): Course {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    platform: row.platform as Course['platform'],
    url: row.url as string,
    category: row.category as Course['category'],
    difficulty: row.difficulty as Course['difficulty'],
    duration: row.duration as number | null,
    description: (row.description as string) ?? '',
    tags: JSON.parse((row.tags as string) ?? '[]'),
    thumbnailURL: (row.thumbnail as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    bvId: (row.bv_id as string) ?? undefined,
    playCount: (row.play_count as number) ?? 0,
    danmaku: (row.danmaku as number) ?? 0,
    favorites: (row.favorites as number) ?? 0,
  }
}

export function searchCourses(opts: SearchOptions): SearchResult {
  const d = getDb()
  const conditions: string[] = []
  const params: Record<string, unknown> = {}

  if (opts.keyword) {
    conditions.push('(title LIKE @kw OR author LIKE @kw OR description LIKE @kw OR tags LIKE @kw)')
    params.kw = `%${opts.keyword}%`
  }
  if (opts.categories?.length) {
    conditions.push(`category IN (${opts.categories.map((_, i) => `@cat${i}`).join(',')})`)
    opts.categories.forEach((c, i) => {
      params[`cat${i}`] = c
    })
  }
  if (opts.difficulties?.length) {
    conditions.push(`difficulty IN (${opts.difficulties.map((_, i) => `@diff${i}`).join(',')})`)
    opts.difficulties.forEach((d, i) => {
      params[`diff${i}`] = d
    })
  }
  if (opts.platforms?.length) {
    conditions.push(`platform IN (${opts.platforms.map((_, i) => `@plat${i}`).join(',')})`)
    opts.platforms.forEach((p, i) => {
      params[`plat${i}`] = p
    })
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  let orderBy = 'ORDER BY play_count DESC'
  switch (opts.sort) {
    case 'newest':
      orderBy = 'ORDER BY pubdate DESC'
      break
    case 'duration':
      orderBy = 'ORDER BY duration DESC'
      break
    case 'favorites':
      orderBy = 'ORDER BY favorites DESC'
      break
    default:
      orderBy = 'ORDER BY play_count DESC'
  }

  const page = opts.page ?? 1
  const pageSize = opts.pageSize ?? 20
  const offset = (page - 1) * pageSize

  const countRow = d.prepare(`SELECT COUNT(*) as total FROM cached_courses ${where}`).get(params) as { total: number }
  const rows = d
    .prepare(`SELECT * FROM cached_courses ${where} ${orderBy} LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit: pageSize, offset }) as Record<string, unknown>[]

  return {
    courses: rows.map(rowToCourse),
    total: countRow.total,
    page,
    pageSize,
    hasMore: offset + pageSize < countRow.total,
  }
}

export function getCourseByBvId(bvId: string): Course | null {
  const d = getDb()
  const row = d.prepare('SELECT * FROM cached_courses WHERE bv_id = ?').get(bvId) as Record<string, unknown> | undefined
  return row ? rowToCourse(row) : null
}

export function getCategoryStats(): Array<{ category: string; count: number }> {
  const d = getDb()
  return d
    .prepare('SELECT category, COUNT(*) as count FROM cached_courses GROUP BY category ORDER BY count DESC')
    .all() as Array<{ category: string; count: number }>
}

export function getSuggestions(query: string, limit = 8): string[] {
  const d = getDb()
  const rows = d
    .prepare('SELECT DISTINCT title FROM cached_courses WHERE title LIKE ? LIMIT ?')
    .all(`%${query}%`, limit) as Array<{ title: string }>
  return rows.map((r) => r.title)
}

export function getCacheStats(): { total: number; categories: number; lastCached: number | null } {
  const d = getDb()
  const total = (d.prepare('SELECT COUNT(*) as c FROM cached_courses').get() as { c: number }).c
  const categories = (
    d.prepare('SELECT COUNT(DISTINCT category) as c FROM cached_courses').get() as { c: number }
  ).c
  const lastRow = d.prepare('SELECT MAX(cached_at) as t FROM cached_courses').get() as { t: number | null }
  return { total, categories, lastCached: lastRow.t }
}

export function seedFromJson(): number {
  if (!fs.existsSync(SEED_JSON_PATH)) {
    console.log('  seed.json 不存在，跳过预填充')
    return 0
  }

  const stats = getCacheStats()
  if (stats.total > 0) {
    console.log(`  缓存已有 ${stats.total} 门课程，跳过 JSON 种子导入`)
    return 0
  }

  try {
    const raw = fs.readFileSync(SEED_JSON_PATH, 'utf-8')
    const courses: Course[] = JSON.parse(raw)

    const d = getDb()
    const insert = d.prepare(`
      INSERT OR REPLACE INTO cached_courses
        (id, title, author, platform, url, category, difficulty, duration,
         description, tags, thumbnail, bv_id, play_count, danmaku, favorites,
         pubdate, search_kw, created_at, updated_at, cached_at)
      VALUES
        (@id, @title, @author, @platform, @url, @category, @difficulty, @duration,
         @description, @tags, @thumbnail, @bvId, @playCount, @danmaku, @favorites,
         @pubdate, @searchKw, @createdAt, @updatedAt, @cachedAt)
    `)

    const tx = d.transaction(() => {
      let count = 0
      for (const course of courses) {
        insert.run({
          id: course.id || `seed-${Date.now()}-${count}`,
          title: course.title,
          author: course.author,
          platform: course.platform || 'bilibili',
          url: course.url,
          category: course.category,
          difficulty: course.difficulty,
          duration: course.duration,
          description: course.description || '',
          tags: JSON.stringify(course.tags || []),
          thumbnail: course.thumbnailURL || null,
          bvId: course.bvId || null,
          playCount: course.playCount || Math.floor(Math.random() * 50000) + 5000,
          danmaku: course.danmaku || 0,
          favorites: course.favorites || 0,
          pubdate: course.createdAt ? Math.floor(new Date(course.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000),
          searchKw: course.category,
          createdAt: course.createdAt || new Date().toISOString(),
          updatedAt: course.updatedAt || new Date().toISOString(),
          cachedAt: Date.now(),
        })
        count++
      }
      return count
    })

    const count = tx()
    console.log(`  JSON 种子导入完成: ${count} 门课程`)
    return count
  } catch (err) {
    console.error('  JSON 种子导入失败:', (err as Error).message)
    return 0
  }
}
