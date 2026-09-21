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

  const rawName = (item.nama_lengkap || '').trim();
  const nameText = rawName.toUpperCase();

  // Render nama peserta hanya jika tersedia. Jika kosong, biarkan garis kosong untuk ditulis manual
  if (nameText) {
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
  }

  ctx.restore();
}

/**
 * Render a single A3+ sheet with up to 21 certificate cards
 * @param itemsOnSheet Daftar kartu peserta pada lembar ini
 * @param certImage Template latar belakang sertifikat
 * @param padToFullSheet Jika true, otomatis penuhkan slot hingga 21 kartu dengan nama kosong
 */
export function renderA3CertificateSheet(
  itemsOnSheet: CertificateParticipant[],
  certImage: HTMLImageElement,
  padToFullSheet = true
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = A3_PLUS_WIDTH;
  canvas.height = A3_PLUS_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get 2D context');

  // Background clean white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, A3_PLUS_WIDTH, A3_PLUS_HEIGHT);

  // Jika kartu kurang dari 21 dan padToFullSheet diaktifkan, penuhkan sampai 21 slot
  const cardsToRender = [...itemsOnSheet];
  if (padToFullSheet && cardsToRender.length < CARDS_PER_SHEET) {
    const needed = CARDS_PER_SHEET - cardsToRender.length;
    for (let i = 0; i < needed; i++) {
      cardsToRender.push({
        id: `blank-slot-${i + 1}`,
        nama_lengkap: '', // Dikosongkan agar bisa ditulis manual
      });
    }
  }

  // Grid layout (3 cols x 7 rows = 21 cards)
  for (let idx = 0; idx < cardsToRender.length; idx++) {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);

    const x = START_X + col * (CARD_WIDTH + GAP_X);
    const y = START_Y + row * (CARD_HEIGHT + GAP_Y);

    const item = cardsToRender[idx];
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
 * Lembar terakhir otomatis dipenuhi sampai 21 kartu (kartu tambahan dikosongkan namanya untuk ditulis manual)
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

  // Penuhkan daftar kartu hingga kelipatan 21 (CARDS_PER_SHEET)
  // Jadi lembar terakhir tidak akan ada slot kosong
  const remainder = items.length % CARDS_PER_SHEET;
  const paddingCount = remainder === 0 ? 0 : CARDS_PER_SHEET - remainder;

  const paddedItems: CertificateParticipant[] = [...items];
  for (let i = 0; i < paddingCount; i++) {
    paddedItems.push({
      id: `blank-manual-${i + 1}`,
      nama_lengkap: '', // Kosongkan nama untuk ditulis manual
    });
  }

  // Calculate pages
  const totalSheets = Math.ceil(paddedItems.length / CARDS_PER_SHEET);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [329, 483], // A3+ standard
    compress: true,
  });

  for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
    const startIdx = sheetIdx * CARDS_PER_SHEET;
    const endIdx = startIdx + CARDS_PER_SHEET;
    const sheetItems = paddedItems.slice(startIdx, endIdx);

    const isLastSheet = sheetIdx === totalSheets - 1;
    const extraMsg = isLastSheet && paddingCount > 0 ? ` (+${paddingCount} kartu manual kosong)` : '';

    const pct = Math.round(((sheetIdx + 1) / totalSheets) * 90);
    onProgress?.(
      pct,
      `Merender lembar A3+ ke-${sheetIdx + 1} dari ${totalSheets} (21 kartu${extraMsg})...`
    );

    // Yield control to UI thread
    await new Promise((resolve) => setTimeout(resolve, 30));

    const sheetCanvas = renderA3CertificateSheet(sheetItems, certImage, false);

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
