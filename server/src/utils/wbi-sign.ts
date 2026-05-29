/**
 * B站 WBI 签名算法
 *
 * 参考: SocialSisterYi/bilibili-API-collect
 * 1. 从 nav 接口获取 img_key 和 sub_key
 * 2. 按固定位置混合得到 32 字符 mixinKey
 * 3. 请求参数按字母排序 + mixinKey → MD5 → w_rid
 */
import crypto from 'node:crypto'

const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
  37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
  22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
]

interface WbiKeys {
  imgKey: string
  subKey: string
  cachedAt: number
}

let wbiKeys: WbiKeys | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

function getMixinKey(orig: string): string {
  let mixin = ''
  for (const pos of MIXIN_KEY_ENC_TAB) {
    if (pos < orig.length) {
      mixin += orig[pos]
    }
  }
  return mixin.substring(0, 32)
}

function extractKey(url: string): string {
  return url.split('/').pop()!.split('.')[0]
}

async function refreshKeys(): Promise<WbiKeys> {
  const res = await fetch('https://api.bilibili.com/x/web-interface/wbi/index/nav', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://www.bilibili.com',
    },
  })
  const json = (await res.json()) as { data: { wbi_img: { img_url: string; sub_url: string } } }
  const imgKey = extractKey(json.data.wbi_img.img_url)
  const subKey = extractKey(json.data.wbi_img.sub_url)

  const keys: WbiKeys = { imgKey, subKey, cachedAt: Date.now() }
  wbiKeys = keys
  return keys
}

async function getKeys(): Promise<WbiKeys> {
  if (wbiKeys && Date.now() - wbiKeys.cachedAt < CACHE_TTL) {
    return wbiKeys
  }
  return refreshKeys()
}

export async function signParams(params: Record<string, string | number>): Promise<Record<string, string>> {
  const keys = await getKeys()
  const mixinKey = getMixinKey(keys.imgKey + keys.subKey)

  // Sort params alphabetically
  const sorted = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => [k, String(v)] as [string, string])
    .sort(([a], [b]) => a.localeCompare(b))

  // Build query string + mixinKey → MD5
  const queryStr = sorted.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
  const wbiSign = crypto.createHash('md5').update(queryStr + mixinKey).digest('hex')

  const result: Record<string, string> = {}
  for (const [k, v] of sorted) {
    result[k] = v
  }
  result.w_rid = wbiSign
  result.wts = String(Math.floor(Date.now() / 1000))

  return result
}
