/**
 * 从 B站 API 批量获取视频封面图，更新 seed.json 中的 thumbnailURL 字段。
 * 用法: npx tsx scripts/fetch-thumbnails.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const SEED_PATHS = [
  'netlify/lib/seed.json',
  'server/src/data/seed.json',
]

const BV_RE = /BV[0-9A-Za-z]{10}/
const AV_RE = /av(\d+)/i

interface Course {
  id: string
  url: string
  thumbnailURL: string | null
  bvId?: string
  platform: string
}

async function fetchBilibiliVideo(bvId: string): Promise<{ pic: string } | null> {
  try {
    const resp = await fetch(
      `https://api.bilibili.com/x/web-interface/view?bvid=${bvId}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!resp.ok) return null
    const json = await resp.json() as any
    if (json.code !== 0 || !json.data?.pic) return null
    return { pic: json.data.pic.replace(/^http:/, 'https:') }
  } catch {
    return null
  }
}

async function fetchBilibiliVideoByAvId(avId: number): Promise<{ pic: string; bvId: string } | null> {
  try {
    const resp = await fetch(
      `https://api.bilibili.com/x/web-interface/view?aid=${avId}`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!resp.ok) return null
    const json = await resp.json() as any
    if (json.code !== 0 || !json.data?.pic) return null
    return {
      pic: json.data.pic.replace(/^http:/, 'https:'),
      bvId: json.data.bvid ?? '',
    }
  } catch {
    return null
  }
}

async function main() {
  const seedPath = path.resolve(SEED_PATHS[0])
  const raw = fs.readFileSync(seedPath, 'utf-8')
  const courses: Course[] = JSON.parse(raw)

  let updated = 0
  let failed = 0
  let skipped = 0

  for (const course of courses) {
    // Skip non-B站 or already has thumbnail
    if (course.platform !== 'bilibili') {
      skipped++
      continue
    }

    const bvMatch = course.url.match(BV_RE)
    const avMatch = course.url.match(AV_RE)

    if (bvMatch) {
      const bvId = bvMatch[0]
      console.log(`[${course.id}] Fetching BV=${bvId} ...`)
      const info = await fetchBilibiliVideo(bvId)
      if (info) {
        course.thumbnailURL = info.pic
        course.bvId = course.bvId ?? bvId
        updated++
        console.log(`  ✓ ${info.pic}`)
      } else {
        failed++
        console.log(`  ✗ API failed`)
      }
    } else if (avMatch) {
      const avId = parseInt(avMatch[1])
      console.log(`[${course.id}] Fetching AV=${avId} ...`)
      const info = await fetchBilibiliVideoByAvId(avId)
      if (info) {
        course.thumbnailURL = info.pic
        course.bvId = course.bvId ?? info.bvId
        updated++
        console.log(`  ✓ ${info.pic}`)
      } else {
        failed++
        console.log(`  ✗ API failed`)
      }
    } else {
      skipped++
      console.log(`[${course.id}] No BV/AV in URL, skipped`)
    }

    // Rate limit: 200ms between requests
    await new Promise((r) => setTimeout(r, 200))
  }

  // Write back to all seed paths
  const output = JSON.stringify(courses, null, 2) + '\n'
  for (const p of SEED_PATHS) {
    const full = path.resolve(p)
    if (fs.existsSync(path.dirname(full))) {
      fs.writeFileSync(full, output, 'utf-8')
      console.log(`\nWritten: ${full}`)
    }
  }

  console.log(`\nDone. Updated: ${updated}, Failed: ${failed}, Skipped: ${skipped}`)
}

main().catch(console.error)
