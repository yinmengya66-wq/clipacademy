import type { Handler, HandlerEvent } from '@netlify/functions'
import { getCourseByBvId } from './_lib'

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    const bvId = event.queryStringParameters?.bvId ?? ''
    const course = getCourseByBvId(bvId)
    if (!course) {
      return { statusCode: 404, body: JSON.stringify({ error: '课程未找到' }) }
    }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(course) }
  } catch (err) {
    console.error('Course detail error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: '获取课程详情失败' }) }
  }
}
