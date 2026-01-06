'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileUploader } from '@/components/tools/FileUploader'
import { calculateAllHashes, calculateFileHash, type HashResult, type HashAlgorithm } from '@/lib/tools/crypto/hash'
import { Copy, Check } from 'lucide-react'

export function HashTool() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<HashResult[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [fileResults, setFileResults] = useState<HashResult[]>([])
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleTextHash = () => {
    if (!input.trim()) return
    setResults(calculateAllHashes(input))
  }

  const handleFileHash = async () => {
    if (files.length === 0) return
    setProcessing(true)
    
    try {
      const algorithms: HashAlgorithm[] = ['MD5', 'SHA1', 'SHA256', 'SHA512']
      const hashResults: HashResult[] = []
      
      for (const algo of algorithms) {
        const result = await calculateFileHash(files[0], algo)
        hashResults.push(result)
      }
      
      setFileResults(hashResults)
    } catch (error) {
      console.error('Hash calculation failed:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleCopy = async (hash: string) => {
    await navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const renderResults = (hashResults: HashResult[]) => (
    <div className="space-y-2">
      {hashResults.map((result) => (
        <div key={result.algorithm} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">{result.algorithm}</span>
            <Button variant="ghost" size="sm" onClick={() => handleCopy(result.hash)}>
              {copiedHash === result.hash ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <code className="text-xs font-mono break-all">{result.hash}</code>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Text Hash */}
      <div className="space-y-4">
        <h3 className="font-medium">文本哈希</h3>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要计算哈希的文本..."
          className="min-h-[100px]"
        />
        <Button onClick={handleTextHash} className="w-full" disabled={!input.trim()}>
          计算哈希
        </Button>
        {results.length > 0 && renderResults(results)}
      </div>

      {/* File Hash */}
      <div className="pt-6 border-t space-y-4">
        <h3 className="font-medium">文件哈希</h3>
        <FileUploader
          accept={[]}
          maxSize={100 * 1024 * 1024}
          files={files}
          onFilesSelected={(newFiles) => setFiles(newFiles)}
          onRemoveFile={() => { setFiles([]); setFileResults([]) }}
        />
        {files.length > 0 && (
          <Button onClick={handleFileHash} className="w-full" disabled={processing}>
            {processing ? '计算中...' : '计算文件哈希'}
          </Button>
        )}
        {fileResults.length > 0 && renderResults(fileResults)}
      </div>
    </div>
  )
}
