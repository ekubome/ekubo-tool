export type NumberBase = 2 | 8 | 10 | 16

export interface NumberBaseResult {
  binary: string
  octal: string
  decimal: string
  hexadecimal: string
}

export function convertNumberBase(value: string, fromBase: NumberBase): NumberBaseResult {
  if (!value || value.trim() === '') {
    throw new Error('请输入数字')
  }

  const trimmedValue = value.trim()
  
  // 验证输入格式
  if (!isValidNumber(trimmedValue, fromBase)) {
    throw new Error(`无效的 ${fromBase} 进制数字格式`)
  }

  try {
    // 使用 BigInt 处理大数字，避免精度丢失
    let bigIntValue: bigint

    if (fromBase === 2) {
      bigIntValue = BigInt('0b' + trimmedValue)
    } else if (fromBase === 8) {
      bigIntValue = BigInt('0o' + trimmedValue)
    } else if (fromBase === 16) {
      bigIntValue = BigInt('0x' + trimmedValue)
    } else {
      bigIntValue = BigInt(trimmedValue)
    }

    return {
      binary: bigIntValue.toString(2),
      octal: bigIntValue.toString(8),
      decimal: bigIntValue.toString(10),
      hexadecimal: bigIntValue.toString(16).toUpperCase(),
    }
  } catch {
    throw new Error('数字转换失败，请检查输入')
  }
}

export function isValidNumber(value: string, base: NumberBase): boolean {
  if (!value || value.trim() === '') return false
  
  const patterns: Record<NumberBase, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^[0-9]+$/,
    16: /^[0-9a-fA-F]+$/,
  }

  return patterns[base].test(value.trim())
}
