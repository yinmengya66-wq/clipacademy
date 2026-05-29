import { getCourseByBvId } from '../_lib/data'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    // path: /api/courses/BVxxxxxxxxxx
    const bvId = url.pathname.split('/').pop() ?? ''
    const course = getCourseByBvId(bvId)
    if (!course) {
      return Response.json({ error: '课程未找到' }, { status: 404 })
    }
    return Response.json(course)
  } catch (err) {
    console.error('Course detail error:', err)
    return Response.json({ error: '获取课程详情失败' }, { status: 500 })
  }
}
