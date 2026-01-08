export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

export function generatePassword(options: PasswordOptions): string {
  let chars = ''
  if (options.uppercase) chars += UPPERCASE
  if (options.lowercase) chars += LOWERCASE
  if (options.numbers) chars += NUMBERS
  if (options.symbols) chars += SYMBOLS

  if (chars.length === 0) {
    chars = LOWERCASE + NUMBERS
  }

  let password = ''
  const array = new Uint8Array(options.length)
  crypto.getRandomValues(array)

  for (let i = 0; i < options.length; i++) {
    // 使用更均匀的随机选择算法，避免模运算导致的偏差
    password += chars[Math.floor((array[i] / 256) * chars.length)]
  }

  return password
}

export function calculatePasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 2) return { score, label: '弱', color: 'red' }
  if (score <= 4) return { score, label: '中', color: 'yellow' }
  if (score <= 5) return { score, label: '强', color: 'blue' }
  return { score, label: '非常强', color: 'green' }
}
