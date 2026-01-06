import QRCode from 'qrcode'

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const { width = 256, margin = 2, color } = options

  return QRCode.toDataURL(text, {
    width,
    margin,
    color: {
      dark: color?.dark || '#000000',
      light: color?.light || '#ffffff',
    },
  })
}

export async function generateQRCodeSVG(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const { margin = 2, color } = options

  return QRCode.toString(text, {
    type: 'svg',
    margin,
    color: {
      dark: color?.dark || '#000000',
      light: color?.light || '#ffffff',
    },
  })
}
