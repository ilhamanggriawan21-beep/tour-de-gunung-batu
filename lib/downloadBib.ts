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

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/images/bib-template.png';

    const renderText = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Top Pill Badge: "OFFICIAL PARTICIPANT"
      const badgeW = 460;
      const badgeH = 46;
      const badgeX = (w - badgeW) / 2;
      const badgeY = h * 0.335;
      const radius = 23;

      ctx.fillStyle = '#0A1338';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, radius);
      } else {
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();
      ctx.strokeStyle = '#F4C716';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#F4C716';
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OFFICIAL PARTICIPANT', w / 2, badgeY + badgeH / 2);

      // 2. Main Large BIB Number (3-digit padded format: 088)
      ctx.fillStyle = '#0A1338';
      ctx.font = '900 230px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Subtle drop shadow for numbers
      ctx.shadowColor = 'rgba(244, 199, 22, 0.35)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      const formattedBib = String(data.nomorBib).padStart(3, '0');
      ctx.fillText(formattedBib, w / 2, h * 0.475);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // 3. Participant Full Name
      ctx.fillStyle = '#0A1338';
      ctx.font = '900 54px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cleanName = (data.namaLengkap || 'PESERTA').toUpperCase();
      ctx.fillText(cleanName, w / 2, h * 0.585);

      // 4. Community & Reg Code Row
      const komName = (data.komunitas || 'UMUM').toUpperCase();
      const regCode = data.nomorRegistrasi || '';
      const isPo = data.jenisRegistrasi === 'po_jersey';

      // Render pills row
      const fontBadges = 'bold 28px sans-serif';
      ctx.font = fontBadges;
      const komText = komName;
      const regText = `REG: ${regCode}`;

      const komWidth = ctx.measureText(komText).width + 44;
      const regWidth = ctx.measureText(regText).width + 44;
      const poWidth = isPo ? 220 : 0;
      const gap = 16;

      const totalRowW = komWidth + regWidth + (isPo ? poWidth + gap : 0);
      let startX = (w - totalRowW) / 2;
      const pillsY = h * 0.655;
      const pillH = 50;

      // Komunitas Pill
      ctx.fillStyle = '#1D3AAE';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(startX, pillsY, komWidth, pillH, 14);
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
        (ctx as any).roundRect(startX, pillsY, regWidth, pillH, 14);
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
          (ctx as any).roundRect(startX, pillsY, poWidth, pillH, 14);
        } else {
          ctx.fillRect(startX, pillsY, poWidth, pillH);
        }
        ctx.fill();

        ctx.fillStyle = '#0A1338';
        ctx.font = '800 24px sans-serif';
        ctx.fillText('♥ PO JERSEY', startX + poWidth / 2, pillsY + pillH / 2);
      }

      // 5. Footer Route Banner Bar
      const bannerH = 46;
      const bannerY = h * 0.73;
      ctx.fillStyle = 'rgba(10, 19, 56, 0.88)';
      ctx.fillRect(0, bannerY, w, bannerH);

      ctx.fillStyle = '#F4C716';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('JONGGOL → GUNUNG BATU   •   ELEVATION GAIN ±700M   •   SELF-SUPPORTED', w / 2, bannerY + bannerH / 2);

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

