export function encodeBase64(input: string): string {
  try {
    // 使用 TextEncoder 替代已弃用的 unescape/escape
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    let binary = ''
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i])
    }
    return btoa(binary)
  } catch {
    throw new Error('编码失败，请检查输入内容')
  }
}

export function decodeBase64(input: string): string {
  try {
    // 使用 TextDecoder 替代已弃用的 unescape/escape
    const binary = atob(input)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    return decoder.decode(bytes)
  } catch {
    throw new Error('解码失败，请检查输入是否为有效的 Base64 字符串')
  }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsDataURL(file)
  })
}

export function base64ToBlob(base64: string, mimeType: string = 'application/octet-stream'): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}
