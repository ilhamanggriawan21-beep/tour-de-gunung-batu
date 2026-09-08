export function generateBibCanvas(data: {
  nomorBib: number;
  namaLengkap: string;
  komunitas?: string;
  nomorRegistrasi: string;
  jenisRegistrasi?: string;
}): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  canvas.width = 1000;
  canvas.height = 625;

  // Background Dark Navy
  ctx.fillStyle = '#0A1338';
  ctx.fillRect(0, 0, 1000, 625);

  // Top Yellow Accent Line
  ctx.fillStyle = '#F4C716';
  ctx.fillRect(0, 0, 1000, 20);

  // Top Royal Blue Accent Line
  ctx.fillStyle = '#1D3AAE';
  ctx.fillRect(0, 20, 1000, 15);

  // Header Brand
  ctx.fillStyle = '#F4C716';
  ctx.font = '900 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PEADERAL x RUDEBOYS CYCLIST', 500, 75);

  // Event Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 40px sans-serif';
  ctx.fillText('TOUR DE GUNUNG BATU 2026', 500, 125);

  // Date & Route
  ctx.fillStyle = '#A8CBEE';
  ctx.font = '700 20px sans-serif';
  ctx.fillText('27 SEPTEMBER 2026 • JONGGOL → GUNUNG BATU', 500, 160);

  // BIB Box Frame
  ctx.fillStyle = '#1D3AAE';
  const boxX = 180;
  const boxY = 195;
  const boxW = 640;
  const boxH = 220;
  const radius = 24;

  ctx.beginPath();
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(boxX, boxY, boxW, boxH, radius);
  } else {
    // Fallback rounded rect for older browsers
    ctx.moveTo(boxX + radius, boxY);
    ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, radius);
    ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, radius);
    ctx.arcTo(boxX, boxY + boxH, boxX, boxY, radius);
    ctx.arcTo(boxX, boxY, boxX + boxW, boxY, radius);
    ctx.closePath();
  }
  ctx.fill();
  ctx.strokeStyle = '#F4C716';
  ctx.lineWidth = 6;
  ctx.stroke();

  // BIB Label
  ctx.fillStyle = '#A8CBEE';
  ctx.font = '700 16px sans-serif';
  ctx.fillText('OFFICIAL PARTICIPANT BIB NUMBER', 500, 235);

  // Large BIB Number
  ctx.fillStyle = '#F4C716';
  ctx.font = '900 130px sans-serif';
  ctx.fillText(`#${data.nomorBib}`, 500, 360);

  // Participant Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 36px sans-serif';
  ctx.fillText((data.namaLengkap || '').toUpperCase(), 500, 470);

  // Community
  ctx.fillStyle = '#A8CBEE';
  ctx.font = '700 24px sans-serif';
  ctx.fillText(`KOMUNITAS: ${(data.komunitas || 'UMUM').toUpperCase()}`, 500, 520);

  // Footer Tagline & Reg Code
  ctx.fillStyle = '#F4C716';
  ctx.font = '700 18px sans-serif';
  ctx.fillText(`REG CODE: ${data.nomorRegistrasi} | ELEVASI GAIN ±700M`, 500, 580);

  // Bottom Border Accent
  ctx.fillStyle = '#F4C716';
  ctx.fillRect(0, 615, 1000, 10);

  return canvas;
}

export function downloadBibCard(data: {
  nomorBib: number;
  namaLengkap: string;
  komunitas?: string;
  nomorRegistrasi: string;
  jenisRegistrasi?: string;
}) {
  try {
    const canvas = generateBibCanvas(data);
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
