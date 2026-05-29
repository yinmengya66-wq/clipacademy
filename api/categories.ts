import { getCategoryStats } from './_lib/data'

export async function GET() {
  try {
    const stats = getCategoryStats()
    return Response.json(stats)
  } catch (err) {
    console.error('Categories error:', err)
    return Response.json({ error: '获取分类失败' }, { status: 500 })
  }
}
