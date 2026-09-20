import jsPDF from 'jspdf';
import JSZip from 'jszip';

export interface CertificateParticipant {
  id: string;
  nomor_bib?: number | string;
  nomor_registrasi?: string;
  nama_lengkap: string;
  komunitas?: string;
  ukuran_jersey?: string;
  jenis_lengan?: string;
  batch_produksi?: number | null;
  metode_ambil?: string;
}

// A3+ Dimensions (329 x 483 mm) @ 300 DPI Portrait
const A3_PLUS_WIDTH = 3886;
const A3_PLUS_HEIGHT = 5705;

// Single Certificate Card Dimensions (100 mm x 65 mm @ 300 DPI)
// Matches public/sertifikat.png exactly (1181 x 768 px)
const CARD_WIDTH = 1181;
const CARD_HEIGHT = 768;

// 21-up grid imposition (3 columns x 7 rows)
const COLS = 3;
const ROWS = 7;
const CARDS_PER_SHEET = COLS * ROWS; // 21

const GAP_X = 30; // Horizontal gap between cards
const GAP_Y = 20; // Vertical gap between cards

const TOTAL_GRID_W = CARD_WIDTH * COLS + GAP_X * (COLS - 1); // 3543 + 60 = 3603 px
const TOTAL_GRID_H = CARD_HEIGHT * ROWS + GAP_Y * (ROWS - 1); // 5376 + 120 = 5496 px

const START_X = Math.round((A3_PLUS_WIDTH - TOTAL_GRID_W) / 2); // ~141 px (~12 mm)
const START_Y = Math.round((A3_PLUS_HEIGHT - TOTAL_GRID_H) / 2); // ~104 px (~8.8 mm)

// Cache the certificate background image
let cachedCertTemplate: HTMLImageElement | null = null;

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
}

export async function ensureCertificateTemplateLoaded(): Promise<HTMLImageElement | null> {
  if (!cachedCertTemplate) {
    cachedCertTemplate = await loadImage('/sertifikat.png');
  }
  return cachedCertTemplate;
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
  markLen = 30,
  markGap = 10
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
 * Render a single certificate card (1181 x 768 px)
 */
export function renderSingleCertificate(
  ctx: CanvasRenderingContext2D,
  item: CertificateParticipant,
  certImage: HTMLImageElement,
  dx = 0,
  dy = 0
) {
  ctx.save();
  ctx.translate(dx, dy);

  // 1. Draw Template Background
  ctx.drawImage(certImage, 0, 0, CARD_WIDTH, CARD_HEIGHT);

  // 2. Render Participant Name in Classic Elegant Serif (Opsi A)
  // The line is horizontally centered from X=190 to X=990 (width 800px) at Y=378
  const centerX = CARD_WIDTH / 2; // 590.5 px
  const baselineY = 362; // Baseline sits just ~16px above the underline (Y=378)
  const maxTextWidth = 760; // Safe width within the line

  const rawName = (item.nama_lengkap || 'PESERTA TOUR DE GUNUNG BATU').trim();
  const nameText = rawName.toUpperCase();

  // Dynamic font sizing (starts at 42px bold serif)
  let fontSize = 42;
  ctx.font = `bold ${fontSize}px 'Cinzel', 'Times New Roman', 'Playfair Display', Georgia, serif`;
  while (ctx.measureText(nameText).width > maxTextWidth && fontSize > 20) {
    fontSize -= 2;
    ctx.font = `bold ${fontSize}px 'Cinzel', 'Times New Roman', 'Playfair Display', Georgia, serif`;
  }

  // Exact Deep Navy Blue matching sertifikat.png text
  ctx.fillStyle = '#0c1963';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(nameText, centerX, baselineY);

  ctx.restore();
}

/**
 * Render a single A3+ sheet with up to 21 certificate cards
 */
export function renderA3CertificateSheet(
  itemsOnSheet: CertificateParticipant[],
  certImage: HTMLImageElement
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = A3_PLUS_WIDTH;
  canvas.height = A3_PLUS_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2D context');

  // Background clean white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, A3_PLUS_WIDTH, A3_PLUS_HEIGHT);

  // Grid layout (3 cols x 7 rows = 21 cards)
  for (let idx = 0; idx < itemsOnSheet.length; idx++) {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);

    const x = START_X + col * (CARD_WIDTH + GAP_X);
    const y = START_Y + row * (CARD_HEIGHT + GAP_Y);

    const item = itemsOnSheet[idx];
    renderSingleCertificate(ctx, item, certImage, x, y);

    // Draw cutting crop marks around each card
    drawCropMarks(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 30, 8);

    // Draw dashed outer border guide
    ctx.save();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([12, 10]);
    ctx.strokeRect(x, y, CARD_WIDTH, CARD_HEIGHT);
    ctx.restore();
  }

  return canvas;
}

/**
 * Generate Bulk Certificates PDF in A3+ (21 cards per sheet)
 */
export async function generateBulkCertificatesPdf(
  items: CertificateParticipant[],
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  if (items.length === 0) {
    throw new Error('Tidak ada data peserta untuk dicetak.');
  }

  onProgress?.(5, 'Memuat aset template sertifikat ucapan...');
  const certImage = await ensureCertificateTemplateLoaded();
  if (!certImage) {
    throw new Error('Gagal memuat template sertifikat (/sertifikat.png). Pastikan file tersedia.');
  }

  // Calculate pages
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
      `Merender lembar A3+ ke-${sheetIdx + 1} dari ${totalSheets} (${sheetItems.length} kartu)...`
    );

    // Yield control to UI thread
    await new Promise((resolve) => setTimeout(resolve, 30));

    const sheetCanvas = renderA3CertificateSheet(sheetItems, certImage);

    // High quality JPEG compression for PDF
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
