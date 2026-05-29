import type { Handler, HandlerEvent } from '@netlify/functions'
import { searchCourses } from './_lib'

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    const { queryStringParameters: q } = event
    const result = searchCourses({
      keyword: q?.keyword,
      platforms: q?.platforms,
      categories: q?.categories,
      difficulties: q?.difficulties,
      sort: q?.sort ?? 'play_count',
      page: parseInt(q?.page ?? '1', 10) || 1,
      pageSize: Math.min(parseInt(q?.pageSize ?? '20', 10) || 20, 50),
    })
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) }
  } catch (err) {
    console.error('Search error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: '搜索失败，请稍后重试' }) }
  }
}
