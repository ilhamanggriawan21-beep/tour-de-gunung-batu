import JSZip from 'jszip';
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
  layout: '4_per_sheet' | '2_per_sheet';
  includeCropMarks: boolean;
}

// Canvas dimensions for A3 @ 300 DPI Landscape
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
  const startY = Math.round((h - (cardH * 2 + gapY)) / 2) + 20;

  // 1. Draw Sheet Header (Slug Area for print operator)
  sheetCtx.save();
  sheetCtx.fillStyle = '#0F172A';
  sheetCtx.font = 'bold 34px sans-serif';
  sheetCtx.textAlign = 'left';
  sheetCtx.textBaseline = 'top';

  const bibNums = participants.map((p) => `#${String(p.nomor_bib).padStart(4, '0')}`).join(', ');
  sheetCtx.fillText(
    `TOUR DE GUNUNG BATU 2026  |  LEMBAR CETAK A3 (${sheetIndex + 1} / ${totalSheets})  |  NOMOR BIB: ${bibNums}`,
    startX,
    45
  );

  sheetCtx.font = '500 28px sans-serif';
  sheetCtx.fillStyle = '#64748B';
  sheetCtx.textAlign = 'right';
  sheetCtx.fillText(
    'UKURAN A3 (297x420mm) • 300 DPI • 4 KARTU A5 PER LEMBAR • POTONG SESUAI GARIS SIKU',
    w - startX,
    50
  );
  sheetCtx.restore();

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

  // Footer slug note
  sheetCtx.save();
  sheetCtx.fillStyle = '#94A3B8';
  sheetCtx.font = 'bold 24px sans-serif';
  sheetCtx.textAlign = 'center';
  sheetCtx.textBaseline = 'bottom';
  sheetCtx.fillText(
    `SISTEM OTOMATISASI CETAK TOUR DE GUNUNG BATU — FILE SIAP CETAK DIGITAL PRINTING A3 DUPLEX/SIMPLEX`,
    w / 2,
    h - 25
  );
  sheetCtx.restore();
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
  const startY = Math.round((h - (cardH * 2 + gapY)) / 2) + 20;

  sheetCtx.save();
  sheetCtx.fillStyle = '#0F172A';
  sheetCtx.font = 'bold 36px sans-serif';
  sheetCtx.fillText(
    `TOUR DE GUNUNG BATU 2026  |  LEMBAR CETAK A3 JUMBO (${sheetIndex + 1} / ${totalSheets})`,
    startX,
    55
  );
  sheetCtx.restore();

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
 * Main Generator for Bulk A3 Imposition ZIP
 */
export async function generateBulkBibA3Zip(
  participants: ParticipantForBib[],
  options: BibA3Options = { layout: '4_per_sheet', includeCropMarks: true },
  onProgress?: (progress: BibA3SheetProgress) => void,
  abortSignal?: AbortSignal
): Promise<Blob | null> {
  const total = participants.length;
  if (total === 0) {
    throw new Error('Tidak ada data peserta untuk dibuatkan lembar A3.');
  }

  const itemsPerSheet = options.layout === '2_per_sheet' ? 2 : 4;
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

  // Create 4 reusable card buffer canvases
  const cardCanvases: HTMLCanvasElement[] = [];
  const cardContexts: CanvasRenderingContext2D[] = [];
  for (let i = 0; i < 4; i++) {
    const c = document.createElement('canvas');
    c.width = CARD_BUFFER_WIDTH;
    c.height = CARD_BUFFER_HEIGHT;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context tidak didukung.');
    cardCanvases.push(c);
    cardContexts.push(ctx);
  }

  // Create single A3 master sheet canvas
  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = A3_WIDTH;
  sheetCanvas.height = A3_HEIGHT;
  const sheetCtx = sheetCanvas.getContext('2d');
  if (!sheetCtx) throw new Error('Canvas 2D context A3 tidak didukung.');

  const zip = new JSZip();
  const folder = zip.folder('LEMBAR_A3_BIB_TourDeGunungBatu') || zip;

  // Process sheets one by one
  for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
    if (abortSignal?.aborted) {
      onProgress?.({ currentSheet: sheetIdx, totalSheets, percent: 0, currentLabel: '', stage: 'cancelled' });
      return null;
    }

    const startIdx = sheetIdx * itemsPerSheet;
    const sheetParticipants = participants.slice(startIdx, startIdx + itemsPerSheet);

    const firstBib = String(sheetParticipants[0].nomor_bib).padStart(4, '0');
    const lastBib = String(sheetParticipants[sheetParticipants.length - 1].nomor_bib).padStart(4, '0');
    const sheetLabel = `Lembar_${String(sheetIdx + 1).padStart(3, '0')}_BIB_${firstBib}-${lastBib}`;

    const percent = Math.round(((sheetIdx + 1) / totalSheets) * 85);
    onProgress?.({
      currentSheet: sheetIdx + 1,
      totalSheets,
      percent,
      currentLabel: `Merender Lembar A3 #${sheetIdx + 1} (${firstBib} s/d ${lastBib})`,
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

    // 2. Compose into master A3 sheet
    if (options.layout === '2_per_sheet') {
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
