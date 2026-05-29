import type { Handler, HandlerEvent } from '@netlify/functions'
import { getSuggestions } from '../lib/data'

export const handler: Handler = async (event: HandlerEvent) => {
  try {
    const q = event.queryStringParameters?.q ?? ''
    if (q.length < 2) return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: '[]' }
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(getSuggestions(q, 8)) }
  } catch (err) {
    console.error('Suggestions error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: '获取建议失败' }) }
  }
}
