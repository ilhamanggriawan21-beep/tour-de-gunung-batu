export async function generateBibCanvas(data: {
  nomorBib: number;
  namaLengkap: string;
  komunitas?: string;
  nomorRegistrasi: string;
  jenisRegistrasi?: string;
}): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // High Resolution Canvas matching native template dimensions (2482x1749)
  canvas.width = 2482;
  canvas.height = 1749;

  return new Promise(async (resolve) => {
    // Load Sakana custom font for canvas via fetch + ArrayBuffer
    let fontLoaded = false;
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        const fontResponse = await fetch('/fonts/Sakana.ttf');
        const fontBuffer = await fontResponse.arrayBuffer();
        const sakanaFont = new FontFace('SakanaCanvas', fontBuffer, {
          weight: '1 999',
          style: 'normal',
        });
        const loadedFont = await sakanaFont.load();
        document.fonts.add(loadedFont);
        await document.fonts.ready;

        // Canvas warmup: force font rasterization
        const warmupCanvas = document.createElement('canvas');
        warmupCanvas.width = 10;
        warmupCanvas.height = 10;
        const warmupCtx = warmupCanvas.getContext('2d');
        if (warmupCtx) {
          warmupCtx.font = '48px SakanaCanvas';
          warmupCtx.fillText('012345', 0, 10);
        }

        await new Promise(r => setTimeout(r, 200));
        fontLoaded = true;
      } catch (e) {
        console.warn('Sakana font loading failed, using fallback:', e);
      }
    }

    const bibFontFamily = fontLoaded ? 'SakanaCanvas' : 'sans-serif';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/bib-template-revisi.png?v=3';

    const renderText = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. TOP-RIGHT BADGE: "OFFICIAL PARTICIPANT" (Proportionally Enlarged)
      const badgeFont = '900 52px sans-serif';
      ctx.font = badgeFont;
      const badgeText = 'OFFICIAL PARTICIPANT';
      const badgeTextW = ctx.measureText(badgeText).width;
      const badgeW = badgeTextW + 88;
      const badgeH = 84;
      const badgeX = w - badgeW - w * 0.04;
      const badgeY = h * 0.285 - badgeH / 2;

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

      // 2. PURE WHITE BOX ZONE - BIB Number with Sakana Font & Participant Name
      const formattedBib = String(data.nomorBib).padStart(3, '0');
      const cleanName = (data.namaLengkap || 'PESERTA').toUpperCase();

      // Bold, prominent font sizes with safe margins (clears logo above and banner below)
      const bibFontSize = 510; // Exactly 510px Sakana font as requested
      const bibBaselineY = 1020; // Top of number at ~670px (safely ~95px below logo)

      // Draw BIB Number with Sakana Font
      ctx.fillStyle = '#0A1338';
      ctx.font = `${bibFontSize}px ${bibFontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      // Subtle golden glow shadow matching web preview
      ctx.shadowColor = 'rgba(244, 199, 22, 0.45)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 7;
      ctx.fillText(formattedBib, w / 2, bibBaselineY);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw Participant Name
      let nameFontSize = 100; // Proportionally enlarged bold name
      const nameBaselineY = 1128; // Cleanly placed below number, safely ~150px above route banner

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

      // 3. ROUTE BANNER (top-[75%], Proportionally Enlarged)
      const bannerH = 78;
      const bannerY = Math.round(h * 0.75 - bannerH / 2);
      ctx.fillStyle = 'rgba(10, 19, 56, 0.95)';
      ctx.fillRect(0, bannerY, w, bannerH);

      // Subtle gold border lines on top & bottom of banner
      ctx.fillStyle = 'rgba(244, 199, 22, 0.65)';
      ctx.fillRect(0, bannerY, w, 3);
      ctx.fillRect(0, bannerY + bannerH - 3, w, 3);

      ctx.fillStyle = '#F4C716';
      ctx.font = '900 38px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('JONGGOL → GUNUNG BATU   •   ELEVATION GAIN ±700M   •   SELF-SUPPORTED', w / 2, bannerY + bannerH / 2);

      // 4. PROMINENT PRIDE BADGES (Always strictly 1 single horizontal row, Proportionally Enlarged)
      const komName = (data.komunitas || 'UMUM').toUpperCase();
      const regCode = data.nomorRegistrasi || '';
      const isPo = data.jenisRegistrasi === 'po_jersey';

      const fontBadges = '900 44px sans-serif';
      ctx.font = fontBadges;
      const komText = `KOMUNITAS: ${komName}`;
      const regText = `REG: ${regCode}`;
      const poText = '♥ PO JERSEY';

      const komTextW = ctx.measureText(komText).width;
      const regTextW = ctx.measureText(regText).width;
      const poTextW = isPo ? ctx.measureText(poText).width : 0;

      const pillPadX = 46;
      const komWidth = komTextW + pillPadX * 2;
      const regWidth = regTextW + pillPadX * 2;
      const poWidth = isPo ? poTextW + pillPadX * 2 : 0;
      const gap = 28;

      let totalRowW = komWidth + regWidth + (isPo ? poWidth + gap : 0);

      // Auto-scale pills if total width exceeds 94% of canvas width
      let scaleBadges = 1;
      if (totalRowW > w * 0.94) {
        scaleBadges = (w * 0.94) / totalRowW;
      }

      const pillH = Math.round(86 * scaleBadges);
      const pillsY = Math.round(h * 0.905 - pillH / 2);
      const pillRadius = Math.round(22 * scaleBadges);

      const scaledKomW = Math.round(komWidth * scaleBadges);
      const scaledRegW = Math.round(regWidth * scaleBadges);
      const scaledPoW = Math.round(poWidth * scaleBadges);
      const scaledGap = Math.round(gap * scaleBadges);

      const finalRowW = scaledKomW + scaledRegW + (isPo ? scaledPoW + scaledGap : 0);
      let startX = Math.round((w - finalRowW) / 2);

      const activeBadgeFontSize = Math.round(44 * scaleBadges);
      ctx.font = `900 ${activeBadgeFontSize}px sans-serif`;

      // 1) Komunitas Pill
      ctx.fillStyle = '#1D3AAE';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(startX, pillsY, scaledKomW, pillH, pillRadius);
      } else {
        ctx.fillRect(startX, pillsY, scaledKomW, pillH);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(komText, startX + scaledKomW / 2, pillsY + pillH / 2);

      startX += scaledKomW + scaledGap;

      // 2) Reg Code Pill
      ctx.fillStyle = '#0A1338';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(startX, pillsY, scaledRegW, pillH, pillRadius);
      } else {
        ctx.fillRect(startX, pillsY, scaledRegW, pillH);
      }
      ctx.fill();
      ctx.strokeStyle = 'rgba(244, 199, 22, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#F4C716';
      ctx.fillText(regText, startX + scaledRegW / 2, pillsY + pillH / 2);

      if (isPo) {
        startX += scaledRegW + scaledGap;
        // 3) PO Jersey Pill
        ctx.fillStyle = '#F4C716';
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(startX, pillsY, scaledPoW, pillH, pillRadius);
        } else {
          ctx.fillRect(startX, pillsY, scaledPoW, pillH);
        }
        ctx.fill();
        ctx.strokeStyle = '#0A1338';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#0A1338';
        ctx.fillText(poText, startX + scaledPoW / 2, pillsY + pillH / 2);
      }

      // 5. OUTER GOLDEN BORDER (Matching web preview card style)
      ctx.strokeStyle = '#F4C716';
      ctx.lineWidth = 12;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(6, 6, w - 12, h - 12, 40);
      }
      ctx.stroke();

      resolve(canvas);
    };

    img.onload = () => {
      const ctx2 = canvas.getContext('2d');
      if (ctx2) {
        ctx2.save();
        ctx2.beginPath();
        if (typeof (ctx2 as any).roundRect === 'function') {
          (ctx2 as any).roundRect(0, 0, canvas.width, canvas.height, 36);
          ctx2.clip();
        }
        ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx2.restore();
      }
      renderText();
    };

    img.onerror = () => {
      // Fallback background if image loading fails
      ctx.fillStyle = '#0A1338';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      renderText();
    };
  });
}

export async function saveOrShareImage(
  blob: Blob,
  filename: string,
  title: string = 'Nomor BIB',
  onIosFallback?: (dataUrl: string) => void
): Promise<{ success: boolean; method: string }> {
  const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );

  const file = new File([blob], filename, { type: 'image/png' });

  // 1. Primary iOS & mobile sharing: Web Share API with files (opens iOS Save Image to Photos sheet)
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: title,
        text: `Nomor BIB ${title} - Tour de Gunung Batu 2026`,
      });
      return { success: true, method: 'share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled share sheet safely
        return { success: true, method: 'cancelled' };
      }
      console.warn('Web Share failed, attempting fallback:', err);
    }
  }

  // 2. iOS fallback: if share API is not available or restricted (e.g. in-app browsers)
  if (isIOS) {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    if (onIosFallback) {
      onIosFallback(dataUrl);
      return { success: true, method: 'modal' };
    }

    const blobUrl = URL.createObjectURL(blob);
    const opened = window.open(blobUrl, '_blank');
    if (!opened) {
      window.location.href = blobUrl;
    }
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    return { success: true, method: 'open' };
  }

  // 3. Desktop & Android standard direct download
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
  return { success: true, method: 'download' };
}

export async function downloadBibCard(
  data: {
    nomorBib: number;
    namaLengkap: string;
    komunitas?: string;
    nomorRegistrasi: string;
    jenisRegistrasi?: string;
  },
  onIosFallback?: (dataUrl: string) => void
) {
  try {
    const canvas = await generateBibCanvas(data);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Canvas toBlob failed');

    await saveOrShareImage(
      blob,
      `BIB_TOUR_DE_GUNUNG_BATU_${data.nomorBib}.png`,
      `BIB #${data.nomorBib}`,
      onIosFallback
    );
  } catch (err) {
    console.error('Failed to download BIB PNG:', err);
    alert('Gagal mengunduh gambar BIB. Silakan coba kembali.');
  }
}

