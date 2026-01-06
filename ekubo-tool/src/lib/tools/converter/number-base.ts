export type NumberBase = 2 | 8 | 10 | 16

export interface NumberBaseResult {
  binary: string
  octal: string
  decimal: string
  hexadecimal: string
}

export function convertNumberBase(value: string, fromBase: NumberBase): NumberBaseResult {
  const decimal = parseInt(value, fromBase)
  
  if (isNaN(decimal)) {
    throw new Error('无效的数字格式')
  }

  return {
    binary: decimal.toString(2),
    octal: decimal.toString(8),
    decimal: decimal.toString(10),
    hexadecimal: decimal.toString(16).toUpperCase(),
  }
}

export function isValidNumber(value: string, base: NumberBase): boolean {
  const patterns: Record<NumberBase, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  }

  return patterns[base].test(value)
}
