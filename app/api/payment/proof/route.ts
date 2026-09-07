import { NextResponse } from 'next/server';
import { uploadPaymentProof, getRegistrationDetails } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nomor_registrasi, bukti_url } = body;

    if (!nomor_registrasi || !bukti_url) {
      return NextResponse.json({ success: false, error: 'Nomor registrasi dan bukti transfer wajib diisi' }, { status: 400 });
    }

    const updatedPo = uploadPaymentProof(nomor_registrasi, bukti_url);
    if (!updatedPo) {
      return NextResponse.json({ success: false, error: 'Data PO Jersey tidak ditemukan untuk nomor registrasi ini' }, { status: 404 });
    }

    return NextResponse.json({ success: true, jersey_po: updatedPo });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal menyimpan bukti transfer' }, { status: 500 });
  }
}
