export interface TimestampResult {
  timestamp: number
  timestampMs: number
  iso: string
  local: string
  utc: string
}

export function timestampToDate(timestamp: number): TimestampResult {
  // 自动判断是秒还是毫秒
  const ts = timestamp.toString().length <= 10 ? timestamp * 1000 : timestamp
  const date = new Date(ts)

  return {
    timestamp: Math.floor(ts / 1000),
    timestampMs: ts,
    iso: date.toISOString(),
    local: date.toLocaleString('zh-CN'),
    utc: date.toUTCString(),
  }
}

export function dateToTimestamp(dateStr: string): TimestampResult {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    throw new Error('无效的日期格式')
  }

  return {
    timestamp: Math.floor(date.getTime() / 1000),
    timestampMs: date.getTime(),
    iso: date.toISOString(),
    local: date.toLocaleString('zh-CN'),
    utc: date.toUTCString(),
  }
}

export function getCurrentTimestamp(): TimestampResult {
  return timestampToDate(Date.now())
}
