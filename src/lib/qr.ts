import 'server-only';

import QRCode from 'qrcode';

const DEFAULT_APP_URL = 'http://localhost:3000';

export function buildReportUrl(reportId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL;
  return `${appUrl.replace(/\/$/, '')}/reportes/${reportId}`;
}

export async function generateReportQrDataUrl(reportId: string) {
  return QRCode.toDataURL(buildReportUrl(reportId), {
    errorCorrectionLevel: 'M',
    margin: 2,
    scale: 8,
    type: 'image/png',
    color: {
      dark: '#0c0a09',
      light: '#ffffff',
    },
  });
}
