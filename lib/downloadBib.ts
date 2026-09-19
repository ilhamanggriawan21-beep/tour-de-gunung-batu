export async function generateBibCanvas(data: {
  nomorBib?: number;
  namaLengkap: string;
  komunitas?: string;
  divisi?: string;
  isPanitia?: boolean;
  nomorRegistrasi?: string;
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
    img.src = '/bib-template-revisi.png?v=4';

    const renderText = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 0. Top Safe Zone for hole-punch / zip ties (~110 px = ~9.3 mm)
      const topSafeZoneH = 110;

      // 1. Large official badge balances the event masthead and establishes status.
      const badgeFont = '900 60px sans-serif';
      ctx.font = badgeFont;
      const badgeText = data.isPanitia ? 'OFFICIAL COMMITTEE' : 'OFFICIAL PARTICIPANT';
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

      // 2. The number & name rendering using Sakana Font
      const formattedBib = data.nomorBib !== undefined && data.nomorBib !== null
        ? String(data.nomorBib).padStart(4, '0')
        : '';
      const cleanName = (data.namaLengkap || (data.isPanitia ? 'PANITIA' : 'PESERTA')).toUpperCase();

      if (formattedBib) {
        const bibFontSize = 585;
        const bibBaselineY = 1095;

        // Draw BIB Number with Sakana Font
        ctx.fillStyle = '#0A1338';
        ctx.font = `${bibFontSize}px ${bibFontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';

        // Warm glow separates the navy number from the pale photographic background.
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
      let nameFontSize = data.isPanitia ? 140 : 115;
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

      // 3. A strong route banner visually separates the ID zone from the footer.
      const bannerH = 108;
      const bannerY = Math.round(h * 0.78 - bannerH / 2);
      ctx.fillStyle = 'rgba(10, 19, 56, 0.95)';
      ctx.fillRect(0, bannerY, w, bannerH);

      // Subtle gold border lines on top & bottom of banner
      ctx.fillStyle = 'rgba(244, 199, 22, 0.65)';
      ctx.fillRect(0, bannerY, w, 3.5);
      ctx.fillRect(0, bannerY + bannerH - 3.5, w, 3.5);

      ctx.fillStyle = '#F4C716';
      ctx.font = '900 46px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        data.isPanitia
          ? 'TOUR DE GUNUNG BATU 2026   •   OFFICIAL EVENT COMMITTEE'
          : 'JONGGOL → GUNUNG BATU   •   ELEVATION GAIN ±700M   •   SELF-SUPPORTED',
        w / 2,
        bannerY + bannerH / 2
      );

      // 4. Footer badges carry identity (Divisi for Panitia - NO Komunitas)
      const pillPadX = 54;
      const gap = 32;

      const badgeItems = [
        data.isPanitia || data.divisi
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
        data.nomorRegistrasi && {
          text: `REG: ${data.nomorRegistrasi}`,
          background: '#0A1338',
          border: 'rgba(244, 199, 22, 0.7)',
          color: '#F4C716',
        },
        data.jenisRegistrasi === 'po_jersey' && {
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
        const topSafeZoneH = 110;
        ctx2.save();
        ctx2.beginPath();
        if (typeof (ctx2 as any).roundRect === 'function') {
          (ctx2 as any).roundRect(0, 0, canvas.width, canvas.height, 36);
          ctx2.clip();
        }

        // Sky blue background fill
        ctx2.fillStyle = '#6BA4DC';
        ctx2.fillRect(0, 0, canvas.width, canvas.height);

        // Draw template shifted down by topSafeZoneH
        ctx2.drawImage(img, 0, topSafeZoneH, canvas.width, canvas.height - topSafeZoneH);
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
    nomorBib?: number;
    namaLengkap: string;
    komunitas?: string;
    divisi?: string;
    isPanitia?: boolean;
    nomorRegistrasi?: string;
    jenisRegistrasi?: string;
  },
  onIosFallback?: (dataUrl: string) => void
) {
  try {
    const canvas = await generateBibCanvas(data);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Canvas toBlob failed');

    const fileName = data.isPanitia
      ? `NAMETAG_PANITIA_${(data.namaLengkap || 'PANITIA').replace(/\s+/g, '_').toUpperCase()}.png`
      : `BIB_TOUR_DE_GUNUNG_BATU_${data.nomorBib}.png`;

    await saveOrShareImage(
      blob,
      fileName,
      data.isPanitia ? `Name Tag ${data.namaLengkap}` : `BIB #${data.nomorBib}`,
      onIosFallback
    );
  } catch (err) {
    console.error('Failed to download BIB/NameTag PNG:', err);
    alert('Gagal mengunduh gambar Name Tag/BIB. Silakan coba kembali.');
  }
}
