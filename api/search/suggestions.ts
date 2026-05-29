import { getSuggestions } from '../_lib/data'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const q = url.searchParams.get('q') ?? ''
    if (q.length < 2) return Response.json([])
    return Response.json(getSuggestions(q, 8))
  } catch (err) {
    console.error('Suggestions error:', err)
    return Response.json({ error: '获取建议失败' }, { status: 500 })
  }
}
