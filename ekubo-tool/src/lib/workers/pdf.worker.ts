// PDF 处理 Web Worker
// 用于在后台线程处理大型 PDF 文件，避免阻塞主线程

import { PDFDocument } from 'pdf-lib'

export type WorkerMessage = 
  | { type: 'merge'; files: ArrayBuffer[] }
  | { type: 'split'; file: ArrayBuffer; mode: 'each' | 'range' | 'fixed'; options?: { ranges?: string; fixedPages?: number } }
  | { type: 'compress'; file: ArrayBuffer; quality: string }

export type WorkerResponse =
  | { type: 'progress'; progress: number }
  | { type: 'result'; data: ArrayBuffer | ArrayBuffer[] }
  | { type: 'error'; message: string }

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type } = e.data

  try {
    switch (type) {
      case 'merge':
        await handleMerge(e.data.files)
        break
      case 'split':
        await handleSplit(e.data.file, e.data.mode, e.data.options)
        break
      case 'compress':
        await handleCompress(e.data.file, e.data.quality)
        break
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      message: error instanceof Error ? error.message : '处理失败' 
    } as WorkerResponse)
  }
}

async function handleMerge(files: ArrayBuffer[]) {
  const mergedPdf = await PDFDocument.create()
  const totalFiles = files.length

  for (let i = 0; i < files.length; i++) {
    const pdf = await PDFDocument.load(files[i])
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    pages.forEach((page) => mergedPdf.addPage(page))

    self.postMessage({ 
      type: 'progress', 
      progress: ((i + 1) / totalFiles) * 100 
    } as WorkerResponse)
  }

  const mergedPdfBytes = await mergedPdf.save()
  self.postMessage({ 
    type: 'result', 
    data: mergedPdfBytes.buffer as ArrayBuffer
  } as WorkerResponse)
}

async function handleSplit(
  file: ArrayBuffer, 
  mode: 'each' | 'range' | 'fixed',
  options?: { ranges?: string; fixedPages?: number }
) {
  const pdfDoc = await PDFDocument.load(file)
  const totalPages = pdfDoc.getPageCount()
  const results: ArrayBuffer[] = []

  if (mode === 'each') {
    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create()
      const [page] = await newPdf.copyPages(pdfDoc, [i])
      newPdf.addPage(page)
      const pdfBytes = await newPdf.save()
      results.push(pdfBytes.buffer as ArrayBuffer)
      
      self.postMessage({ 
        type: 'progress', 
        progress: ((i + 1) / totalPages) * 100 
      } as WorkerResponse)
    }
  } else if (mode === 'fixed' && options?.fixedPages) {
    const chunks = Math.ceil(totalPages / options.fixedPages)
    for (let i = 0; i < chunks; i++) {
      const newPdf = await PDFDocument.create()
      const start = i * options.fixedPages
      const end = Math.min(start + options.fixedPages, totalPages)
      const pageIndices = Array.from({ length: end - start }, (_, j) => start + j)
      const pages = await newPdf.copyPages(pdfDoc, pageIndices)
      pages.forEach(page => newPdf.addPage(page))
      const pdfBytes = await newPdf.save()
      results.push(pdfBytes.buffer as ArrayBuffer)
      
      self.postMessage({ 
        type: 'progress', 
        progress: ((i + 1) / chunks) * 100 
      } as WorkerResponse)
    }
  }

  self.postMessage({ 
    type: 'result', 
    data: results 
  } as WorkerResponse)
}

async function handleCompress(file: ArrayBuffer, quality: string) {
  const pdfDoc = await PDFDocument.load(file)
  
  self.postMessage({ type: 'progress', progress: 50 } as WorkerResponse)

  const saveOptions: { useObjectStreams?: boolean } = {}
  if (quality === 'low') {
    saveOptions.useObjectStreams = true
  }

  const compressedBytes = await pdfDoc.save(saveOptions)
  
  self.postMessage({ type: 'progress', progress: 100 } as WorkerResponse)
  self.postMessage({ 
    type: 'result', 
    data: compressedBytes.buffer as ArrayBuffer
  } as WorkerResponse)
}

export {}
