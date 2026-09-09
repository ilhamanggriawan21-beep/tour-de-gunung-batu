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

      // 1. Top Pill Badge: "OFFICIAL PARTICIPANT" (Placed at h * 0.405 inside white box)
      const badgeW = 420;
      const badgeH = 42;
      const badgeX = (w - badgeW) / 2;
      const badgeY = h * 0.405 - badgeH / 2;
      const radius = 21;

      ctx.fillStyle = '#0A1338';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, radius);
      } else {
        ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();
      ctx.strokeStyle = '#F4C716';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#F4C716';
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('OFFICIAL PARTICIPANT', w / 2, badgeY + badgeH / 2);

      // 2. Main Large BIB Number (Placed at h * 0.505 - dead center of white box)
      ctx.fillStyle = '#0A1338';
      ctx.font = '900 230px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Subtle drop shadow for numbers
      ctx.shadowColor = 'rgba(244, 199, 22, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      const formattedBib = String(data.nomorBib).padStart(3, '0');
      ctx.fillText(formattedBib, w / 2, h * 0.505);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // 3. Participant Full Name (Placed at h * 0.605)
      ctx.fillStyle = '#0A1338';
      ctx.font = '900 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cleanName = (data.namaLengkap || 'PESERTA').toUpperCase();
      ctx.fillText(cleanName, w / 2, h * 0.605);

      // 4. Community & Reg Code Row (Placed at h * 0.665)
      const komName = (data.komunitas || 'UMUM').toUpperCase();
      const regCode = data.nomorRegistrasi || '';
      const isPo = data.jenisRegistrasi === 'po_jersey';

      // Render pills row
      const fontBadges = 'bold 26px sans-serif';
      ctx.font = fontBadges;
      const komText = komName;
      const regText = `REG: ${regCode}`;

      const komWidth = ctx.measureText(komText).width + 40;
      const regWidth = ctx.measureText(regText).width + 40;
      const poWidth = isPo ? 200 : 0;
      const gap = 16;

      const totalRowW = komWidth + regWidth + (isPo ? poWidth + gap : 0);
      let startX = (w - totalRowW) / 2;
      const pillsY = h * 0.665 - 23;
      const pillH = 46;

      // Komunitas Pill
      ctx.fillStyle = '#1D3AAE';
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(startX, pillsY, komWidth, pillH, 12);
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
        (ctx as any).roundRect(startX, pillsY, regWidth, pillH, 12);
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
          (ctx as any).roundRect(startX, pillsY, poWidth, pillH, 12);
        } else {
          ctx.fillRect(startX, pillsY, poWidth, pillH);
        }
        ctx.fill();

        ctx.fillStyle = '#0A1338';
        ctx.font = '800 22px sans-serif';
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

