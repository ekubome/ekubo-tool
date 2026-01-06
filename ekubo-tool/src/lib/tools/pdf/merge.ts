import { PDFDocument } from 'pdf-lib'

export async function mergePDFs(
  files: File[],
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const mergedPdf = await PDFDocument.create()
  const totalFiles = files.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await PDFDocument.load(arrayBuffer)
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    
    pages.forEach((page) => {
      mergedPdf.addPage(page)
    })

    onProgress?.(((i + 1) / totalFiles) * 100)
    
    // 让出主线程，避免长时间阻塞 UI
    await yieldToMain()
  }

  const mergedPdfBytes = await mergedPdf.save()
  return new Blob([new Uint8Array(mergedPdfBytes)], { type: 'application/pdf' })
}

// 让出主线程，保持 UI 响应
function yieldToMain(): Promise<void> {
  return new Promise(resolve => {
    if ('scheduler' in globalThis && 'yield' in (globalThis as any).scheduler) {
      (globalThis as any).scheduler.yield().then(resolve)
    } else {
      setTimeout(resolve, 0)
    }
  })
}
