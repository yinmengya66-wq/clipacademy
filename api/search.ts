import { searchCourses } from './_lib/data'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const opts = {
      keyword: url.searchParams.get('keyword') ?? undefined,
      platforms: url.searchParams.get('platforms') ?? undefined,
      categories: url.searchParams.get('categories') ?? undefined,
      difficulties: url.searchParams.get('difficulties') ?? undefined,
      sort: url.searchParams.get('sort') ?? 'play_count',
      page: parseInt(url.searchParams.get('page') ?? '1', 10) || 1,
      pageSize: Math.min(parseInt(url.searchParams.get('pageSize') ?? '20', 10) || 20, 50),
    }

    const result = searchCourses(opts)
    return Response.json(result)
  } catch (err) {
    console.error('Search error:', err)
    return Response.json({ error: '搜索失败，请稍后重试' }, { status: 500 })
  }
}
