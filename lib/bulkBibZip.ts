import JSZip from 'jszip';

export interface ParticipantForBib {
  id?: string;
  nomor_bib?: number;
  nama_lengkap: string;
  komunitas?: string;
  divisi?: string;
  is_panitia?: boolean;
  nomor_registrasi?: string;
  jenis_registrasi?: string;
  status_pembayaran?: string;
}

export interface BulkBibProgress {
  current: number;
  total: number;
  percent: number;
  currentName: string;
  stage: 'loading_assets' | 'rendering' | 'zipping' | 'done' | 'cancelled';
}

let cachedTemplateImage: HTMLImageElement | null = null;
let fontLoadedPromise: Promise<boolean> | null = null;

export async function ensureSakanaFontLoaded(): Promise<boolean> {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return false;
  }

  if (fontLoadedPromise) {
    return fontLoadedPromise;
  }

  fontLoadedPromise = (async () => {
    try {
      const fontResponse = await fetch('/fonts/Sakana.ttf');
      if (!fontResponse.ok) return false;
      const fontBuffer = await fontResponse.arrayBuffer();
      const sakanaFont = new FontFace('SakanaCanvas', fontBuffer, {
        weight: '1 999',
        style: 'normal',
      });
      const loadedFont = await sakanaFont.load();
      document.fonts.add(loadedFont);
      await document.fonts.ready;

      // Canvas warmup to force font rasterizer
      const warmupCanvas = document.createElement('canvas');
      warmupCanvas.width = 10;
      warmupCanvas.height = 10;
      const warmupCtx = warmupCanvas.getContext('2d');
      if (warmupCtx) {
        warmupCtx.font = '48px SakanaCanvas';
        warmupCtx.fillText('012345', 0, 10);
      }
      return true;
    } catch (e) {
      console.warn('Sakana font loading failed in bulk generator, using fallback:', e);
      return false;
    }
  })();

  return fontLoadedPromise;
}

export async function ensureTemplateImageLoaded(): Promise<HTMLImageElement> {
  if (cachedTemplateImage && cachedTemplateImage.complete && cachedTemplateImage.naturalWidth > 0) {
    return cachedTemplateImage;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/bib-template-revisi.png?v=4';
    img.onload = () => {
      cachedTemplateImage = img;
      resolve(img);
    };
    img.onerror = (err) => {
      console.warn('Gagal memuat template BIB, menggunakan fallback kanvas:', err);
      // Create minimal fallback image
      cachedTemplateImage = img;
      resolve(img);
    };
  });
}

export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[/\\?%*:|"<>]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 40);
}

export function drawBibParticipant(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  templateImg: HTMLImageElement,
  hasSakanaFont: boolean,
  data: ParticipantForBib
) {
  const w = canvas.width;
  const h = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, w, h);

  // 0. Draw Background Image with rounded corners and top hole-punch safe zone
  const topSafeZoneH = 110; // ~9.3 mm safe zone for hole punch / zip ties
  ctx.save();
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(0, 0, w, h, 36);
    ctx.clip();
  }

  // Base sky blue background matching top sky of Gunung Batu
  ctx.fillStyle = '#6BA4DC';
  ctx.fillRect(0, 0, w, h);

  if (templateImg.complete && templateImg.naturalWidth > 0) {
    // Render template shifted down by topSafeZoneH to keep all logos safely below hole punches
    ctx.drawImage(templateImg, 0, topSafeZoneH, w, h - topSafeZoneH);
  } else {
    ctx.fillStyle = '#0A1338';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // 1. Large official badge
  const badgeFont = '900 60px sans-serif';
  ctx.font = badgeFont;
  const badgeText = data.is_panitia ? 'OFFICIAL COMMITTEE' : 'OFFICIAL PARTICIPANT';
  const badgeTextW = ctx.measureText(badgeText).width;
  const badgeW = badgeTextW + 100;
  const badgeH = 96;
  const badgeX = w - badgeW - w * 0.04;
  const badgeY = (h * 0.285 + topSafeZoneH * 0.5) - badgeH / 2;

  ctx.fillStyle = '#0A1338';
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, badgeH / 2);
  } else {
    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
  }
  ctx.fill();
  ctx.strokeStyle = '#F4C716';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = '#F4C716';
  ctx.font = badgeFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);

  // 2. BIB Number & Name
  const formattedBib = data.nomor_bib !== undefined && data.nomor_bib !== null
    ? String(data.nomor_bib).padStart(4, '0')
    : '';
  const cleanName = (data.nama_lengkap || (data.is_panitia ? 'PANITIA' : 'PESERTA')).toUpperCase();

  const bibFontFamily = hasSakanaFont ? 'SakanaCanvas' : 'sans-serif';

  if (formattedBib) {
    const bibFontSize = 585;
    const bibBaselineY = 1095;

    // Draw BIB Number
    ctx.fillStyle = '#0A1338';
    ctx.font = `${bibFontSize}px ${bibFontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Warm glow
    ctx.shadowColor = 'rgba(244, 199, 22, 0.45)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 8;
    ctx.fillText(formattedBib, w / 2, bibBaselineY);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }

  // Participant Name (Font standar sans-serif tebal sesuai histori asli)
  let nameFontSize = data.is_panitia ? 140 : 115;
  const nameBaselineY = formattedBib ? 1215 : 1120;
  ctx.font = `900 ${nameFontSize}px sans-serif`;
  const maxNameWidth = w * 0.82;
  let nameWidth = ctx.measureText(cleanName).width;
  if (nameWidth > maxNameWidth) {
    nameFontSize = Math.floor(nameFontSize * (maxNameWidth / nameWidth));
    ctx.font = `900 ${nameFontSize}px sans-serif`;
  }

  ctx.fillStyle = '#0A1338';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(cleanName, w / 2, nameBaselineY);

  // 3. Route Banner
  const bannerH = 108;
  const bannerY = Math.round(h * 0.78 - bannerH / 2);
  ctx.fillStyle = 'rgba(10, 19, 56, 0.95)';
  ctx.fillRect(0, bannerY, w, bannerH);

  // Gold border lines
  ctx.fillStyle = 'rgba(244, 199, 22, 0.65)';
  ctx.fillRect(0, bannerY, w, 3.5);
  ctx.fillRect(0, bannerY + bannerH - 3.5, w, 3.5);

  ctx.fillStyle = '#F4C716';
  ctx.font = '900 46px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    data.is_panitia
      ? 'TOUR DE GUNUNG BATU 2026   •   OFFICIAL EVENT COMMITTEE'
      : 'JONGGOL → GUNUNG BATU   •   ELEVATION GAIN ±700M   •   SELF-SUPPORTED',
    w / 2,
    bannerY + bannerH / 2
  );

  // 4. Footer Badges
  const pillPadX = 54;
  const gap = 32;
  const badgeItems = [
    data.is_panitia || data.divisi
      ? {
          text: `DIVISI: ${(data.divisi || 'PANITIA').toUpperCase()}`,
          background: '#1D3AAE',
          border: 'rgba(255, 255, 255, 0.3)',
          color: '#FFFFFF',
        }
      : {
          text: `KOMUNITAS: ${(data.komunitas || 'UMUM').toUpperCase()}`,
          background: '#1D3AAE',
          border: 'rgba(255, 255, 255, 0.3)',
          color: '#FFFFFF',
        },
    data.nomor_registrasi && {
      text: `REG: ${data.nomor_registrasi}`,
      background: '#0A1338',
      border: 'rgba(244, 199, 22, 0.7)',
      color: '#F4C716',
    },
    data.jenis_registrasi === 'po_jersey' && {
      text: '♥ PO JERSEY',
      background: '#F4C716',
      border: '#0A1338',
      color: '#0A1338',
    },
  ].filter(Boolean) as Array<{ text: string; background: string; border: string; color: string }>;

  if (badgeItems.length > 0) {
    ctx.font = '900 50px sans-serif';
    const badgeWidths = badgeItems.map((item) => ctx.measureText(item.text).width + pillPadX * 2);
    const totalRowW = badgeWidths.reduce((total, width) => total + width, 0) + gap * (badgeItems.length - 1);
    const scaleBadges = totalRowW > w * 0.94 ? (w * 0.94) / totalRowW : 1;
    const pillH = Math.round(100 * scaleBadges);
    const pillsY = Math.round(h * 0.905 - pillH / 2);
    const pillRadius = Math.round(26 * scaleBadges);
    const scaledGap = Math.round(gap * scaleBadges);
    const scaledWidths = badgeWidths.map((width) => Math.round(width * scaleBadges));
    const finalRowW = scaledWidths.reduce((total, width) => total + width, 0) + scaledGap * (badgeItems.length - 1);
    let startX = Math.round((w - finalRowW) / 2);

    ctx.font = `900 ${Math.round(50 * scaleBadges)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    badgeItems.forEach((item, index) => {
      const badgeWidth = scaledWidths[index];
      ctx.fillStyle = item.background;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(startX, pillsY, badgeWidth, pillH, pillRadius);
      } else {
        ctx.fillRect(startX, pillsY, badgeWidth, pillH);
      }
      ctx.fill();
      ctx.strokeStyle = item.border;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = item.color;
      ctx.fillText(item.text, startX + badgeWidth / 2, pillsY + pillH / 2);
      startX += badgeWidth + scaledGap;
    });
  }

  // 5. Outer Golden Border
  ctx.strokeStyle = '#F4C716';
  ctx.lineWidth = 12;
  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(6, 6, w - 12, h - 12, 40);
  }
  ctx.stroke();
}

export async function generateBulkBibZip(
  participants: ParticipantForBib[],
  onProgress?: (progress: BulkBibProgress) => void,
  abortSignal?: AbortSignal
): Promise<Blob | null> {
  const total = participants.length;
  if (total === 0) {
    throw new Error('Tidak ada data peserta untuk diunduh.');
  }

  // 1. Loading assets
  onProgress?.({
    current: 0,
    total,
    percent: 0,
    currentName: 'Memuat template & font...',
    stage: 'loading_assets',
  });

  const [hasSakanaFont, templateImg] = await Promise.all([
    ensureSakanaFontLoaded(),
    ensureTemplateImageLoaded(),
  ]);

  if (abortSignal?.aborted) {
    onProgress?.({ current: 0, total, percent: 0, currentName: '', stage: 'cancelled' });
    return null;
  }

  // Create single reusable high-res canvas
  const canvas = document.createElement('canvas');
  canvas.width = 2482;
  canvas.height = 1749;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak mendukung 2D Canvas context.');

  const zip = new JSZip();
  const folder = zip.folder('BIB_TourDeGunungBatu') || zip;

  // 2. Render each participant sequentially
  for (let i = 0; i < total; i++) {
    if (abortSignal?.aborted) {
      onProgress?.({ current: i, total, percent: Math.round((i / total) * 80), currentName: '', stage: 'cancelled' });
      return null;
    }

    const participant = participants[i];
    const currentNum = i + 1;
    const cleanName = sanitizeFileName(participant.nama_lengkap || 'PESERTA');
    const formattedBib = String(participant.nomor_bib || i + 1).padStart(4, '0');
    const filename = `BIB_${formattedBib}_${cleanName}.png`;

    onProgress?.({
      current: currentNum,
      total,
      // 0% - 80% is rendering
      percent: Math.round((currentNum / total) * 80),
      currentName: `#${formattedBib} - ${participant.nama_lengkap}`,
      stage: 'rendering',
    });

    drawBibParticipant(canvas, ctx, templateImg, hasSakanaFont, participant);

    // Convert canvas to Blob
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
      folder.file(filename, blob);
    }

    // Yield execution to allow UI update and GC
    if (i % 3 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  if (abortSignal?.aborted) {
    onProgress?.({ current: total, total, percent: 80, currentName: '', stage: 'cancelled' });
    return null;
  }

  // 3. Compress into ZIP
  onProgress?.({
    current: total,
    total,
    percent: 85,
    currentName: 'Mengompres file ZIP...',
    stage: 'zipping',
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 4 }, // level 4 for fast client-side compression
    },
    (metadata) => {
      // 80% - 100% is zipping
      const zippingPercent = 80 + Math.round((metadata.percent / 100) * 20);
      onProgress?.({
        current: total,
        total,
        percent: Math.min(99, zippingPercent),
        currentName: `Mengompres file ZIP (${Math.round(metadata.percent)}%)...`,
        stage: 'zipping',
      });
    }
  );

  onProgress?.({
    current: total,
    total,
    percent: 100,
    currentName: 'Selesai!',
    stage: 'done',
  });

  return zipBlob;
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}
