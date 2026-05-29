import { createApp } from './app.js'
import { seedFromJson } from './services/cache.js'
import { seedAll, refreshCache } from './services/pipeline.js'
import cron from 'node-cron'

const PORT = parseInt(process.env.PORT ?? '3001', 10)

const app = createApp()

app.listen(PORT, () => {
  console.log(`\n  剪映学堂 API 服务已启动 → http://localhost:${PORT}`)
  console.log(`  API 端点: http://localhost:${PORT}/api\n`)

  // Step 1: Pre-populate from JSON seed data (fast, local)
  const jsonCount = seedFromJson()
  console.log(`  JSON 种子: ${jsonCount} 门课程`)

  // Step 2: Try B站 API enrichment (async, non-blocking, may fail)
  seedAll((msg) => console.log(msg))
    .then(({ total }) => {
      if (total > jsonCount) {
        console.log(`\n  B站 API 补充完成: 新增 ${total - jsonCount} 门课程`)
      }
      console.log(`  缓存总计: ${total} 门课程\n`)
    })
    .catch((err) => {
      console.log(`  B站 API 暂不可用，使用本地种子数据 (${jsonCount} 门课程)`)
    })
})

// Daily refresh at 3:00 AM
cron.schedule('0 3 * * *', async () => {
  console.log('[Cron] 开始每日刷新...')
  try {
    const added = await refreshCache((msg) => console.log(msg))
    console.log(`[Cron] 每日刷新完成: 新增 ${added} 门课程`)
  } catch (err) {
    console.log('[Cron] B站 API 不可用，跳过刷新')
  }
})
