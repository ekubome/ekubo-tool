export interface JsonFormatResult {
  formatted: string
  valid: boolean
  error?: string
}

export function formatJson(input: string, indent: number = 2): JsonFormatResult {
  try {
    const parsed = JSON.parse(input)
    return {
      formatted: JSON.stringify(parsed, null, indent),
      valid: true,
    }
  } catch (e) {
    return {
      formatted: input,
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid JSON',
    }
  }
}

export function minifyJson(input: string): JsonFormatResult {
  try {
    const parsed = JSON.parse(input)
    return {
      formatted: JSON.stringify(parsed),
      valid: true,
    }
  } catch (e) {
    return {
      formatted: input,
      valid: false,
      error: e instanceof Error ? e.message : 'Invalid JSON',
    }
  }
}
