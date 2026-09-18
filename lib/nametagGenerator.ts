import JSZip from 'jszip';
import jsPDF from 'jspdf';
import { ensureSakanaFontLoaded } from './bulkBibZip';

export interface PanitiaMember {
  id: string;
  nama: string;
  divisi: string;
  nomor_panitia?: string;
  kontak?: string;
  golongan_darah?: string;
  tugas?: string[];
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

export const DEFAULT_DIVISION_TASKS: Record<string, string[]> = {
  'KETUA PELAKSANA': [
    'Memimpin komando & koordinasi seluruh divisi panitia.',
    'Pengambil keputusan utama operasional rute & venue.',
    'Pusat komunikasi dengan kepolisian, Dishub, dan aparatur desa.',
    'Memastikan seluruh rundown acara berjalan tertib & aman.',
    'Evaluasi & mitigasi risiko keselamatan selama event berlangsung.',
  ],
  'CO-LEAD / WAKIL': [
    'Mendampingi Ketua Pelaksana dalam pengawasan lapangan.',
    'Supervisi operasional divisi marshall, sweeper, dan logistik.',
    'Penanggung jawab alur penanganan kendala tak terduga di jalur.',
    'Monitoring alur check-in peserta dan kesiapan venue finish.',
  ],
  'MARSHALL': [
    'Memandu rombongan pesepeda sesuai rute resmi Tour de Gunung Batu.',
    'Mengatur ritme kecepatan dan kerapian barisan peloton.',
    'Siaga di persimpangan rawan & turunan curam pegunungan.',
    'Komunikasi aktif via Radio/WA dengan Sweeper dan Tim Medis.',
    'Menjaga keselamatan peserta dari arus kendaraan umum.',
  ],
  'ROAD CAPTAIN': [
    'Memimpin rombongan depan (pace maker) dengan aman.',
    'Menentukan titik regruping dan istirahat sementara.',
    'Memperingatkan peserta terkait kondisi jalan berlubang/tajam.',
    'Berkoordinasi dengan tim voorijder dan keamanan rute.',
  ],
  'TIM MEDIS': [
    'Siaga pertolongan pertama (P3K) di ambulans dan posko kesehatan.',
    'Penanganan cepat kram, dehidrasi, luka jatuh, & kelelahan.',
    'Koordinasi darurat dengan RS rujukan terdekat jalur Jonggol.',
    'Monitoring kondisi fisik peserta di segmen tanjakan terjal.',
  ],
  'SWEEPER': [
    'Menyapu posisi paling belakang rombongan (No rider left behind).',
    'Mendampingi dan memotivasi peserta yang tertinggal di tanjakan.',
    'Evakuasi peserta & sepeda ke mobil SAG jika DNF / cut-off.',
    'Memastikan rute bersih dari peserta sebelum evakuasi akhir.',
  ],
  'SAG WAGON': [
    'Mengemudikan mobil pick-up / evakuasi di belakang sweeper.',
    'Memuat sepeda dan peserta yang mengalami kendala teknis/fisik.',
    'Menyediakan pompa cadangan, ban dalam, dan toolkit sepeda.',
    'Mengantar peserta evakuasi ke venue finish Gunung Batu.',
  ],
  'REGISTRASI & BIB': [
    'Melayani check-in kehadiran peserta di meja registrasi.',
    'Verifikasi identitas dan pembagian nomor BIB + Goodie Bag.',
    'Pencatatan ukuran jersey dan distribusi pesanan PO.',
    'Menangani peserta susulan dan rekap kehadiran final.',
  ],
  'LOGISTIK': [
    'Mengelola persediaan air mineral, isotonic, & buah di WS.',
    'Distribusi perlengkapan tenda, sound system, & banner.',
    'Pengelolaan drop bag peserta dari start hingga finish.',
    'Loading dan inventarisasi peralatan sebelum & sesudah event.',
  ],
  'DOKUMENTASI': [
    'Mengambil foto & video aksi peserta di spot terbaik rute.',
    'Operasional drone di tanjakan ikonik Gunung Batu.',
    'Live update konten reels/story Instagram resmi event.',
    'Penyortiran dan pengarsipan hasil dokumentasi peserta.',
  ],
  'KONSUMSI': [
    'Menyiapkan snack pagi dan makan siang untuk peserta & panitia.',
    'Memastikan pasokan logistik buah di tiap Water Station.',
    'Distribusi konsumsi tepat waktu sesuai jadwal rundown.',
    'Menjaga kebersihan area makan dan kantong sampah venue.',
  ],
  'KEAMANAN': [
    'Mensterilkan titik start, finish, dan persimpangan padat.',
    'Mengatur area parkir kendaraan peserta dan panitia.',
    'Koordinasi dengan warga lokal dan aparat keamanan setempat.',
    'Mengamankan sepeda dan barang bawaan peserta di venue.',
  ],
  'PANITIA UMUM': [
    'Membantu kelancaran operasional di seluruh area event.',
    'Siaga menerima instruksi fleksibel dari Koordinator.',
    'Membantu mobilisasi peserta di area start dan finish.',
    'Menjaga ketertiban, kebersihan, dan keselamatan bersama.',
  ],
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

export function getDivisionTasks(divisi: string): string[] {
  const upper = divisi.trim().toUpperCase();
  for (const [key, tasks] of Object.entries(DEFAULT_DIVISION_TASKS)) {
    if (upper.includes(key) || key.includes(upper)) {
      return tasks;
    }
  }
  return DEFAULT_DIVISION_TASKS['PANITIA UMUM'];
}

// B4 Paper size @ 300 DPI: 9.6 cm x 13.3 cm
// 96 mm / 25.4 * 300 = 1133.85 -> 1134 px
// 133 mm / 25.4 * 300 = 1570.86 -> 1572 px
export const NAMETAG_WIDTH = 1134;
export const NAMETAG_HEIGHT = 1572;

// A3+ Paper dimensions @ 300 DPI: 329 x 483 mm
const A3_PLUS_WIDTH = 3886;
const A3_PLUS_HEIGHT = 5705;

let cachedNametagTemplate: HTMLImageElement | null = null;

export async function ensureNametagTemplateLoaded(): Promise<HTMLImageElement | null> {
  if (cachedNametagTemplate && cachedNametagTemplate.complete && cachedNametagTemplate.naturalWidth > 0) {
    return cachedNametagTemplate;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/NAMETAG.jpg?v=2';
    img.onload = () => {
      cachedNametagTemplate = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Draw Tampak Depan (Front) of Panitia Nametag (1134 x 1572 px @ 300 DPI)
 */
export function drawNametagFront(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  member: PanitiaMember,
  templateImg: HTMLImageElement | null,
  hasSakanaFont: boolean
) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 1. Draw Template Image Left Half (0, 0, 1134, 1572)
  if (templateImg && templateImg.complete && templateImg.naturalWidth > 0) {
    ctx.drawImage(templateImg, 0, 0, 1134, 1572, 0, 0, w, h);
  } else {
    // Fallback gradient if image not found
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0F2060');
    grad.addColorStop(1, '#080D28');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Member Name (Centered inside white bar area below "PANITIA", y: 800 - 950)
  ctx.save();
  const cleanName = member.nama.trim().toUpperCase();
  let nameFontSize = 62;
  ctx.font = `900 ${nameFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const maxNameW = w * 0.84; // ~950 px
  let measuredW = ctx.measureText(cleanName).width;
  if (measuredW > maxNameW) {
    nameFontSize = Math.floor(nameFontSize * (maxNameW / measuredW));
    ctx.font = `900 ${nameFontSize}px sans-serif`;
  }

  // Name drop shadow
  ctx.shadowColor = 'rgba(10, 19, 56, 0.25)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#0A1338'; // Deep Royal Navy
  ctx.fillText(cleanName, w / 2, 895);
  ctx.restore();

  // 3. Division Pill Badge (y: 955 to 1035)
  const divConfig = getDivisionConfig(member.divisi);
  ctx.save();
  const divText = member.divisi.trim().toUpperCase();

  let divFontSize = 38;
  ctx.font = `900 ${divFontSize}px sans-serif`;
  const divTextW = ctx.measureText(divText).width;
  const pillW = Math.min(w * 0.82, Math.max(380, divTextW + 80));
  const pillH = 74;
  const pillX = (w - pillW) / 2;
  const pillY = 960;

  // Badge background & shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = divConfig.bg;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(pillX, pillY, pillW, pillH, 22);
  } else {
    ctx.fillRect(pillX, pillY, pillW, pillH);
  }
  ctx.fill();

  // Badge border
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#0A1338';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Division text
  ctx.fillStyle = divConfig.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(divText, w / 2, pillY + pillH / 2);
  ctx.restore();

  // 4. Sub-details footer (Kode Kru, No WhatsApp, Gol Darah)
  ctx.save();
  const subText = `${member.nomor_panitia || 'CREW'}  •  WA: ${member.kontak || '-'}  •  GOL: ${member.golongan_darah || 'O'}`;
  ctx.fillStyle = '#1D3AAE';
  ctx.font = 'bold 25px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(subText, w / 2, 1085);
  ctx.restore();
}

/**
 * Draw Tampak Belakang (Back - Tugas) of Panitia Nametag (1134 x 1572 px @ 300 DPI)
 */
export function drawNametagBack(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  member: PanitiaMember,
  templateImg: HTMLImageElement | null,
  hasSakanaFont: boolean
) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 1. Draw Template Image Right Half (1134, 0, 1134, 1572)
  if (templateImg && templateImg.complete && templateImg.naturalWidth > 0) {
    ctx.drawImage(templateImg, 1134, 0, 1134, 1572, 0, 0, w, h);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0F2060');
    grad.addColorStop(1, '#080D28');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  const divConfig = getDivisionConfig(member.divisi);
  const tasks = member.tugas && member.tugas.length > 0 ? member.tugas : getDivisionTasks(member.divisi);

  // 2. Sub-header below "TUGAS :"
  ctx.save();
  ctx.fillStyle = '#0A1338';
  ctx.font = '900 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`DIVISI: ${member.divisi.toUpperCase()}`, w / 2, 515);

  // Accent divider line
  ctx.fillStyle = divConfig.bg;
  ctx.fillRect((w - 280) / 2, 560, 280, 5);
  ctx.restore();

  // 3. List of Duties (Bullets)
  let currentY = 600;
  const bulletX = 145;
  const textX = 185;
  const maxTextW = 820;

  for (let i = 0; i < tasks.length && i < 5; i++) {
    const task = tasks[i];

    ctx.save();
    // Numbered circular bullet badge
    ctx.fillStyle = '#1D3AAE';
    ctx.beginPath();
    ctx.arc(bulletX, currentY + 16, 17, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), bulletX, currentY + 16);

    // Duty text (with multi-line wrap support)
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 27px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const lines = wrapText(ctx, task, maxTextW);
    for (let l = 0; l < lines.length; l++) {
      ctx.fillText(lines[l], textX, currentY + l * 38);
    }
    ctx.restore();

    currentY += Math.max(lines.length * 38 + 22, 64);
  }

  // 4. Bottom Info Card Footer
  ctx.save();
  const boxW = 880;
  const boxH = 90;
  const boxX = (w - boxW) / 2;
  const boxY = 1350;

  ctx.fillStyle = 'rgba(29, 58, 174, 0.08)';
  ctx.strokeStyle = 'rgba(29, 58, 174, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(boxX, boxY, boxW, boxH, 16);
  } else {
    ctx.fillRect(boxX, boxY, boxW, boxH);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0A1338';
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RADIO MARSHALL CH-01  •  DARURAT: 0877-4587-0767', w / 2, boxY + 34);

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('TOUR DE GUNUNG BATU 2026  •  OFFICIAL COMMITTEE', w / 2, boxY + 64);
  ctx.restore();
}

/**
 * Universal Draw Function (Tampak Depan or Belakang)
 */
export function drawSingleNametag(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  member: PanitiaMember,
  templateImg: HTMLImageElement | null,
  hasSakanaFont: boolean,
  side: 'front' | 'back' = 'front'
) {
  canvas.width = NAMETAG_WIDTH;
  canvas.height = NAMETAG_HEIGHT;
  if (side === 'back') {
    drawNametagBack(canvas, ctx, member, templateImg, hasSakanaFont);
  } else {
    drawNametagFront(canvas, ctx, member, templateImg, hasSakanaFont);
  }
}

/**
 * Draw Crop Marks around an ID card in an imposition sheet
 */
function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  markLen = 40,
  markGap = 12
) {
  ctx.save();
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'square';

  // TL
  ctx.beginPath();
  ctx.moveTo(x - markGap, y);
  ctx.lineTo(x - markGap - markLen, y);
  ctx.moveTo(x, y - markGap);
  ctx.lineTo(x, y - markGap - markLen);
  ctx.stroke();

  // TR
  ctx.beginPath();
  ctx.moveTo(x + w + markGap, y);
  ctx.lineTo(x + w + markGap + markLen, y);
  ctx.moveTo(x + w, y - markGap);
  ctx.lineTo(x + w, y - markGap - markLen);
  ctx.stroke();

  // BL
  ctx.beginPath();
  ctx.moveTo(x - markGap, y + h);
  ctx.lineTo(x - markGap - markLen, y + h);
  ctx.moveTo(x, y + h + markGap);
  ctx.lineTo(x, y + h + markGap + markLen);
  ctx.stroke();

  // BR
  ctx.beginPath();
  ctx.moveTo(x + w + markGap, y + h);
  ctx.lineTo(x + w + markGap + markLen, y + h);
  ctx.moveTo(x + w, y + h + markGap);
  ctx.lineTo(x + w, y + h + markGap + markLen);
  ctx.stroke();

  ctx.restore();
}

function drawCuttingGuide(
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
 * Render an A3+ Sheet (329 x 483 mm) containing up to 9 ID cards (3 columns x 3 rows)
 * Max printable area: 310 x 470 mm
 * Card size: 1134 x 1572 px (9.6 x 13.3 cm B4)
 * @param mirrorCols Set true for Back side in duplex printing so Column 1 matches Column 3 when flipped
 */
export function renderNametagA3PlusSheet(
  sheetCanvas: HTMLCanvasElement,
  sheetCtx: CanvasRenderingContext2D,
  cardCanvases: HTMLCanvasElement[],
  members: PanitiaMember[],
  side: 'front' | 'back',
  sheetIdx: number,
  totalSheets: number,
  mirrorCols = false
) {
  const w = A3_PLUS_WIDTH;
  const h = A3_PLUS_HEIGHT;
  sheetCanvas.width = w;
  sheetCanvas.height = h;

  sheetCtx.fillStyle = '#FFFFFF';
  sheetCtx.fillRect(0, 0, w, h);

  const cardW = NAMETAG_WIDTH; // 1134 px
  const cardH = NAMETAG_HEIGHT; // 1572 px
  const gapX = 60; // gap between columns (~5.1 mm)
  const gapY = 60; // gap between rows (~5.1 mm)

  const totalGridW = cardW * 3 + gapX * 2; // 3402 + 120 = 3522 px (fits inside 3661 px printable area)
  const totalGridH = cardH * 3 + gapY * 2; // 4716 + 120 = 4836 px (fits inside 5551 px printable area)

  const startX = Math.round((w - totalGridW) / 2); // 182 px (~15.4 mm margin)
  const startY = Math.round((h - totalGridH) / 2); // 434 px (~36.7 mm margin)

  // Header slug
  sheetCtx.save();
  sheetCtx.fillStyle = '#0F172A';
  sheetCtx.font = 'bold 36px sans-serif';
  sheetCtx.fillText(
    `TOUR DE GUNUNG BATU 2026  |  LEMBAR A3+ ID CARD PANITIA (LEMBAR ${sheetIdx + 1} / ${totalSheets})  |  ${side === 'front' ? 'TAMPAK DEPAN' : 'TAMPAK BELAKANG (TUGAS)'}`,
    startX,
    startY - 160
  );

  sheetCtx.font = 'bold 26px sans-serif';
  sheetCtx.fillStyle = '#1D3AAE';
  sheetCtx.fillText(
    'KERTAS A3+ (329×483mm) • AREA CETAK 310×470mm • 9 PCS KARTU B4 (9.6×13.3cm) • 300 DPI',
    startX,
    startY - 110
  );

  sheetCtx.font = '500 24px sans-serif';
  sheetCtx.fillStyle = '#64748B';
  sheetCtx.textAlign = 'right';
  sheetCtx.fillText(
    mirrorCols ? 'DUPLEX FLIP LONG-EDGE (POSISI MIRROR SESUAI DEPAN)' : 'POTONG MENGIKUTI GARIS SIKU POTONG',
    w - startX,
    startY - 110
  );
  sheetCtx.restore();

  // Draw 3 columns x 3 rows = 9 cards
  for (let i = 0; i < members.length && i < 9; i++) {
    const origCol = i % 3;
    const row = Math.floor(i / 3);
    // If mirrorCols is true (back page in duplex), invert column: 0->2, 1->1, 2->0
    const col = mirrorCols ? 2 - origCol : origCol;

    const posX = startX + col * (cardW + gapX);
    const posY = startY + row * (cardH + gapY);

    sheetCtx.drawImage(cardCanvases[i], 0, 0, NAMETAG_WIDTH, NAMETAG_HEIGHT, posX, posY, cardW, cardH);
    drawCropMarks(sheetCtx, posX, posY, cardW, cardH, 40, 10);
  }

  // Cutting guidelines
  const midX1 = startX + cardW + gapX / 2;
  const midX2 = startX + cardW * 2 + gapX * 1.5;
  drawCuttingGuide(sheetCtx, midX1, startY - 20, midX1, startY + totalGridH + 20);
  drawCuttingGuide(sheetCtx, midX2, startY - 20, midX2, startY + totalGridH + 20);

  const midY1 = startY + cardH + gapY / 2;
  const midY2 = startY + cardH * 2 + gapY * 1.5;
  drawCuttingGuide(sheetCtx, startX - 20, midY1, startX + totalGridW + 20, midY1);
  drawCuttingGuide(sheetCtx, startX - 20, midY2, startX + totalGridW + 20, midY2);

  // Footer slug
  sheetCtx.save();
  sheetCtx.fillStyle = '#94A3B8';
  sheetCtx.font = 'bold 24px sans-serif';
  sheetCtx.textAlign = 'center';
  sheetCtx.fillText(
    'ID CARD RESMI PANITIA TOUR DE GUNUNG BATU 2026 — UKURAN B4 (KERTAS 9.6×13.3cm / PLASTIK 10×15cm)',
    w / 2,
    h - 60
  );
  sheetCtx.restore();
}

/**
 * Bulk Generate Nametags as a SINGLE MULTI-PAGE PDF (Duplex A3+ Ready)
 */
export async function generateBulkNametagPdf(
  members: PanitiaMember[],
  mode: 'duplex_a3_plus' | 'front_only_a3_plus' | 'back_only_a3_plus',
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  const total = members.length;
  if (total === 0) throw new Error('Tidak ada data panitia.');

  onProgress?.(5, 'Memuat template NAMETAG.jpg & font...');
  const [hasSakana, templateImg] = await Promise.all([
    ensureSakanaFontLoaded(),
    ensureNametagTemplateLoaded(),
  ]);

  const perSheet = 9;
  const totalBatches = Math.ceil(total / perSheet);

  // Create 9 card canvases for rendering
  const cardCanvases: HTMLCanvasElement[] = [];
  const cardContexts: CanvasRenderingContext2D[] = [];
  for (let i = 0; i < perSheet; i++) {
    const c = document.createElement('canvas');
    c.width = NAMETAG_WIDTH;
    c.height = NAMETAG_HEIGHT;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('Canvas context tidak didukung.');
    cardCanvases.push(c);
    cardContexts.push(ctx);
  }

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = A3_PLUS_WIDTH;
  sheetCanvas.height = A3_PLUS_HEIGHT;
  const sheetCtx = sheetCanvas.getContext('2d');
  if (!sheetCtx) throw new Error('Canvas context sheet tidak didukung.');

  // jsPDF A3+ Portrait (329 x 483 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [329, 483],
    compress: true,
  });

  let pageCounter = 0;

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const slice = members.slice(batchIdx * perSheet, (batchIdx + 1) * perSheet);

    // 1. Render FRONT side
    if (mode === 'duplex_a3_plus' || mode === 'front_only_a3_plus') {
      const p = Math.round(10 + (batchIdx / totalBatches) * 40);
      onProgress?.(p, `Merender Lembar Depan Batch #${batchIdx + 1} (${slice.length} Panitia)...`);

      for (let c = 0; c < slice.length; c++) {
        drawNametagFront(cardCanvases[c], cardContexts[c], slice[c], templateImg, hasSakana);
      }

      renderNametagA3PlusSheet(sheetCanvas, sheetCtx, cardCanvases, slice, 'front', batchIdx, totalBatches, false);
      const imgData = sheetCanvas.toDataURL('image/jpeg', 0.90);

      if (pageCounter > 0) doc.addPage([329, 483], 'portrait');
      doc.addImage(imgData, 'JPEG', 0, 0, 329, 483, undefined, 'FAST');
      pageCounter++;
      await new Promise((r) => setTimeout(r, 20));
    }

    // 2. Render BACK side (with horizontal mirror for duplex flip on long edge)
    if (mode === 'duplex_a3_plus' || mode === 'back_only_a3_plus') {
      const p = Math.round(50 + (batchIdx / totalBatches) * 40);
      onProgress?.(p, `Merender Lembar Belakang Batch #${batchIdx + 1} (Tugas)...`);

      for (let c = 0; c < slice.length; c++) {
        drawNametagBack(cardCanvases[c], cardContexts[c], slice[c], templateImg, hasSakana);
      }

      renderNametagA3PlusSheet(sheetCanvas, sheetCtx, cardCanvases, slice, 'back', batchIdx, totalBatches, mode === 'duplex_a3_plus');
      const imgData = sheetCanvas.toDataURL('image/jpeg', 0.90);

      if (pageCounter > 0) doc.addPage([329, 483], 'portrait');
      doc.addImage(imgData, 'JPEG', 0, 0, 329, 483, undefined, 'FAST');
      pageCounter++;
      await new Promise((r) => setTimeout(r, 20));
    }
  }

  onProgress?.(95, 'Menyelesaikan file PDF...');
  const pdfBlob = doc.output('blob');
  onProgress?.(100, 'Selesai!');
  return pdfBlob;
}

/**
 * Bulk Generate Nametags as ZIP of A3+ sheets or individual cards
 */
export async function generateBulkNametagZip(
  members: PanitiaMember[],
  mode: 'sheet_a3_plus' | 'individual',
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  const total = members.length;
  if (total === 0) throw new Error('Tidak ada data panitia.');

  onProgress?.(5, 'Memuat template NAMETAG.jpg...');
  const [hasSakana, templateImg] = await Promise.all([
    ensureSakanaFontLoaded(),
    ensureNametagTemplateLoaded(),
  ]);

  const zip = new JSZip();

  if (mode === 'individual') {
    const folder = zip.folder('ID_Card_Panitia_B4_Depan_Belakang') || zip;
    const canvas = document.createElement('canvas');
    canvas.width = NAMETAG_WIDTH;
    canvas.height = NAMETAG_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D tidak didukung.');

    for (let i = 0; i < total; i++) {
      const m = members[i];
      const p = Math.round(10 + (i / total) * 80);
      onProgress?.(p, `Merender Kartu ${i + 1}/${total}: ${m.nama}`);

      const cleanNm = m.nama.replace(/[^a-zA-Z0-9]/g, '_');
      const cleanDiv = m.divisi.replace(/[^a-zA-Z0-9]/g, '_');

      // Front
      drawNametagFront(canvas, ctx, m, templateImg, hasSakana);
      const frontBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      if (frontBlob) folder.file(`${String(i + 1).padStart(2, '0')}_DEPAN_${cleanDiv}_${cleanNm}.jpg`, frontBlob);

      // Back
      drawNametagBack(canvas, ctx, m, templateImg, hasSakana);
      const backBlob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      if (backBlob) folder.file(`${String(i + 1).padStart(2, '0')}_BELAKANG_TUGAS_${cleanDiv}_${cleanNm}.jpg`, backBlob);
    }
  } else {
    // Sheet A3+ (9 per sheet)
    const perSheet = 9;
    const totalBatches = Math.ceil(total / perSheet);
    const folder = zip.folder('LEMBAR_A3_PLUS_NAMETAG_PANITIA_B4') || zip;

    const cardCanvases: HTMLCanvasElement[] = [];
    const cardContexts: CanvasRenderingContext2D[] = [];
    for (let i = 0; i < perSheet; i++) {
      const c = document.createElement('canvas');
      c.width = NAMETAG_WIDTH;
      c.height = NAMETAG_HEIGHT;
      const ctx = c.getContext('2d');
      if (!ctx) throw new Error('Canvas context tidak didukung.');
      cardCanvases.push(c);
      cardContexts.push(ctx);
    }

    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = A3_PLUS_WIDTH;
    sheetCanvas.height = A3_PLUS_HEIGHT;
    const sheetCtx = sheetCanvas.getContext('2d');
    if (!sheetCtx) throw new Error('Canvas context sheet tidak didukung.');

    for (let b = 0; b < totalBatches; b++) {
      const p = Math.round(10 + (b / totalBatches) * 80);
      onProgress?.(p, `Merender Lembar A3+ Batch #${b + 1} dari ${totalBatches}...`);

      const slice = members.slice(b * perSheet, (b + 1) * perSheet);

      // Front Sheet
      for (let c = 0; c < slice.length; c++) {
        drawNametagFront(cardCanvases[c], cardContexts[c], slice[c], templateImg, hasSakana);
      }
      renderNametagA3PlusSheet(sheetCanvas, sheetCtx, cardCanvases, slice, 'front', b, totalBatches, false);
      const frontBlob = await new Promise<Blob | null>((res) => sheetCanvas.toBlob(res, 'image/jpeg', 0.92));
      if (frontBlob) folder.file(`Lembar_${String(b + 1).padStart(2, '0')}_TAMPAK_DEPAN.jpg`, frontBlob);

      // Back Sheet (Mirrored for Duplex)
      for (let c = 0; c < slice.length; c++) {
        drawNametagBack(cardCanvases[c], cardContexts[c], slice[c], templateImg, hasSakana);
      }
      renderNametagA3PlusSheet(sheetCanvas, sheetCtx, cardCanvases, slice, 'back', b, totalBatches, true);
      const backBlob = await new Promise<Blob | null>((res) => sheetCanvas.toBlob(res, 'image/jpeg', 0.92));
      if (backBlob) folder.file(`Lembar_${String(b + 1).padStart(2, '0')}_TAMPAK_BELAKANG_TUGAS.jpg`, backBlob);
    }
  }

  onProgress?.(92, 'Mengompres file ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' }, (meta) => {
    onProgress?.(92 + Math.round(meta.percent * 0.08), `Mengompres file ZIP (${Math.round(meta.percent)}%)...`);
  });

  onProgress?.(100, 'Selesai!');
  return zipBlob;
}
