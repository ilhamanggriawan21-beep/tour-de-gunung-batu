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

// Source dimensions of public/label ekspedisi.png
const SOURCE_WIDTH = 1265;
const SOURCE_HEIGHT = 849;

// 21-up layout on A3+ sheet (3 columns x 7 rows)
const COLS = 3;
const ROWS = 7;
export const CARDS_PER_SHEET = COLS * ROWS; // 21

// Card dimensions on A3+ sheet (maintains exact aspect ratio of 1265 x 849)
const CARD_WIDTH = 1150;
const CARD_HEIGHT = 772;
const GAP_X = 25;
const GAP_Y = 15;

const TOTAL_GRID_W = CARD_WIDTH * COLS + GAP_X * (COLS - 1); // 3450 + 50 = 3500 px
const TOTAL_GRID_H = CARD_HEIGHT * ROWS + GAP_Y * (ROWS - 1); // 5404 + 90 = 5494 px

const START_X = Math.round((A3_PLUS_WIDTH - TOTAL_GRID_W) / 2); // ~193 px (~16.3 mm)
const START_Y = Math.round((A3_PLUS_HEIGHT - TOTAL_GRID_H) / 2); // ~105 px (~8.9 mm)

// Cache template image
let cachedLabelTemplate: HTMLImageElement | null = null;

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

export async function ensureShippingLabelAssetsLoaded(): Promise<HTMLImageElement | null> {
  if (!cachedLabelTemplate) {
    cachedLabelTemplate = await loadImage('/label%20ekspedisi.png');
  }
  return cachedLabelTemplate;
}

/**
 * Draw Crop Marks around a card
 */
function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  markLen = 28,
  markGap = 8
) {
  ctx.save();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
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
 * Render a single shipping label card at full source resolution (1265 x 849 px)
 */
export function renderSingleShippingCard(
  item: ShippingItemForLabel,
  templateImg: HTMLImageElement
): HTMLCanvasElement {
  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = SOURCE_WIDTH;
  cardCanvas.height = SOURCE_HEIGHT;
  const ctx = cardCanvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2D context for shipping card');

  // 1. Draw Template Image
  ctx.drawImage(templateImg, 0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);

  ctx.fillStyle = '#0A1338';
  ctx.textBaseline = 'alphabetic';

  // 2. Nama Penerima
  // Line is at Y=373, ends at X=1014. Start at X=325
  const rawName = (item.nama_penerima || 'PEMESAN JERSEY').trim().toUpperCase();
  let nameFontSize = 26;
  ctx.font = `bold ${nameFontSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
  const maxNameWidth = 680;
  while (ctx.measureText(rawName).width > maxNameWidth && nameFontSize > 17) {
    nameFontSize -= 1;
    ctx.font = `bold ${nameFontSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
  }
  ctx.fillText(rawName, 325, 365);

  // 3. No. Handphone
  // Line is at Y=429, ends at X=1014. Start at X=445
  const rawPhone = (item.no_telepon_penerima || '-').trim();
  let phoneFontSize = 24;
  ctx.font = `bold ${phoneFontSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
  const maxPhoneWidth = 560;
  while (ctx.measureText(rawPhone).width > maxPhoneWidth && phoneFontSize > 16) {
    phoneFontSize -= 1;
    ctx.font = `bold ${phoneFontSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
  }
  ctx.fillText(rawPhone, 445, 421);

  // 4. Alamat Lengkap (3 Lines Auto-wrap)
  // Line 1: Y=485, start X=470, max width 535
  // Line 2: Y=541, start X=255, max width 750
  // Line 3: Y=596, start X=255, max width 750
  const addressFontSize = 19;
  ctx.font = `bold ${addressFontSize}px 'Plus Jakarta Sans', Arial, sans-serif`;
  ctx.fillStyle = '#0F172A';

  const rawAddress = (item.alamat_penerima || '-').replace(/\r?\n|\r/g, ' ').trim();
  const words = rawAddress.split(/\s+/);

  let line1 = '';
  let line2 = '';
  let line3 = '';
  let wordIdx = 0;

  // Build Line 1 (max width 535)
  while (wordIdx < words.length) {
    const test = line1 ? `${line1} ${words[wordIdx]}` : words[wordIdx];
    if (ctx.measureText(test).width <= 535) {
      line1 = test;
      wordIdx++;
    } else {
      break;
    }
  }

  // Build Line 2 (max width 750)
  while (wordIdx < words.length) {
    const test = line2 ? `${line2} ${words[wordIdx]}` : words[wordIdx];
    if (ctx.measureText(test).width <= 750) {
      line2 = test;
      wordIdx++;
    } else {
      break;
    }
  }

  // Build Line 3 (max width 750)
  while (wordIdx < words.length) {
    const test = line3 ? `${line3} ${words[wordIdx]}` : words[wordIdx];
    if (ctx.measureText(test).width <= 750) {
      line3 = test;
      wordIdx++;
    } else {
      // If words still remain, append ellipsis if possible
      if (line3.length > 3) {
        line3 = line3.slice(0, -3) + '...';
      }
      break;
    }
  }

  if (line1) ctx.fillText(line1, 470, 477);
  if (line2) ctx.fillText(line2, 255, 533);
  if (line3) ctx.fillText(line3, 255, 588);

  // 5. Detail Pesanan
  // Cover placeholder [Size: __ / Sleeve: __ / Qty: __] with clean white box
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(665, 680, 360, 38);

  const sleeveStr = item.jenis_lengan === 'long_sleeve' ? 'Panjang' : 'Pendek';
  const sizeStr = (item.ukuran_jersey || '-').toUpperCase();
  const qtyStr = `${item.qty || 1} pcs`;
  const detailText = `[Size: ${sizeStr} / Sleeve: ${sleeveStr} / Qty: ${qtyStr}]`;

  ctx.fillStyle = '#0F172A';
  ctx.font = `bold 19px 'Plus Jakarta Sans', Arial, sans-serif`;
  ctx.fillText(detailText, 675, 705);

  return cardCanvas;
}

/**
 * Render a single A3+ sheet with up to 21 shipping label cards
 */
export function renderA3ShippingSheet(
  itemsOnSheet: ShippingItemForLabel[],
  templateImg: HTMLImageElement
): HTMLCanvasElement {
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = A3_PLUS_WIDTH;
  sheetCanvas.height = A3_PLUS_HEIGHT;
  const ctx = sheetCanvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2D context for A3+ sheet');

  // Clean white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, A3_PLUS_WIDTH, A3_PLUS_HEIGHT);

  for (let idx = 0; idx < itemsOnSheet.length; idx++) {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);

    const x = START_X + col * (CARD_WIDTH + GAP_X);
    const y = START_Y + row * (CARD_HEIGHT + GAP_Y);

    const item = itemsOnSheet[idx];
    const cardCanvas = renderSingleShippingCard(item, templateImg);

    // Draw scaled card onto sheet
    ctx.drawImage(cardCanvas, x, y, CARD_WIDTH, CARD_HEIGHT);

    // Draw cutting crop marks
    drawCropMarks(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 28, 8);

    // Draw dashed outer border guide
    ctx.save();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 10]);
    ctx.strokeRect(x, y, CARD_WIDTH, CARD_HEIGHT);
    ctx.restore();
  }

  return sheetCanvas;
}

/**
 * Generate Bulk Shipping Labels PDF in A3+ (21 cards per sheet)
 */
export async function generateBulkShippingLabelsPdf(
  items: ShippingItemForLabel[],
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  if (items.length === 0) {
    throw new Error('Tidak ada data paket pengiriman untuk dicetak.');
  }

  onProgress?.(5, 'Memuat aset template label ekspedisi...');
  const templateImg = await ensureShippingLabelAssetsLoaded();
  if (!templateImg) {
    throw new Error('Gagal memuat template label (/label ekspedisi.png). Pastikan file tersedia.');
  }

  const totalSheets = Math.ceil(items.length / CARDS_PER_SHEET);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [329, 483], // A3+ standard
    compress: true,
  });

  for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
    const startIdx = sheetIdx * CARDS_PER_SHEET;
    const endIdx = Math.min(startIdx + CARDS_PER_SHEET, items.length);
    const sheetItems = items.slice(startIdx, endIdx);

    const pct = Math.round(((sheetIdx + 1) / totalSheets) * 90);
    onProgress?.(
      pct,
      `Merender lembar A3+ ke-${sheetIdx + 1} dari ${totalSheets} (${sheetItems.length} label)...`
    );

    // Yield control to UI thread
    await new Promise((resolve) => setTimeout(resolve, 30));

    const sheetCanvas = renderA3ShippingSheet(sheetItems, templateImg);
    const sheetImgData = sheetCanvas.toDataURL('image/jpeg', 0.94);

    if (sheetIdx > 0) {
      pdf.addPage([329, 483], 'portrait');
    }

    pdf.addImage(sheetImgData, 'JPEG', 0, 0, 329, 483, undefined, 'FAST');
  }

  onProgress?.(96, 'Menyusun file PDF A3+...');
  await new Promise((resolve) => setTimeout(resolve, 30));

  const pdfBlob = pdf.output('blob');
  onProgress?.(100, 'Selesai!');
  return pdfBlob;
}
