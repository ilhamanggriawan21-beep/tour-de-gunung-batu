import JSZip from 'jszip';
import { ensureSakanaFontLoaded } from './bulkBibZip';

export interface PanitiaMember {
  id: string;
  nama: string;
  divisi: string;
  nomor_panitia?: string;
  kontak?: string;
  golongan_darah?: string;
}

export interface NametagDivisionConfig {
  label?: string;
  bg: string;
  color: string;
  borderColor: string;
}

export const DIVISION_PRESETS: Record<string, NametagDivisionConfig> = {
  'KETUA PELAKSANA': { bg: '#F4C716', color: '#0A1338', borderColor: '#FDE047' },
  'CO-LEAD / WAKIL': { bg: '#F4C716', color: '#0A1338', borderColor: '#FDE047' },
  'MARSHALL': { bg: '#06B6D4', color: '#0A1338', borderColor: '#67E8F9' },
  'ROAD CAPTAIN': { bg: '#06B6D4', color: '#0A1338', borderColor: '#67E8F9' },
  'TIM MEDIS': { bg: '#EF4444', color: '#FFFFFF', borderColor: '#FCA5A5' },
  'SWEEPER': { bg: '#F59E0B', color: '#0A1338', borderColor: '#FCD34D' },
  'SAG WAGON': { bg: '#F59E0B', color: '#0A1338', borderColor: '#FCD34D' },
  'REGISTRASI & BIB': { bg: '#10B981', color: '#FFFFFF', borderColor: '#6EE7B7' },
  'LOGISTIK': { bg: '#2563EB', color: '#FFFFFF', borderColor: '#93C5FD' },
  'DOKUMENTASI': { bg: '#8B5CF6', color: '#FFFFFF', borderColor: '#C4B5FD' },
  'KONSUMSI': { bg: '#0D9488', color: '#FFFFFF', borderColor: '#5EEAD4' },
  'KEAMANAN': { bg: '#334155', color: '#FFFFFF', borderColor: '#94A3B8' },
  'PANITIA UMUM': { bg: '#1D3AAE', color: '#FFFFFF', borderColor: '#60A5FA' },
};

export function getDivisionConfig(divisi: string): NametagDivisionConfig {
  const upper = divisi.trim().toUpperCase();
  for (const [key, config] of Object.entries(DIVISION_PRESETS)) {
    if (upper.includes(key) || key.includes(upper)) {
      return config;
    }
  }
  return DIVISION_PRESETS['PANITIA UMUM'];
}

// Single ID card dimensions @ 300 DPI (~85 x 125 mm)
export const NAMETAG_WIDTH = 1000;
export const NAMETAG_HEIGHT = 1480;

let cachedEventLogo: HTMLImageElement | null = null;

async function ensureEventLogoLoaded(): Promise<HTMLImageElement | null> {
  if (cachedEventLogo && cachedEventLogo.complete && cachedEventLogo.naturalWidth > 0) {
    return cachedEventLogo;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/images/logo_event.png';
    img.onload = () => {
      cachedEventLogo = img;
      resolve(img);
    };
    img.onerror = () => {
      // Fallback
      resolve(null);
    };
  });
}

/**
 * Render a single Nametag onto a 1000 x 1480 canvas
 */
export function drawSingleNametag(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  member: PanitiaMember,
  eventLogo: HTMLImageElement | null,
  hasSakanaFont: boolean
) {
  const w = canvas.width;
  const h = canvas.height;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // 1. Background Gradient (Deep Navy)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0E1742');
  bgGrad.addColorStop(0.5, '#0A1032');
  bgGrad.addColorStop(1, '#05091D');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Background subtle accent lines (Cyber-athletic elevation contour curves)
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 199, 22, 0.07)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, h * 0.35 + i * 90);
    ctx.bezierCurveTo(w * 0.3, h * 0.3 + i * 80, w * 0.7, h * 0.42 + i * 90, w, h * 0.36 + i * 85);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Outer Border (Dual Gold & Sky)
  ctx.save();
  ctx.strokeStyle = '#F4C716';
  ctx.lineWidth = 10;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, w - 64, h - 64);
  ctx.restore();

  // 3. Top Punch Slot Marker (Guide for Lanyard Clip / Hole Punch)
  ctx.save();
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = 'rgba(244, 199, 22, 0.6)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  const punchW = 120;
  const punchH = 32;
  const punchX = (w - punchW) / 2;
  const punchY = 48;
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(punchX, punchY, punchW, punchH, 16);
  } else {
    ctx.rect(punchX, punchY, punchW, punchH);
  }
  ctx.stroke();
  ctx.restore();

  // 4. Header: Event Title & Branding
  ctx.save();
  ctx.textAlign = 'center';

  // Event logo or fallback text
  if (eventLogo && eventLogo.complete && eventLogo.naturalWidth > 0) {
    const logoW = 190;
    const logoH = 105;
    ctx.drawImage(eventLogo, (w - logoW) / 2, 100, logoW, logoH);
  }

  // Event Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 40px sans-serif';
  ctx.fillText('TOUR DE GUNUNG BATU', w / 2, 240);

  ctx.fillStyle = '#F4C716';
  ctx.font = '900 24px sans-serif';
  ctx.letterSpacing = '6px';
  ctx.fillText('• 2 0 2 6 •', w / 2, 276);

  // Sub-header Banner: OFFICIAL COMMITTEE
  ctx.fillStyle = '#1D3AAE';
  const badgeH = 50;
  const badgeW = 440;
  const badgeY = 308;
  const badgeX = (w - badgeW) / 2;
  if (typeof (ctx as any).roundRect === 'function') {
    ctx.beginPath();
    (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, 25);
    ctx.fill();
    ctx.strokeStyle = '#F4C716';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 22px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('OFFICIAL COMMITTEE / PANITIA', w / 2, badgeY + badgeH / 2);
  ctx.restore();

  // 5. Central Division / Role Badge (Large & Eye-Catching)
  const divConfig = getDivisionConfig(member.divisi);
  ctx.save();
  const roleBoxW = w * 0.88;
  const roleBoxH = 170;
  const roleBoxX = (w - roleBoxW) / 2;
  const roleBoxY = 410;

  // Box shadow / glow
  ctx.shadowColor = divConfig.bg;
  ctx.shadowBlur = 30;
  ctx.fillStyle = divConfig.bg;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(roleBoxX, roleBoxY, roleBoxW, roleBoxH, 28);
  } else {
    ctx.fillRect(roleBoxX, roleBoxY, roleBoxW, roleBoxH);
  }
  ctx.fill();

  ctx.shadowBlur = 0; // reset
  ctx.strokeStyle = divConfig.borderColor;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Division Label
  ctx.fillStyle = divConfig.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Auto-scale division font if long
  let divFontSize = 64;
  ctx.font = `900 ${divFontSize}px sans-serif`;
  const divText = member.divisi.toUpperCase();
  const maxDivTextW = roleBoxW * 0.88;
  let divTextW = ctx.measureText(divText).width;
  if (divTextW > maxDivTextW) {
    divFontSize = Math.floor(divFontSize * (maxDivTextW / divTextW));
    ctx.font = `900 ${divFontSize}px sans-serif`;
  }
  ctx.fillText(divText, w / 2, roleBoxY + roleBoxH / 2);
  ctx.restore();

  // 6. Committee ID / Crew Number (e.g. CREW #01)
  ctx.save();
  const crewCode = member.nomor_panitia || 'CREW';
  ctx.fillStyle = 'rgba(244, 199, 22, 0.9)';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(crewCode.toUpperCase(), w / 2, 640);
  ctx.restore();

  // 7. Committee Member Name (Prominent, Bold)
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cleanName = member.nama.trim().toUpperCase();
  let nameFontSize = 76;
  ctx.font = `900 ${nameFontSize}px sans-serif`;
  const maxNameW = w * 0.86;
  let measuredNameW = ctx.measureText(cleanName).width;
  if (measuredNameW > maxNameW) {
    nameFontSize = Math.floor(nameFontSize * (maxNameW / measuredNameW));
    ctx.font = `900 ${nameFontSize}px sans-serif`;
  }

  // Name glow
  ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
  ctx.shadowBlur = 15;
  ctx.fillText(cleanName, w / 2, 730);
  ctx.shadowBlur = 0;

  // Name separator bar
  ctx.fillStyle = '#F4C716';
  ctx.fillRect((w - 240) / 2, 790, 240, 6);
  ctx.restore();

  // 8. Details Box: Contact & Emergency
  ctx.save();
  const infoBoxW = w * 0.86;
  const infoBoxH = 260;
  const infoBoxX = (w - infoBoxW) / 2;
  const infoBoxY = 840;

  ctx.fillStyle = 'rgba(14, 23, 66, 0.8)';
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(infoBoxX, infoBoxY, infoBoxW, infoBoxH, 20);
  } else {
    ctx.fillRect(infoBoxX, infoBoxY, infoBoxW, infoBoxH);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(244, 199, 22, 0.4)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Info details inside box
  ctx.textAlign = 'left';
  const labelX = infoBoxX + 40;
  const valX = infoBoxX + infoBoxW - 40;

  // Row 1: WhatsApp Contact
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('KONTAK WA / HP', labelX, infoBoxY + 65);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 28px monospace';
  ctx.fillText(member.kontak || '-', valX, infoBoxY + 65);

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(labelX, infoBoxY + 105);
  ctx.lineTo(valX, infoBoxY + 105);
  ctx.stroke();

  // Row 2: Golongan Darah
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('GOLONGAN DARAH', labelX, infoBoxY + 155);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#EF4444';
  ctx.font = '900 32px sans-serif';
  ctx.fillText(member.golongan_darah || 'O / -', valX, infoBoxY + 155);

  // Divider
  ctx.beginPath();
  ctx.moveTo(labelX, infoBoxY + 195);
  ctx.lineTo(valX, infoBoxY + 195);
  ctx.stroke();

  // Row 3: Tanggung Jawab
  ctx.textAlign = 'left';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.fillText('STATUS TUGAS', labelX, infoBoxY + 235);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#F4C716';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('FULL ACCESS • RUTE & VENUE', valX, infoBoxY + 235);
  ctx.restore();

  // 9. Footer: Event Slogan & Date
  ctx.save();
  ctx.fillStyle = '#F4C716';
  ctx.font = '900 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PEADERAL x RUDEBOYS CYCLIST', w / 2, 1165);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('JONGGOL ➔ GUNUNG BATU • ELEVATION GAIN ±700M', w / 2, 1205);

  ctx.fillStyle = 'rgba(244, 199, 22, 0.5)';
  ctx.font = '500 18px monospace';
  ctx.fillText('JIKA MENEMUKAN KARTU INI HUBUNGI PANITIA RESMI', w / 2, 1245);
  ctx.restore();

  // 10. Punch Cut Guide line at edge for standard plastic card holder
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 4, w - 8, h - 8);
  ctx.restore();
}

/**
 * Draw Crop Marks around an ID card in an imposition sheet
 */
function drawNametagCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  markLen = 35,
  gap = 10
) {
  ctx.save();
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'square';

  // TL
  ctx.beginPath();
  ctx.moveTo(x - gap, y);
  ctx.lineTo(x - gap - markLen, y);
  ctx.moveTo(x, y - gap);
  ctx.lineTo(x, y - gap - markLen);
  ctx.stroke();

  // TR
  ctx.beginPath();
  ctx.moveTo(x + w + gap, y);
  ctx.lineTo(x + w + gap + markLen, y);
  ctx.moveTo(x + w, y - gap);
  ctx.lineTo(x + w, y - gap - markLen);
  ctx.stroke();

  // BL
  ctx.beginPath();
  ctx.moveTo(x - gap, y + h);
  ctx.lineTo(x - gap - markLen, y + h);
  ctx.moveTo(x, y + h + gap);
  ctx.lineTo(x, y + h + gap + markLen);
  ctx.stroke();

  // BR
  ctx.beginPath();
  ctx.moveTo(x + w + gap, y + h);
  ctx.lineTo(x + w + gap + markLen, y + h);
  ctx.moveTo(x + w, y + h + gap);
  ctx.lineTo(x + w, y + h + gap + markLen);
  ctx.stroke();

  ctx.restore();
}

/**
 * Render an A4 Sheet containing up to 4 Nametags (2x2)
 * A4 dimensions @ 300 DPI Portrait: 2480 x 3508 px
 */
export function renderNametagA4Sheet(
  sheetCanvas: HTMLCanvasElement,
  sheetCtx: CanvasRenderingContext2D,
  cardCanvases: HTMLCanvasElement[],
  members: PanitiaMember[],
  sheetIdx: number,
  totalSheets: number
) {
  const w = 2480;
  const h = 3508;
  sheetCanvas.width = w;
  sheetCanvas.height = h;

  sheetCtx.fillStyle = '#FFFFFF';
  sheetCtx.fillRect(0, 0, w, h);

  // Card size on sheet: e.g. 1040 x 1540 px
  const cardW = 1050;
  const cardH = 1554;
  const gapX = 120;
  const gapY = 120;
  const startX = Math.round((w - (cardW * 2 + gapX)) / 2);
  const startY = Math.round((h - (cardH * 2 + gapY)) / 2) + 20;

  // Header slug
  sheetCtx.save();
  sheetCtx.fillStyle = '#0F172A';
  sheetCtx.font = 'bold 28px sans-serif';
  sheetCtx.fillText(
    `TOUR DE GUNUNG BATU 2026 — LEMBAR CETAK NAMETAG PANITIA (A4: LEMBAR ${sheetIdx + 1} DARI ${totalSheets})`,
    startX,
    45
  );
  sheetCtx.fillStyle = '#64748B';
  sheetCtx.font = '500 20px sans-serif';
  sheetCtx.textAlign = 'right';
  sheetCtx.fillText('FORMAT A4 • 300 DPI • POTONG MENGIKUTI GARIS SIKU POTONG', w - startX, 45);
  sheetCtx.restore();

  const positions = [
    { x: startX, y: startY },
    { x: startX + cardW + gapX, y: startY },
    { x: startX, y: startY + cardH + gapY },
    { x: startX + cardW + gapX, y: startY + cardH + gapY },
  ];

  for (let i = 0; i < members.length && i < 4; i++) {
    const pos = positions[i];
    sheetCtx.drawImage(cardCanvases[i], 0, 0, NAMETAG_WIDTH, NAMETAG_HEIGHT, pos.x, pos.y, cardW, cardH);
    drawNametagCropMarks(sheetCtx, pos.x, pos.y, cardW, cardH, 40, 10);
  }

  // Footer
  sheetCtx.save();
  sheetCtx.fillStyle = '#94A3B8';
  sheetCtx.font = 'bold 18px sans-serif';
  sheetCtx.textAlign = 'center';
  sheetCtx.fillText(
    'KARTU RESMI PANITIA TOUR DE GUNUNG BATU 2026 — UKURAN STANDAR ID CARD HOLDER B3/B4',
    w / 2,
    h - 25
  );
  sheetCtx.restore();
}

/**
 * Render an A3 Sheet containing up to 8 Nametags (4x2)
 * A3 dimensions @ 300 DPI Landscape: 4960 x 3508 px
 */
export function renderNametagA3Sheet(
  sheetCanvas: HTMLCanvasElement,
  sheetCtx: CanvasRenderingContext2D,
  cardCanvases: HTMLCanvasElement[],
  members: PanitiaMember[],
  sheetIdx: number,
  totalSheets: number
) {
  const w = 4960;
  const h = 3508;
  sheetCanvas.width = w;
  sheetCanvas.height = h;

  sheetCtx.fillStyle = '#FFFFFF';
  sheetCtx.fillRect(0, 0, w, h);

  // 4 columns x 2 rows = 8 cards
  const cardW = 1050;
  const cardH = 1554;
  const gapX = 90;
  const gapY = 100;
  const startX = Math.round((w - (cardW * 4 + gapX * 3)) / 2);
  const startY = Math.round((h - (cardH * 2 + gapY)) / 2) + 20;

  // Header slug
  sheetCtx.save();
  sheetCtx.fillStyle = '#0F172A';
  sheetCtx.font = 'bold 32px sans-serif';
  sheetCtx.fillText(
    `TOUR DE GUNUNG BATU 2026 — LEMBAR CETAK A3 NAMETAG PANITIA (LEMBAR ${sheetIdx + 1} DARI ${totalSheets})`,
    startX,
    50
  );
  sheetCtx.fillStyle = '#64748B';
  sheetCtx.font = '500 24px sans-serif';
  sheetCtx.textAlign = 'right';
  sheetCtx.fillText('FORMAT A3 • 300 DPI • 8 PCS PER LEMBAR • DILENGKAPI GARIS SIKU POTONG', w - startX, 50);
  sheetCtx.restore();

  for (let i = 0; i < members.length && i < 8; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const posX = startX + col * (cardW + gapX);
    const posY = startY + row * (cardH + gapY);

    sheetCtx.drawImage(cardCanvases[i], 0, 0, NAMETAG_WIDTH, NAMETAG_HEIGHT, posX, posY, cardW, cardH);
    drawNametagCropMarks(sheetCtx, posX, posY, cardW, cardH, 35, 10);
  }

  // Footer
  sheetCtx.save();
  sheetCtx.fillStyle = '#94A3B8';
  sheetCtx.font = 'bold 22px sans-serif';
  sheetCtx.textAlign = 'center';
  sheetCtx.fillText(
    'KARTU RESMI PANITIA TOUR DE GUNUNG BATU 2026 — SIAP CETAK DIGITAL PRINTING A3',
    w / 2,
    h - 30
  );
  sheetCtx.restore();
}

/**
 * Bulk Generate Nametags as ZIP of Sheets (A4 or A3) or Individual Cards
 */
export async function generateBulkNametagZip(
  members: PanitiaMember[],
  mode: 'sheet_a4' | 'sheet_a3' | 'individual',
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  const total = members.length;
  if (total === 0) throw new Error('Tidak ada data panitia.');

  onProgress?.(5, 'Memuat aset logo & font...');
  const [hasSakana, eventLogo] = await Promise.all([
    ensureSakanaFontLoaded(),
    ensureEventLogoLoaded(),
  ]);

  const zip = new JSZip();

  if (mode === 'individual') {
    const folder = zip.folder('ID_Card_Panitia_Satuan') || zip;
    const canvas = document.createElement('canvas');
    canvas.width = NAMETAG_WIDTH;
    canvas.height = NAMETAG_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D tidak didukung.');

    for (let i = 0; i < total; i++) {
      const m = members[i];
      const percent = Math.round(10 + (i / total) * 80);
      onProgress?.(percent, `Merender Kartu ${i + 1}/${total}: ${m.nama}`);

      drawSingleNametag(canvas, ctx, m, eventLogo, hasSakana);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (blob) {
        const cleanDiv = m.divisi.replace(/[^a-zA-Z0-9]/g, '_');
        const cleanNm = m.nama.replace(/[^a-zA-Z0-9]/g, '_');
        folder.file(`Nametag_${cleanDiv}_${cleanNm}.png`, blob);
      }
    }
  } else {
    // Sheet mode (A4 = 4 per sheet, A3 = 8 per sheet)
    const perSheet = mode === 'sheet_a3' ? 8 : 4;
    const totalSheets = Math.ceil(total / perSheet);
    const folder = zip.folder(mode === 'sheet_a3' ? 'Lembar_A3_Nametag_Panitia' : 'Lembar_A4_Nametag_Panitia') || zip;

    // Create reusable card canvases
    const cardCanvases: HTMLCanvasElement[] = [];
    const cardContexts: CanvasRenderingContext2D[] = [];
    for (let i = 0; i < perSheet; i++) {
      const c = document.createElement('canvas');
      c.width = NAMETAG_WIDTH;
      c.height = NAMETAG_HEIGHT;
      const ctx = c.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D tidak didukung.');
      cardCanvases.push(c);
      cardContexts.push(ctx);
    }

    const sheetCanvas = document.createElement('canvas');
    const sheetCtx = sheetCanvas.getContext('2d');
    if (!sheetCtx) throw new Error('Canvas context sheet tidak didukung.');

    for (let sIdx = 0; sIdx < totalSheets; sIdx++) {
      const p = Math.round(10 + (sIdx / totalSheets) * 80);
      onProgress?.(p, `Merender Lembar #${sIdx + 1} dari ${totalSheets}...`);

      const slice = members.slice(sIdx * perSheet, (sIdx + 1) * perSheet);

      // Render cards into buffer
      for (let c = 0; c < slice.length; c++) {
        drawSingleNametag(cardCanvases[c], cardContexts[c], slice[c], eventLogo, hasSakana);
      }

      if (mode === 'sheet_a3') {
        renderNametagA3Sheet(sheetCanvas, sheetCtx, cardCanvases, slice, sIdx, totalSheets);
      } else {
        renderNametagA4Sheet(sheetCanvas, sheetCtx, cardCanvases, slice, sIdx, totalSheets);
      }

      const sheetBlob = await new Promise<Blob | null>((res) =>
        sheetCanvas.toBlob(res, 'image/jpeg', 0.94)
      );
      if (sheetBlob) {
        folder.file(`Lembar_${String(sIdx + 1).padStart(2, '0')}.jpg`, sheetBlob);
      }
    }
  }

  onProgress?.(92, 'Mengompres file ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (meta) => {
    onProgress?.(92 + Math.round(meta.percent * 0.08), `Mengompres file ZIP (${Math.round(meta.percent)}%)...`);
  });

  onProgress?.(100, 'Selesai!');
  return zipBlob;
}
