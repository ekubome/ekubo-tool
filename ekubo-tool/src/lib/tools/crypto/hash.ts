import CryptoJS from 'crypto-js'

export type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512'

export interface HashResult {
  algorithm: HashAlgorithm
  hash: string
}

export function calculateHash(input: string, algorithm: HashAlgorithm): HashResult {
  let hash: string

  switch (algorithm) {
    case 'MD5':
      hash = CryptoJS.MD5(input).toString()
      break
    case 'SHA1':
      hash = CryptoJS.SHA1(input).toString()
      break
    case 'SHA256':
      hash = CryptoJS.SHA256(input).toString()
      break
    case 'SHA512':
      hash = CryptoJS.SHA512(input).toString()
      break
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`)
  }

  return { algorithm, hash }
}

export function calculateAllHashes(input: string): HashResult[] {
  const algorithms: HashAlgorithm[] = ['MD5', 'SHA1', 'SHA256', 'SHA512']
  return algorithms.map((algorithm) => calculateHash(input, algorithm))
}

export async function calculateFileHash(file: File, algorithm: HashAlgorithm): Promise<HashResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const wordArray = CryptoJS.lib.WordArray.create(reader.result as ArrayBuffer)
      let hash: string

      switch (algorithm) {
        case 'MD5':
          hash = CryptoJS.MD5(wordArray).toString()
          break
        case 'SHA1':
          hash = CryptoJS.SHA1(wordArray).toString()
          break
        case 'SHA256':
          hash = CryptoJS.SHA256(wordArray).toString()
          break
        case 'SHA512':
          hash = CryptoJS.SHA512(wordArray).toString()
          break
        default:
          reject(new Error(`Unsupported algorithm: ${algorithm}`))
          return
      }

      resolve({ algorithm, hash })
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}
