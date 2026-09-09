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

  // High Resolution 2K Canvas dimensions matching template aspect ratio (~1.419)
  canvas.width = 2000;
  canvas.height = 1410;

  return new Promise(async (resolve) => {
    // Load Sakana custom font for canvas via fetch + ArrayBuffer
    let fontLoaded = false;
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        const fontResponse = await fetch('/fonts/Sakana.ttf');
        const fontBuffer = await fontResponse.arrayBuffer();
        // Register with weight range '1 999' so any weight request matches this single-weight font
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

      // 1. TOP-RIGHT BADGE: "OFFICIAL PARTICIPANT"
      const badgeW = 320;
      const badgeH = 38;
      const badgeX = w - badgeW - w * 0.04;
      const badgeY = h * 0.285 - badgeH / 2;
      const radius = 19;

      ctx.fillStyle = '#0A1338';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, radius);
      } else {
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();
      ctx.strokeStyle = '#F4C716';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#F4C716';
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OFFICIAL PARTICIPANT', badgeX + badgeW / 2, badgeY + badgeH / 2);

      // 2. PURE WHITE BOX ZONE - BIB Number with Sakana Font
      ctx.fillStyle = '#0A1338';
      ctx.font = `330px ${bibFontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Golden shadow
      ctx.shadowColor = 'rgba(244, 199, 22, 0.4)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;

      const formattedBib = String(data.nomorBib).padStart(3, '0');
      ctx.fillText(formattedBib, w / 2, h * 0.47);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Participant Full Name (Sakana Font)
      ctx.fillStyle = '#0A1338';
      ctx.font = '900 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cleanName = (data.namaLengkap || 'PESERTA').toUpperCase();
      ctx.fillText(cleanName, w / 2, h * 0.55);

      // 3. ROUTE BANNER (Shifted 2% further down to h * 0.75)
      const bannerH = 46;
      const bannerY = h * 0.75 - bannerH / 2;
      ctx.fillStyle = 'rgba(10, 19, 56, 0.95)';
      ctx.fillRect(0, bannerY, w, bannerH);
      ctx.fillStyle = '#F4C716';
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('JONGGOL → GUNUNG BATU   •   ELEVATION GAIN ±700M   •   SELF-SUPPORTED', w / 2, bannerY + bannerH / 2);

      // 4. PROMINENT PRIDE BADGES (Shifted 2% further down to h * 0.905)
      const komName = (data.komunitas || 'UMUM').toUpperCase();
      const regCode = data.nomorRegistrasi || '';
      const isPo = data.jenisRegistrasi === 'po_jersey';

      const fontBadges = '900 32px sans-serif';
      ctx.font = fontBadges;
      const komText = `KOMUNITAS: ${komName}`;
      const regText = `REG: ${regCode}`;

      const komWidth = ctx.measureText(komText).width + 56;
      const regWidth = ctx.measureText(regText).width + 56;
      const poWidth = isPo ? 250 : 0;
      const gap = 20;

      const totalRowW = komWidth + regWidth + (isPo ? poWidth + gap : 0);
      let startX = (w - totalRowW) / 2;
      const pillsY = h * 0.905 - 28;
      const pillH = 56;

      // Komunitas Pill
      ctx.fillStyle = '#1D3AAE';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(startX, pillsY, komWidth, pillH, 16);
      } else {
        ctx.fillRect(startX, pillsY, komWidth, pillH);
      }
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(komText, startX + komWidth / 2, pillsY + pillH / 2);

      startX += komWidth + gap;

      // Reg Code Pill
      ctx.fillStyle = '#0A1338';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(startX, pillsY, regWidth, pillH, 16);
      } else {
        ctx.fillRect(startX, pillsY, regWidth, pillH);
      }
      ctx.fill();

      ctx.fillStyle = '#F4C716';
      ctx.fillText(regText, startX + regWidth / 2, pillsY + pillH / 2);

      if (isPo) {
        startX += regWidth + gap;
        // PO Jersey Badge Pill
        ctx.fillStyle = '#F4C716';
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(startX, pillsY, poWidth, pillH, 16);
        } else {
          ctx.fillRect(startX, pillsY, poWidth, pillH);
        }
        ctx.fill();

        ctx.fillStyle = '#0A1338';
        ctx.font = '900 28px sans-serif';
        ctx.fillText('♥ PO JERSEY', startX + poWidth / 2, pillsY + pillH / 2);
      }

      resolve(canvas);
    };

    img.onload = () => {
      const ctx2 = canvas.getContext('2d');
      if (ctx2) {
        ctx2.drawImage(img, 0, 0, canvas.width, canvas.height);
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

export async function downloadBibCard(data: {
  nomorBib: number;
  namaLengkap: string;
  komunitas?: string;
  nomorRegistrasi: string;
  jenisRegistrasi?: string;
}) {
  try {
    const canvas = await generateBibCanvas(data);
    const link = document.createElement('a');
    link.download = `BIB_TOUR_DE_GUNUNG_BATU_${data.nomorBib}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to download BIB PNG:', err);
    alert('Gagal mengunduh gambar BIB. Silakan coba kembali.');
  }
}

