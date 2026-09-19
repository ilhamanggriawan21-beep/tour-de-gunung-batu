import jsPDF from 'jspdf';
import JSZip from 'jszip';

export interface ShippingItemForLabel {
  id: string; // PO ID
  nomor_bib?: number | string;
  nomor_registrasi?: string;
  nama_penerima: string;
  no_telepon_penerima: string;
  alamat_penerima: string;
  ukuran_jersey?: string;
  jenis_lengan?: string;
  qty: number;
  batch_produksi?: number | null;
  is_shipped?: boolean;
}

// A3+ Dimensions (329 x 483 mm) @ 300 DPI Portrait
const A3_PLUS_WIDTH = 3886;
const A3_PLUS_HEIGHT = 5705;

// Label dimensions for 16-up layout (2 columns x 8 rows or 4 columns x 4 rows)
// Let's use 3 columns x 6 rows = 18 labels or 2 columns x 8 rows = 16 labels.
// For shipping label with certificate appreciation text, 2 columns x 7 rows (14 cards) or 2 columns x 8 rows (16 cards):
// In 2 columns x 8 rows (16 labels per sheet):
// cardW = 1750 px (~148 mm), cardH = 650 px (~55 mm). Perfect proportions for shipping address + appreciation certificate!
const CARD_WIDTH = 1750;
const CARD_HEIGHT = 650;
const GAP_X = 80;
const GAP_Y = 40;

const TOTAL_GRID_W = CARD_WIDTH * 2 + GAP_X; // 3580 px (fits inside 3661 px printable area)
const TOTAL_GRID_H = CARD_HEIGHT * 8 + GAP_Y * 7; // 5200 + 280 = 5480 px (fits inside 5551 px printable area)

const START_X = Math.round((A3_PLUS_WIDTH - TOTAL_GRID_W) / 2);
const START_Y = Math.round((A3_PLUS_HEIGHT - TOTAL_GRID_H) / 2);

// Cache images
let cachedLogoPeaderal: HTMLImageElement | null = null;
let cachedLogoRudeboys: HTMLImageElement | null = null;
let cachedPeaberbagi: HTMLImageElement | null = null;

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

export async function ensureShippingLabelAssetsLoaded(): Promise<{
  logoPeaderal: HTMLImageElement | null;
  logoRudeboys: HTMLImageElement | null;
  peaberbagi: HTMLImageElement | null;
}> {
  if (!cachedLogoPeaderal) {
    cachedLogoPeaderal = await loadImage('/images/L.pea.dc.png');
  }
  if (!cachedLogoRudeboys) {
    cachedLogoRudeboys = await loadImage('/images/logo RB.png');
  }
  if (!cachedPeaberbagi) {
    cachedPeaberbagi = await loadImage('/images/Peaberbagi.dc.png');
  }
  return {
    logoPeaderal: cachedLogoPeaderal,
    logoRudeboys: cachedLogoRudeboys,
    peaberbagi: cachedPeaberbagi,
  };
}

/**
 * Draw Crop Marks around a rectangle (square corners)
 */
function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  markLen = 35,
  markGap = 10
) {
  ctx.save();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'square';

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(x - markGap, y);
  ctx.lineTo(x - markGap - markLen, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - markGap);
  ctx.lineTo(x, y - markGap - markLen);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(x + w + markGap, y);
  ctx.lineTo(x + w + markGap + markLen, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w, y - markGap);
  ctx.lineTo(x + w, y - markGap - markLen);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(x - markGap, y + h);
  ctx.lineTo(x - markGap - markLen, y + h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + h + markGap);
  ctx.lineTo(x, y + h + markGap + markLen);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(x + w + markGap, y + h);
  ctx.lineTo(x + w + markGap + markLen, y + h);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w, y + h + markGap);
  ctx.lineTo(x + w, y + h + markGap + markLen);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw Single Shipping Card + Appreciation Certificate
 * Card Dimension: 1750 x 650 px
 */
export function drawSingleShippingCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  item: ShippingItemForLabel,
  assets: {
    logoPeaderal: HTMLImageElement | null;
    logoRudeboys: HTMLImageElement | null;
    peaberbagi: HTMLImageElement | null;
  }
) {
  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;

  ctx.save();

  // 1. Card Background & Outer Border
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, w, h);

  // Outer border with gold accent
  ctx.strokeStyle = '#0A1338';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);

  // Inner decorative border
  ctx.strokeStyle = '#F4C716';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 6, y + 6, w - 12, h - 12);

  // 2. Card Layout: Left (Appreciation Certificate, w: 900px), Right (Shipping Address, w: 850px)
  const leftW = 910;
  const rightX = x + leftW;
  const rightW = w - leftW;

  // Vertical Separator Line
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(rightX, y + 10);
  ctx.lineTo(rightX, y + h - 10);
  ctx.stroke();

  // -------------------------------------------------------------
  // LEFT COLUMN: CERTIFICATE OF APPRECIATION & CHARITY IMPACT
  // -------------------------------------------------------------
  // Header Navy Banner
  ctx.fillStyle = '#0A1338';
  ctx.fillRect(x + 10, y + 10, leftW - 20, 52);

  // Logos in header banner
  if (assets.logoPeaderal && assets.logoPeaderal.complete) {
    ctx.drawImage(assets.logoPeaderal, x + 18, y + 14, 44, 44);
  }
  if (assets.logoRudeboys && assets.logoRudeboys.complete) {
    ctx.drawImage(assets.logoRudeboys, x + 68, y + 16, 42, 40);
  }

  // Header Title
  ctx.fillStyle = '#F4C716';
  ctx.font = '900 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('TOUR DE GUNUNG BATU 2026', x + 125, y + 36);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('OFFICIAL JERSEY CHARITY', x + leftW - 25, y + 36);

  // Certificate Heading
  ctx.fillStyle = '#1D3AAE';
  ctx.font = '900 21px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('CERTIFICATE OF APPRECIATION', x + 25, y + 92);

  // BIB & Order Tag
  const bibBadgeText = item.nomor_bib ? `BIB #${item.nomor_bib}` : (item.nomor_registrasi || 'PO JERSEY');
  ctx.fillStyle = '#0A1338';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(bibBadgeText, x + leftW - 25, y + 92);

  // Recipient / Participant Name
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Diberikan dengan rasa hormat kepada:', x + 25, y + 124);

  ctx.fillStyle = '#0A1338';
  ctx.font = '900 28px sans-serif';
  const cleanName = (item.nama_penerima || 'PARTISIPAN').trim().toUpperCase();
  ctx.fillText(cleanName, x + 25, y + 158);

  // Underline
  ctx.fillStyle = '#F4C716';
  ctx.fillRect(x + 25, y + 172, Math.min(600, ctx.measureText(cleanName).width + 30), 3.5);

  // Certificate Body Paragraph
  ctx.fillStyle = '#334155';
  ctx.font = '500 16.5px sans-serif';
  const lineH = 26;
  const bodyStartY = 212;

  ctx.fillText('Terima kasih atas partisipasi dan kepedulian Anda. Melalui pemesanan', x + 25, bodyStartY);
  ctx.fillText('Official Jersey ini, Anda telah menyumbangkan donasi senilai', x + 25, bodyStartY + lineH);

  // Donation highlight line
  ctx.font = 'bold 17px sans-serif';
  ctx.fillStyle = '#0F766E';
  ctx.fillText('Rp 35.000,- kepada pergerakan PEADERAL BERBAGI', x + 25, bodyStartY + lineH * 2);

  ctx.font = '500 16.5px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText('guna pengadaan unit sepeda layak untuk anak-anak yatim/piatu', x + 25, bodyStartY + lineH * 3);
  ctx.fillText('dan dhuafa yang membutuhkan.', x + 25, bodyStartY + lineH * 4);

  // Bottom impact badge
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(x + 20, y + h - 110, leftW - 40, 95);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 20, y + h - 110, leftW - 40, 95);

  if (assets.peaberbagi && assets.peaberbagi.complete) {
    ctx.drawImage(assets.peaberbagi, x + 30, y + h - 100, 75, 75);
  }

  ctx.fillStyle = '#0A1338';
  ctx.font = 'italic bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('"Berbayar dengan Senyuman"', x + 120, y + h - 70);

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('PEADERAL × RUDEBOYS CYCLIST  •  Jonggol, Bogor', x + 120, y + h - 40);

  // -------------------------------------------------------------
  // RIGHT COLUMN: SHIPPING ADDRESS LABEL (LABEL EKSPEDISI)
  // -------------------------------------------------------------
  // Header Ekspedisi Bar
  ctx.fillStyle = '#1D3AAE';
  ctx.fillRect(rightX + 10, y + 10, rightW - 20, 44);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LABEL PENGIRIMAN EKSPEDISI', rightX + rightW / 2, y + 32);

  // SENDER (PENGIRIM)
  const sendBoxY = y + 66;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(rightX + 12, sendBoxY, rightW - 24, 88);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rightX + 12, sendBoxY, rightW - 24, 88);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('PENGIRIM:', rightX + 22, sendBoxY + 20);

  ctx.fillStyle = '#0F172A';
  ctx.font = '900 17px sans-serif';
  ctx.fillText('PANITIA TOUR DE GUNUNG BATU', rightX + 22, sendBoxY + 44);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = 'bold 16px monospace';
  ctx.fillText('Telp/WA: +62 877-4587-0767', rightX + 22, sendBoxY + 70);

  // RECIPIENT (PENERIMA)
  const recvBoxY = sendBoxY + 100;
  const recvBoxH = 310;
  ctx.fillStyle = '#FFFBEB'; // Soft warm yellow
  ctx.fillRect(rightX + 12, recvBoxY, rightW - 24, recvBoxH);
  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 2;
  ctx.strokeRect(rightX + 12, recvBoxY, rightW - 24, recvBoxH);

  ctx.fillStyle = '#B45309';
  ctx.font = '900 14px sans-serif';
  ctx.fillText('PENERIMA (TUJUAN):', rightX + 22, recvBoxY + 22);

  // Recipient Name
  ctx.fillStyle = '#0A1338';
  ctx.font = '900 23px sans-serif';
  ctx.fillText(cleanName, rightX + 22, recvBoxY + 54);

  // Recipient Phone
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 19px monospace';
  const cleanPhone = item.no_telepon_penerima || '-';
  ctx.fillText(`No. Telp / WA: ${cleanPhone}`, rightX + 22, recvBoxY + 86);

  // Address
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('Alamat Lengkap:', rightX + 22, recvBoxY + 116);

  ctx.fillStyle = '#0F172A';
  ctx.font = '600 17px sans-serif';
  const rawAddr = item.alamat_penerima || 'Alamat tidak dicantumkan (Hubungi penerima)';
  const addrLines = wrapAddressText(ctx, rawAddr, rightW - 55);

  let addrLineY = recvBoxY + 144;
  for (let i = 0; i < addrLines.length && i < 6; i++) {
    ctx.fillText(addrLines[i], rightX + 22, addrLineY);
    addrLineY += 24;
  }

  // PACKAGE CONTENT FOOTER
  const pkgY = recvBoxY + recvBoxH + 12;
  ctx.fillStyle = '#0A1338';
  ctx.fillRect(rightX + 12, pkgY, rightW - 24, 60);

  ctx.fillStyle = '#F4C716';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('ISI PAKET: OFFICIAL JERSEY', rightX + 24, pkgY + 24);

  const sleeveLabel = item.jenis_lengan === 'long_sleeve' ? 'Lengan Panjang' : 'Lengan Pendek';
  const sizeLabel = item.ukuran_jersey || 'Standard';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 16px sans-serif';
  ctx.fillText(`Ukuran: ${sizeLabel} • ${sleeveLabel} (${item.qty || 1} pcs)`, rightX + 24, pkgY + 46);

  ctx.restore();
}

function wrapAddressText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxW && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Render a Single A3+ Master Sheet Containing up to 16 Shipping Labels (2 cols x 8 rows)
 */
function renderA3PlusShippingSheet(
  sheetCanvas: HTMLCanvasElement,
  sheetCtx: CanvasRenderingContext2D,
  items: ShippingItemForLabel[],
  assets: {
    logoPeaderal: HTMLImageElement | null;
    logoRudeboys: HTMLImageElement | null;
    peaberbagi: HTMLImageElement | null;
  }
) {
  const w = A3_PLUS_WIDTH;
  const h = A3_PLUS_HEIGHT;
  sheetCanvas.width = w;
  sheetCanvas.height = h;

  // Clear sheet to pure white
  sheetCtx.fillStyle = '#FFFFFF';
  sheetCtx.fillRect(0, 0, w, h);

  // Draw 2 columns x 8 rows = 16 labels per sheet
  for (let i = 0; i < items.length && i < 16; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const posX = START_X + col * (CARD_WIDTH + GAP_X);
    const posY = START_Y + row * (CARD_HEIGHT + GAP_Y);

    drawSingleShippingCard(sheetCtx, posX, posY, items[i], assets);
    drawCropMarks(sheetCtx, posX, posY, CARD_WIDTH, CARD_HEIGHT, 40, 10);
  }

  // Cutting guidelines between columns
  const midX = START_X + CARD_WIDTH + GAP_X / 2;
  sheetCtx.save();
  sheetCtx.strokeStyle = '#94A3B8';
  sheetCtx.lineWidth = 2;
  sheetCtx.setLineDash([12, 10]);
  sheetCtx.beginPath();
  sheetCtx.moveTo(midX, START_Y - 15);
  sheetCtx.lineTo(midX, START_Y + TOTAL_GRID_H + 15);
  sheetCtx.stroke();

  // Cutting guidelines between rows
  for (let r = 1; r < 8; r++) {
    const lineY = START_Y + r * CARD_HEIGHT + (r - 0.5) * GAP_Y;
    sheetCtx.beginPath();
    sheetCtx.moveTo(START_X - 20, lineY);
    sheetCtx.lineTo(START_X + TOTAL_GRID_W + 20, lineY);
    sheetCtx.stroke();
  }
  sheetCtx.restore();
}

/**
 * Bulk Generate Shipping Labels as a Single Multi-Page PDF (A3+ @ 300 DPI)
 */
export async function generateBulkShippingLabelsPdf(
  items: ShippingItemForLabel[],
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  const total = items.length;
  if (total === 0) throw new Error('Tidak ada data paket pengiriman untuk dicetak.');

  onProgress?.(5, 'Memuat aset logo & template...');
  const assets = await ensureShippingLabelAssetsLoaded();

  const perSheet = 16;
  const totalSheets = Math.ceil(total / perSheet);

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = A3_PLUS_WIDTH;
  sheetCanvas.height = A3_PLUS_HEIGHT;
  const sheetCtx = sheetCanvas.getContext('2d');
  if (!sheetCtx) throw new Error('Browser tidak mendukung 2D Canvas context.');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [329, 483], // A3+ mm
    compress: true,
  });

  for (let s = 0; s < totalSheets; s++) {
    const sheetItems = items.slice(s * perSheet, (s + 1) * perSheet);
    const pct = Math.round(10 + ((s + 1) / totalSheets) * 80);
    onProgress?.(pct, `Merender Lembar A3+ #${s + 1} dari ${totalSheets} (${sheetItems.length} label)...`);

    renderA3PlusShippingSheet(sheetCanvas, sheetCtx, sheetItems, assets);

    const imgData = sheetCanvas.toDataURL('image/jpeg', 0.94);

    if (s > 0) doc.addPage([329, 483], 'portrait');
    doc.addImage(imgData, 'JPEG', 0, 0, 329, 483, undefined, 'FAST');

    await new Promise((r) => setTimeout(r, 20));
  }

  onProgress?.(95, 'Menyusun file PDF...');
  const pdfBlob = doc.output('blob');
  onProgress?.(100, 'Selesai!');
  return pdfBlob;
}
