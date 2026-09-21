import JSZip from 'jszip';
import jsPDF from 'jspdf';
import {
  ParticipantForBib,
  ensureSakanaFontLoaded,
  ensureTemplateImageLoaded,
  drawBibParticipant,
} from './bulkBibZip';

export interface BibA3SheetProgress {
  currentSheet: number;
  totalSheets: number;
  percent: number;
  currentLabel: string;
  stage: 'loading_assets' | 'rendering_sheets' | 'zipping' | 'done' | 'cancelled';
}

export interface BibA3Options {
  layout: '8_per_sheet_a3_plus' | '4_per_sheet' | '2_per_sheet';
  includeCropMarks: boolean;
}

// Canvas dimensions for A3+ (329 x 483 mm) @ 300 DPI Portrait
// 329 mm: 3886 px, 483 mm: 5705 px
// Max printable area: 310 x 470 mm (3661 x 5551 px @ 300 DPI)
const A3_PLUS_WIDTH = 3886;
const A3_PLUS_HEIGHT = 5705;

// Canvas dimensions for standard A3 (297 x 420 mm) @ 300 DPI Landscape
const A3_WIDTH = 4960;
const A3_HEIGHT = 3508;

// Dimensions for single card buffer canvas
const CARD_BUFFER_WIDTH = 2482;
const CARD_BUFFER_HEIGHT = 1749;

/**
 * Draw professional crop marks (garis potong) around a rectangular box
 */
function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  markLen = 50,
  markGap = 12
) {
  ctx.save();
  ctx.strokeStyle = '#1E293B'; // Deep dark slate/black
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'square';

  // 1. Top-Left Corner
  // Horizontal line (pointing left)
  ctx.beginPath();
  ctx.moveTo(x - markGap, y);
  ctx.lineTo(x - markGap - markLen, y);
  ctx.stroke();
  // Vertical line (pointing up)
  ctx.beginPath();
  ctx.moveTo(x, y - markGap);
  ctx.lineTo(x, y - markGap - markLen);
  ctx.stroke();

  // 2. Top-Right Corner
  // Horizontal line (pointing right)
  ctx.beginPath();
  ctx.moveTo(x + w + markGap, y);
  ctx.lineTo(x + w + markGap + markLen, y);
  ctx.stroke();
  // Vertical line (pointing up)
  ctx.beginPath();
  ctx.moveTo(x + w, y - markGap);
  ctx.lineTo(x + w, y - markGap - markLen);
  ctx.stroke();

  // 3. Bottom-Left Corner
  // Horizontal line (pointing left)
  ctx.beginPath();
  ctx.moveTo(x - markGap, y + h);
  ctx.lineTo(x - markGap - markLen, y + h);
  ctx.stroke();
  // Vertical line (pointing down)
  ctx.beginPath();
  ctx.moveTo(x, y + h + markGap);
  ctx.lineTo(x, y + h + markGap - markLen);
  ctx.stroke();

  // 4. Bottom-Right Corner
  // Horizontal line (pointing right)
  ctx.beginPath();
  ctx.moveTo(x + w + markGap, y + h);
  ctx.lineTo(x + w + markGap + markLen, y + h);
  ctx.stroke();
  // Vertical line (pointing down)
  ctx.beginPath();
  ctx.moveTo(x + w, y + h + markGap);
  ctx.lineTo(x + w, y + h + markGap + markLen);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw dashed cutting guide line between adjacent cards
 */
function drawCuttingGuideBetween(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  ctx.save();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Render a single A3 sheet containing up to 4 BIBs (2x2)
 */
function renderA3Sheet4Up(
  sheetCanvas: HTMLCanvasElement,
  sheetCtx: CanvasRenderingContext2D,
  cardCanvases: HTMLCanvasElement[],
  participants: ParticipantForBib[],
  sheetIndex: number,
  totalSheets: number,
  options: BibA3Options
) {
  const w = A3_WIDTH;
  const h = A3_HEIGHT;

  // Clear sheet to pure white
  sheetCtx.fillStyle = '#FFFFFF';
  sheetCtx.fillRect(0, 0, w, h);

  // Layout parameters for 2x2 grid
  const cardW = 2280;
  const cardH = 1606;
  const gapX = 100;
  const gapY = 80;
  const startX = Math.round((w - (cardW * 2 + gapX)) / 2);
  const startY = Math.round((h - (cardH * 2 + gapY)) / 2);

  // Grid Positions:
  const positions = [
    { x: startX, y: startY },
    { x: startX + cardW + gapX, y: startY },
    { x: startX, y: startY + cardH + gapY },
    { x: startX + cardW + gapX, y: startY + cardH + gapY },
  ];

  // Draw each card onto sheet
  for (let i = 0; i < participants.length && i < 4; i++) {
    const pos = positions[i];
    const cardCanvas = cardCanvases[i];

    // Stamp the card buffer
    sheetCtx.drawImage(cardCanvas, 0, 0, CARD_BUFFER_WIDTH, CARD_BUFFER_HEIGHT, pos.x, pos.y, cardW, cardH);

    // Draw Crop Marks if enabled
    if (options.includeCropMarks) {
      drawCropMarks(sheetCtx, pos.x, pos.y, cardW, cardH, 50, 14);
    }
  }

  // Draw central cutting guidelines
  if (options.includeCropMarks) {
    const midX = startX + cardW + gapX / 2;
    const midY = startY + cardH + gapY / 2;

    // Vertical dashed center line
    drawCuttingGuideBetween(sheetCtx, midX, startY - 20, midX, startY + cardH * 2 + gapY + 20);
    // Horizontal dashed center line
    drawCuttingGuideBetween(sheetCtx, startX - 20, midY, startX + cardW * 2 + gapX + 20, midY);
  }
}

/**
 * Render a single A3 sheet containing 2 large BIBs (2x1)
 */
function renderA3Sheet2Up(
  sheetCanvas: HTMLCanvasElement,
  sheetCtx: CanvasRenderingContext2D,
  cardCanvases: HTMLCanvasElement[],
  participants: ParticipantForBib[],
  sheetIndex: number,
  totalSheets: number,
  options: BibA3Options
) {
  const w = A3_WIDTH;
  const h = A3_HEIGHT;

  sheetCtx.fillStyle = '#FFFFFF';
  sheetCtx.fillRect(0, 0, w, h);

  const cardW = 3300;
  const cardH = 1550;
  const gapY = 120;
  const startX = Math.round((w - cardW) / 2);
  const startY = Math.round((h - (cardH * 2 + gapY)) / 2);

  const positions = [
    { x: startX, y: startY },
    { x: startX, y: startY + cardH + gapY },
  ];

  for (let i = 0; i < participants.length && i < 2; i++) {
    const pos = positions[i];
    const cardCanvas = cardCanvases[i];
    sheetCtx.drawImage(cardCanvas, 0, 0, CARD_BUFFER_WIDTH, CARD_BUFFER_HEIGHT, pos.x, pos.y, cardW, cardH);
    if (options.includeCropMarks) {
      drawCropMarks(sheetCtx, pos.x, pos.y, cardW, cardH, 60, 16);
    }
  }

  if (options.includeCropMarks) {
    const midY = startY + cardH + gapY / 2;
    drawCuttingGuideBetween(sheetCtx, startX - 30, midY, startX + cardW + 30, midY);
  }
}

/**
 * Render a single A3+ sheet (329 x 483 mm) containing up to 8 BIBs (2 columns x 4 rows)
 * Max printable area: 310 x 470 mm
 * Card size: 1770 x 1247 px (~150 x 105.7 mm @ 300 DPI)
 */
function renderA3PlusSheet8Up(
  sheetCanvas: HTMLCanvasElement,
  sheetCtx: CanvasRenderingContext2D,
  cardCanvases: HTMLCanvasElement[],
  participants: ParticipantForBib[],
  sheetIndex: number,
  totalSheets: number,
  options: BibA3Options
) {
  const w = A3_PLUS_WIDTH;
  const h = A3_PLUS_HEIGHT;
  sheetCanvas.width = w;
  sheetCanvas.height = h;

  // Clear sheet to pure white
  sheetCtx.fillStyle = '#FFFFFF';
  sheetCtx.fillRect(0, 0, w, h);

  // Card dimensions: 1770 x 1247 px (~150 mm x 105.7 mm @ 300 DPI)
  const cardW = 1770;
  const cardH = 1247;
  const gapX = 70; // gap between 2 columns (~5.9 mm)
  const gapY = 50; // gap between 4 rows (~4.2 mm)

  const totalGridW = cardW * 2 + gapX; // 3610 px (fits within 3661 px printable W)
  const totalGridH = cardH * 4 + gapY * 3; // 5138 px (fits within 5551 px printable H)

  const startX = Math.round((w - totalGridW) / 2); // 138 px (~11.7 mm margin)
  const startY = Math.round((h - totalGridH) / 2); // perfectly centered vertically

  // Grid: 2 columns x 4 rows (8 cards)
  for (let i = 0; i < participants.length && i < 8; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const posX = startX + col * (cardW + gapX);
    const posY = startY + row * (cardH + gapY);

    const cardCanvas = cardCanvases[i];

    // Stamp the card buffer
    sheetCtx.drawImage(cardCanvas, 0, 0, CARD_BUFFER_WIDTH, CARD_BUFFER_HEIGHT, posX, posY, cardW, cardH);

    // Draw Crop Marks if enabled
    if (options.includeCropMarks) {
      drawCropMarks(sheetCtx, posX, posY, cardW, cardH, 45, 12);
    }
  }

  // Draw central cutting guidelines between cards
  if (options.includeCropMarks) {
    const midX = startX + cardW + gapX / 2;

    // Vertical dashed center line
    drawCuttingGuideBetween(sheetCtx, midX, startY - 15, midX, startY + totalGridH + 15);

    // Horizontal dashed lines between rows
    for (let r = 1; r < 4; r++) {
      const lineY = startY + r * cardH + (r - 0.5) * gapY;
      drawCuttingGuideBetween(sheetCtx, startX - 20, lineY, startX + totalGridW + 20, lineY);
    }
  }
}

/**
 * Penuhkan daftar peserta BIB ke kelipatan lembar (A3+ = 8 kartu, A3 4-up = 4 kartu, 2-up = 2 kartu)
 * Nomor BIB kosong lanjutan berurutan dari nomor terakhir, tanpa nama dan tanpa komunitas
 */
export function padBibParticipantsToFullSheets(
  participants: ParticipantForBib[],
  itemsPerSheet: number
): ParticipantForBib[] {
  if (participants.length === 0) return [];
  const remainder = participants.length % itemsPerSheet;
  if (remainder === 0) return participants;

  const needed = itemsPerSheet - remainder;
  const maxBib = Math.max(...participants.map((p) => p.nomor_bib || 0));

  const padded: ParticipantForBib[] = [...participants];
  for (let i = 1; i <= needed; i++) {
    padded.push({
      id: `blank-bib-pad-${maxBib + i}`,
      nomor_bib: maxBib + i,
      nama_lengkap: '', // Dikosongkan agar bisa ditulis manual
      komunitas: '', // Komunitas dikosongkan
      nomor_registrasi: '',
      status_pembayaran: 'lunas',
    });
  }
  return padded;
}

/**
 * Main Generator for Bulk A3 Imposition ZIP
 */
export async function generateBulkBibA3Zip(
  participants: ParticipantForBib[],
  options: BibA3Options = { layout: '8_per_sheet_a3_plus', includeCropMarks: true },
  onProgress?: (progress: BibA3SheetProgress) => void,
  abortSignal?: AbortSignal
): Promise<Blob | null> {
  if (participants.length === 0) {
    throw new Error('Tidak ada data peserta untuk dibuatkan lembar A3.');
  }

  const itemsPerSheet =
    options.layout === '8_per_sheet_a3_plus'
      ? 8
      : options.layout === '2_per_sheet'
      ? 2
      : 4;
  const effectiveParticipants = padBibParticipantsToFullSheets(participants, itemsPerSheet);
  const total = effectiveParticipants.length;
  const totalSheets = Math.ceil(total / itemsPerSheet);

  onProgress?.({
    currentSheet: 0,
    totalSheets,
    percent: 0,
    currentLabel: 'Memuat template BIB & font Sakana...',
    stage: 'loading_assets',
  });

  const [hasSakanaFont, templateImg] = await Promise.all([
    ensureSakanaFontLoaded(),
    ensureTemplateImageLoaded(),
  ]);

  if (abortSignal?.aborted) {
    onProgress?.({ currentSheet: 0, totalSheets, percent: 0, currentLabel: '', stage: 'cancelled' });
    return null;
  }

  // Create reusable card buffer canvases (up to 8 for A3+)
  const cardCanvases: HTMLCanvasElement[] = [];
  const cardContexts: CanvasRenderingContext2D[] = [];
  for (let i = 0; i < itemsPerSheet; i++) {
    const c = document.createElement('canvas');
    c.width = CARD_BUFFER_WIDTH;
    c.height = CARD_BUFFER_HEIGHT;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context tidak didukung.');
    cardCanvases.push(c);
    cardContexts.push(ctx);
  }

  // Create master sheet canvas
  const sheetCanvas = document.createElement('canvas');
  const isA3Plus = options.layout === '8_per_sheet_a3_plus';
  sheetCanvas.width = isA3Plus ? A3_PLUS_WIDTH : A3_WIDTH;
  sheetCanvas.height = isA3Plus ? A3_PLUS_HEIGHT : A3_HEIGHT;
  const sheetCtx = sheetCanvas.getContext('2d');
  if (!sheetCtx) throw new Error('Canvas 2D context master sheet tidak didukung.');

  const zip = new JSZip();
  const folderName = isA3Plus
    ? 'LEMBAR_A3_PLUS_8_BIB_TourDeGunungBatu'
    : 'LEMBAR_A3_BIB_TourDeGunungBatu';
  const folder = zip.folder(folderName) || zip;

  // Process sheets one by one
  for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
    if (abortSignal?.aborted) {
      onProgress?.({ currentSheet: sheetIdx, totalSheets, percent: 0, currentLabel: '', stage: 'cancelled' });
      return null;
    }

    const startIdx = sheetIdx * itemsPerSheet;
    const sheetParticipants = effectiveParticipants.slice(startIdx, startIdx + itemsPerSheet);

    const firstBib = String(sheetParticipants[0].nomor_bib).padStart(4, '0');
    const lastBib = String(sheetParticipants[sheetParticipants.length - 1].nomor_bib).padStart(4, '0');
    const sheetLabel = `Lembar_${String(sheetIdx + 1).padStart(3, '0')}_BIB_${firstBib}-${lastBib}`;

    const percent = Math.round(((sheetIdx + 1) / totalSheets) * 85);
    onProgress?.({
      currentSheet: sheetIdx + 1,
      totalSheets,
      percent,
      currentLabel: `Merender Lembar ${isA3Plus ? 'A3+' : 'A3'} #${sheetIdx + 1} (${firstBib} s/d ${lastBib})`,
      stage: 'rendering_sheets',
    });

    // 1. Render each participant card into buffer
    for (let cIdx = 0; cIdx < sheetParticipants.length; cIdx++) {
      drawBibParticipant(
        cardCanvases[cIdx],
        cardContexts[cIdx],
        templateImg,
        hasSakanaFont,
        sheetParticipants[cIdx]
      );
    }

    // 2. Compose into master sheet
    if (options.layout === '8_per_sheet_a3_plus') {
      renderA3PlusSheet8Up(
        sheetCanvas,
        sheetCtx,
        cardCanvases,
        sheetParticipants,
        sheetIdx,
        totalSheets,
        options
      );
    } else if (options.layout === '2_per_sheet') {
      renderA3Sheet2Up(
        sheetCanvas,
        sheetCtx,
        cardCanvases,
        sheetParticipants,
        sheetIdx,
        totalSheets,
        options
      );
    } else {
      renderA3Sheet4Up(
        sheetCanvas,
        sheetCtx,
        cardCanvases,
        sheetParticipants,
        sheetIdx,
        totalSheets,
        options
      );
    }

    // 3. Convert sheet to Blob (JPEG high quality 0.93)
    const sheetBlob = await new Promise<Blob | null>((resolve) => {
      sheetCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.93);
    });

    if (sheetBlob) {
      folder.file(`${sheetLabel}.jpg`, sheetBlob);
    }

    // Small pause to keep browser UI reactive
    await new Promise((r) => setTimeout(r, 20));
  }

  // 4. Zipping stage
  onProgress?.({
    currentSheet: totalSheets,
    totalSheets,
    percent: 90,
    currentLabel: 'Mengompres file ZIP Lembaran A3...',
    stage: 'zipping',
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.({
        currentSheet: totalSheets,
        totalSheets,
        percent: 90 + Math.round(metadata.percent * 0.1),
        currentLabel: `Mengompres file ZIP (${Math.round(metadata.percent)}%)...`,
        stage: 'zipping',
      });
    }
  );

  onProgress?.({
    currentSheet: totalSheets,
    totalSheets,
    percent: 100,
    currentLabel: 'Selesai!',
    stage: 'done',
  });

  return zipBlob;
}

/**
 * Main Generator for Bulk A3 / A3+ Imposition as a SINGLE MULTI-PAGE PDF
 * Optimal compression (JPEG 0.88) for small file size while keeping crisp 300 DPI vector sharpness.
 */
export async function generateBulkBibA3Pdf(
  participants: ParticipantForBib[],
  options: BibA3Options = { layout: '8_per_sheet_a3_plus', includeCropMarks: true },
  onProgress?: (progress: BibA3SheetProgress) => void,
  abortSignal?: AbortSignal
): Promise<Blob | null> {
  if (participants.length === 0) {
    throw new Error('Tidak ada data peserta untuk dibuatkan PDF A3.');
  }

  const isA3Plus = options.layout === '8_per_sheet_a3_plus';
  const itemsPerSheet = isA3Plus ? 8 : options.layout === '2_per_sheet' ? 2 : 4;
  const effectiveParticipants = padBibParticipantsToFullSheets(participants, itemsPerSheet);
  const total = effectiveParticipants.length;
  const totalSheets = Math.ceil(total / itemsPerSheet);

  onProgress?.({
    currentSheet: 0,
    totalSheets,
    percent: 0,
    currentLabel: 'Memuat template BIB & font Sakana...',
    stage: 'loading_assets',
  });

  const [hasSakanaFont, templateImg] = await Promise.all([
    ensureSakanaFontLoaded(),
    ensureTemplateImageLoaded(),
  ]);

  if (abortSignal?.aborted) {
    onProgress?.({ currentSheet: 0, totalSheets, percent: 0, currentLabel: '', stage: 'cancelled' });
    return null;
  }

  // Create reusable card buffer canvases
  const cardCanvases: HTMLCanvasElement[] = [];
  const cardContexts: CanvasRenderingContext2D[] = [];
  for (let i = 0; i < itemsPerSheet; i++) {
    const c = document.createElement('canvas');
    c.width = CARD_BUFFER_WIDTH;
    c.height = CARD_BUFFER_HEIGHT;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context tidak didukung.');
    cardCanvases.push(c);
    cardContexts.push(ctx);
  }

  // Create master sheet canvas
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = isA3Plus ? A3_PLUS_WIDTH : A3_WIDTH;
  sheetCanvas.height = isA3Plus ? A3_PLUS_HEIGHT : A3_HEIGHT;
  const sheetCtx = sheetCanvas.getContext('2d');
  if (!sheetCtx) throw new Error('Canvas 2D context master sheet tidak didukung.');

  // Dimensions in mm for jsPDF
  // A3+ Portrait: 329 mm W x 483 mm H
  // Standard A3 Landscape: 420 mm W x 297 mm H
  const pdfWidthMm = isA3Plus ? 329 : 420;
  const pdfHeightMm = isA3Plus ? 483 : 297;
  const orientation = isA3Plus ? 'portrait' : 'landscape';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pdfWidthMm, pdfHeightMm],
    compress: true,
  });

  // Render sheets one by one and embed into PDF
  for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
    if (abortSignal?.aborted) {
      onProgress?.({ currentSheet: sheetIdx, totalSheets, percent: 0, currentLabel: '', stage: 'cancelled' });
      return null;
    }

    const startIdx = sheetIdx * itemsPerSheet;
    const sheetParticipants = effectiveParticipants.slice(startIdx, startIdx + itemsPerSheet);

    const firstBib = String(sheetParticipants[0].nomor_bib).padStart(4, '0');
    const lastBib = String(sheetParticipants[sheetParticipants.length - 1].nomor_bib).padStart(4, '0');

    const percent = Math.round(((sheetIdx + 1) / totalSheets) * 92);
    onProgress?.({
      currentSheet: sheetIdx + 1,
      totalSheets,
      percent,
      currentLabel: `Menyusun Halaman PDF #${sheetIdx + 1} (${firstBib} s/d ${lastBib})`,
      stage: 'rendering_sheets',
    });

    // 1. Render cards into buffer
    for (let cIdx = 0; cIdx < sheetParticipants.length; cIdx++) {
      drawBibParticipant(
        cardCanvases[cIdx],
        cardContexts[cIdx],
        templateImg,
        hasSakanaFont,
        sheetParticipants[cIdx]
      );
    }

    // 2. Compose into master sheet
    if (options.layout === '8_per_sheet_a3_plus') {
      renderA3PlusSheet8Up(
        sheetCanvas,
        sheetCtx,
        cardCanvases,
        sheetParticipants,
        sheetIdx,
        totalSheets,
        options
      );
    } else if (options.layout === '2_per_sheet') {
      renderA3Sheet2Up(
        sheetCanvas,
        sheetCtx,
        cardCanvases,
        sheetParticipants,
        sheetIdx,
        totalSheets,
        options
      );
    } else {
      renderA3Sheet4Up(
        sheetCanvas,
        sheetCtx,
        cardCanvases,
        sheetParticipants,
        sheetIdx,
        totalSheets,
        options
      );
    }

    // 3. Convert sheet to high quality compressed JPEG (0.88 quality is razor sharp for print and very lightweight)
    const imgData = sheetCanvas.toDataURL('image/jpeg', 0.88);

    if (sheetIdx > 0) {
      doc.addPage([pdfWidthMm, pdfHeightMm], orientation);
    }
    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');

    await new Promise((r) => setTimeout(r, 20));
  }

  onProgress?.({
    currentSheet: totalSheets,
    totalSheets,
    percent: 96,
    currentLabel: 'Menyelesaikan kompilasi dokumen PDF...',
    stage: 'zipping',
  });

  const pdfBlob = doc.output('blob');

  onProgress?.({
    currentSheet: totalSheets,
    totalSheets,
    percent: 100,
    currentLabel: 'Selesai!',
    stage: 'done',
  });

  return pdfBlob;
}
