import type { Handler } from '@netlify/functions'
import { getCategoryStats } from '../lib/data'

export const handler: Handler = async () => {
  try {
    const stats = getCategoryStats()
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(stats) }
  } catch (err) {
    console.error('Categories error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: '获取分类失败' }) }
  }
}
