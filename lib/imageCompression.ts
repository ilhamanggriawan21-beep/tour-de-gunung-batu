/**
 * Utility kompresi gambar di sisi klien (browser) menggunakan HTML5 Canvas.
 * Mengompres foto resolusi tinggi kamera HP (5MB-15MB) menjadi JPEG tajam
 * berukuran sangat ringan (~150KB - 350KB) untuk mempercepat unggahan bukti transfer
 * dan menghemat bandwidth & storage.
 */

export interface CompressionOptions {
  maxDimension?: number; // Maksimal lebar / tinggi dalam pixel (default: 1600)
  quality?: number;      // Kualitas JPEG 0.1 - 1.0 (default: 0.75)
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxDimension = 1600, quality = 0.75 } = options;

  // Jika bukan tipe gambar, kembalikan data URL langsung
  if (!file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung skala aspect ratio jika melebihi batas maksimal dimensi
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback jika konteks canvas gagal
          resolve(e.target?.result as string);
          return;
        }

        // Latar belakang putih untuk menghindari transparansi hitam saat konversi ke JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Gambar ulang foto dengan dimensi baru yang teroptimasi
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke format JPEG dengan kompresi terarah
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        // Fallback jika image gagal di-load
        resolve(e.target?.result as string);
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Menghitung estimasi ukuran berkas dari data URL base64 dalam format manusiawi (KB/MB)
 */
export function estimateDataUrlSize(dataUrl: string): string {
  if (!dataUrl || !dataUrl.includes(',')) return '0 KB';
  const base64Length = dataUrl.split(',')[1].length;
  const bytes = (base64Length * 3) / 4;
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
