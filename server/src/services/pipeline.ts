import { searchVideos, toCourse, assignCategory } from './bilibili.js'
import { upsertCourse, getCacheStats } from './cache.js'
import type { Course } from './bilibili.js'

export const CATEGORY_SEARCH_KEYWORDS: Record<string, string[]> = {
  basics: ['剪映零基础入门教程', '剪映新手教程全套', '剪辑入门2025', 'pr入门教程'],
  transitions: ['剪映转场特效教程', '丝滑转场教学', '遮罩转场教程', '视频转场技巧'],
  colorGrading: ['剪映调色教程', '电影感调色教学', '达芬奇调色教程', '视频调色技巧'],
  audioDesign: ['视频音效设计教程', '剪辑BGM选曲技巧', '剪映音频处理', '配音配乐教程'],
  subtitles: ['剪映字幕动画教程', '文字特效教程', '花字制作教学', '字幕效果制作'],
  animeEdit: ['漫剪教程', '动漫剪辑教学', 'AMV制作教程', '动漫mad剪辑'],
  mashup: ['混剪教程', '影视混剪教学', '多素材混剪技巧', '电影混剪教程'],
  talkingHead: ['口播剪辑教程', '人物出镜剪辑技巧', 'vlog口播教学', '人物采访剪辑'],
  ecommerce: ['电商带货剪辑', '带货视频剪辑教程', '商品展示视频制作', '电商短视频剪辑'],
  knowledgeShare: ['知识分享视频剪辑', '干货视频剪辑教程', '教学视频制作技巧', '科普视频剪辑'],
  varietyShow: ['综艺剪辑教程', '综艺感剪辑技巧', '综艺花字剪辑', '综艺后期制作'],
  effects: ['视觉特效教程', '剪映特效制作', 'AE特效入门教程', '视频特效制作'],
  vlog: ['vlog剪辑教程', '日常vlog拍摄剪辑', '旅拍vlog制作', 'vlog全流程教程'],
  beatSync: ['卡点视频教程', '节奏剪辑教学', '踩点视频制作', '音乐卡点剪辑'],
}

const QUALITY_MIN_PLAYS = 5000
const QUALITY_MIN_DURATION = 120 // 2 minutes minimum
const MAX_PAGES_PER_KEYWORD = 3 // 3 pages × 20 = 60 results per keyword

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function seedCategory(
  category: string,
  onProgress?: (msg: string) => void
): Promise<number> {
  const keywords = CATEGORY_SEARCH_KEYWORDS[category] ?? [category]
  let totalAdded = 0
  const seenBvIds = new Set<string>()

  for (const kw of keywords) {
    onProgress?.(`  搜索关键词: "${kw}"`)
    for (let page = 1; page <= MAX_PAGES_PER_KEYWORD; page++) {
      try {
        const { videos } = await searchVideos(kw, page, 'click')
        let addedFromKw = 0

        for (const video of videos) {
          if (seenBvIds.has(video.bvId)) continue
          if (video.playCount < QUALITY_MIN_PLAYS) continue
          if (video.duration < QUALITY_MIN_DURATION) continue

          seenBvIds.add(video.bvId)
          const assignedCat = assignCategory(kw)
          const course = toCourse(video, assignedCat)
          upsertCourse(course, kw)
          addedFromKw++
        }

        totalAdded += addedFromKw
        onProgress?.(`    第${page}页: 新增 ${addedFromKw} 门课程`)

        if (videos.length < 20) break // no more results
        await sleep(600) // rate limiting
      } catch (err) {
        onProgress?.(`    错误: ${(err as Error).message}`)
        await sleep(2000)
      }
    }
    await sleep(800)
  }

  return totalAdded
}

export async function seedAll(
  onProgress?: (msg: string) => void
): Promise<{ total: number; perCategory: Record<string, number> }> {
  const stats = getCacheStats()
  if (stats.total > 500) {
    onProgress?.(`缓存中已有 ${stats.total} 门课程，跳过播种`)
    return { total: stats.total, perCategory: {} }
  }

  onProgress?.('=== 开始播种课程数据 ===')
  const categories = Object.keys(CATEGORY_SEARCH_KEYWORDS)
  const perCategory: Record<string, number> = {}
  let total = 0

  for (const cat of categories) {
    onProgress?.(`\n分类: ${cat}`)
    const added = await seedCategory(cat, onProgress)
    perCategory[cat] = added
    total += added
    onProgress?.(`  总计新增: ${added} 门`)
  }

  onProgress?.(`\n=== 播种完成: 共 ${total} 门课程 ===`)
  return { total, perCategory }
}

export async function refreshCache(
  onProgress?: (msg: string) => void
): Promise<number> {
  onProgress?.('=== 开始增量刷新 ===')
  let totalAdded = 0
  const categories = Object.keys(CATEGORY_SEARCH_KEYWORDS)

  for (const cat of categories) {
    const keywords = CATEGORY_SEARCH_KEYWORDS[cat]
    // Only check first keyword, first 2 pages for new content
    const kw = keywords[0]
    try {
      const { videos } = await searchVideos(kw, 1, 'pubdate')
      for (const video of videos) {
        if (video.playCount < QUALITY_MIN_PLAYS) continue
        if (video.duration < QUALITY_MIN_DURATION) continue
        const course = toCourse(video, assignCategory(kw))
        upsertCourse(course, kw)
        totalAdded++
      }
    } catch (err) {
      onProgress?.(`刷新 ${cat} 错误: ${(err as Error).message}`)
    }
    await sleep(800)
  }

  onProgress?.(`刷新完成: 新增 ${totalAdded} 门课程`)
  return totalAdded
}
