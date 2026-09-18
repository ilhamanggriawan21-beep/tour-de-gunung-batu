'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Download,
  ClipboardPaste,
  Eye,
  CheckCircle,
  Loader2,
  Users,
  Printer,
  Sparkles,
  RefreshCw,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  PanitiaMember,
  DIVISION_PRESETS,
  getDivisionConfig,
  drawSingleNametag,
  generateBulkNametagZip,
  NAMETAG_WIDTH,
  NAMETAG_HEIGHT,
} from '@/lib/nametagGenerator';
import { ensureSakanaFontLoaded } from '@/lib/bulkBibZip';

const DEFAULT_PANITIA: PanitiaMember[] = [
  { id: '1', nama: 'Rangga (Rudeboys)', divisi: 'KETUA PELAKSANA', nomor_panitia: 'CREW #01', kontak: '0877-4587-0767', golongan_darah: 'O' },
  { id: '2', nama: 'Ilham (PEADERAL)', divisi: 'CO-LEAD / TEKNIS & SISTEM', nomor_panitia: 'CREW #02', kontak: '0812-3456-7890', golongan_darah: 'A' },
  { id: '3', nama: 'Road Captain & Marshall Lead', divisi: 'MARSHALL', nomor_panitia: 'CREW #03', kontak: '0813-1122-3344', golongan_darah: 'B' },
  { id: '4', nama: 'Tim Medis Evakuasi', divisi: 'TIM MEDIS', nomor_panitia: 'CREW #04', kontak: '0812-9988-7766', golongan_darah: 'AB' },
  { id: '5', nama: 'Sweeper & SAG Wagon', divisi: 'SWEEPER', nomor_panitia: 'CREW #05', kontak: '0815-4433-2211', golongan_darah: 'O' },
  { id: '6', nama: 'Meja Registrasi & Kit', divisi: 'REGISTRASI & BIB', nomor_panitia: 'CREW #06', kontak: '0817-5566-7788', golongan_darah: 'A' },
  { id: '7', nama: 'Logistik, Water Station & Drop Bag', divisi: 'LOGISTIK', nomor_panitia: 'CREW #07', kontak: '0818-6677-8899', golongan_darah: 'B' },
  { id: '8', nama: 'Dokumentasi & Media Video', divisi: 'DOKUMENTASI', nomor_panitia: 'CREW #08', kontak: '0819-7788-9900', golongan_darah: 'O' },
];

const LOCAL_STORAGE_KEY = 'tdgb_panitia_list_v1';

interface NametagPanitiaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NametagPanitiaModal: React.FC<NametagPanitiaModalProps> = ({ isOpen, onClose }) => {
  const [members, setMembers] = useState<PanitiaMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'manage' | 'paste' | 'export'>('manage');

  // Form input single
  const [formNama, setFormNama] = useState('');
  const [formDivisi, setFormDivisi] = useState('MARSHALL');
  const [formKontak, setFormKontak] = useState('');
  const [formNomor, setFormNomor] = useState('');
  const [formGoldar, setFormGoldar] = useState('O');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bulk paste text
  const [pasteText, setPasteText] = useState('');

  // Generation status
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ percent: number; message: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Canvas ref for live preview
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [eventLogo, setEventLogo] = useState<HTMLImageElement | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
          setSelectedMemberId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved panitia list:', e);
    }
    setMembers(DEFAULT_PANITIA);
    setSelectedMemberId(DEFAULT_PANITIA[0].id);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined' || members.length === 0) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.warn('Failed to save panitia list:', e);
    }
  }, [members]);

  // Load logo once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/images/logo_event.png';
    img.onload = () => setEventLogo(img);
    img.onerror = () => setEventLogo(null);
  }, []);

  // Render live preview on canvas
  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];

  useEffect(() => {
    if (!previewCanvasRef.current || !selectedMember) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ensureSakanaFontLoaded().then((hasSakana) => {
      drawSingleNametag(canvas, ctx, selectedMember, eventLogo, hasSakana);
    });
  }, [selectedMember, eventLogo]);

  if (!isOpen) return null;

  // Handle add or update member
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      alert('Nama panitia wajib diisi.');
      return;
    }

    if (editingId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                nama: formNama.trim(),
                divisi: formDivisi,
                kontak: formKontak.trim(),
                nomor_panitia: formNomor.trim() || `CREW #${String(prev.findIndex((p) => p.id === editingId) + 1).padStart(2, '0')}`,
                golongan_darah: formGoldar,
              }
            : m
        )
      );
      setEditingId(null);
    } else {
      const newId = String(Date.now());
      const newMember: PanitiaMember = {
        id: newId,
        nama: formNama.trim(),
        divisi: formDivisi,
        kontak: formKontak.trim(),
        nomor_panitia: formNomor.trim() || `CREW #${String(members.length + 1).padStart(2, '0')}`,
        golongan_darah: formGoldar,
      };
      setMembers((prev) => [...prev, newMember]);
      setSelectedMemberId(newId);
    }

    // Reset form
    setFormNama('');
    setFormKontak('');
    setFormNomor('');
  };

  const handleEditClick = (m: PanitiaMember) => {
    setEditingId(m.id);
    setFormNama(m.nama);
    setFormDivisi(m.divisi);
    setFormKontak(m.kontak || '');
    setFormNomor(m.nomor_panitia || '');
    setFormGoldar(m.golongan_darah || 'O');
    setSelectedMemberId(m.id);
    setActiveTab('manage');
  };

  const handleDeleteMember = (id: string) => {
    if (members.length <= 1) {
      alert('Minimal sisakan 1 data panitia.');
      return;
    }
    if (confirm('Hapus panitia ini dari daftar nametag?')) {
      const next = members.filter((m) => m.id !== id);
      setMembers(next);
      if (selectedMemberId === id) {
        setSelectedMemberId(next[0].id);
      }
    }
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan daftar ke template panitia default?')) {
      setMembers(DEFAULT_PANITIA);
      setSelectedMemberId(DEFAULT_PANITIA[0].id);
    }
  };

  // Quick Paste parsing
  const handleParseBulkPaste = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: PanitiaMember[] = [];
    let counter = members.length + 1;

    for (const line of lines) {
      // Clean leading numbering like "1. ", "1 - "
      const cleanLine = line.replace(/^\d+[\.\-\)]\s*/, '');
      const parts = cleanLine.split(/[-–,|]/).map((p) => p.trim());

      const nama = parts[0] || 'PANITIA';
      const divisi = parts[1] || 'MARSHALL';
      const kontak = parts[2] || '';

      parsed.push({
        id: String(Date.now() + Math.random()),
        nama,
        divisi: divisi.toUpperCase(),
        nomor_panitia: `CREW #${String(counter).padStart(2, '0')}`,
        kontak,
        golongan_darah: 'O',
      });
      counter++;
    }

    if (parsed.length > 0) {
      setMembers((prev) => [...prev, ...parsed]);
      setSelectedMemberId(parsed[0].id);
      setPasteText('');
      setActiveTab('manage');
      setSuccessMessage(`Berhasil menambahkan ${parsed.length} nama panitia dari daftar WhatsApp!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Export handlers
  const handleExportZip = async (mode: 'sheet_a4' | 'sheet_a3' | 'individual') => {
    if (members.length === 0) return;
    setIsExporting(true);
    setSuccessMessage(null);
    setExportProgress({ percent: 5, message: 'Menyiapkan canvas & aset...' });

    try {
      const blob = await generateBulkNametagZip(members, mode, (percent, message) => {
        setExportProgress({ percent, message });
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      let filename = `Nametag_Panitia_TourDeGunungBatu_${mode}.zip`;
      if (mode === 'sheet_a4') filename = `Lembar_Cetak_A4_Nametag_Panitia_${members.length}_Orang.zip`;
      if (mode === 'sheet_a3') filename = `Lembar_Cetak_A3_Nametag_Panitia_${members.length}_Orang.zip`;
      if (mode === 'individual') filename = `Nametag_Panitia_Satuan_PNG.zip`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage(`Selesai! File ${filename} berhasil diunduh.`);
    } catch (err: any) {
      console.error('Export error:', err);
      alert('Gagal mengunduh: ' + (err?.message || 'Error tidak diketahui'));
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // Download currently previewed single card
  const handleDownloadSinglePreview = () => {
    if (!previewCanvasRef.current || !selectedMember) return;
    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Nametag_${selectedMember.divisi}_${selectedMember.nama.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-brand-navy px-6 py-4 flex items-center justify-between text-white border-b border-brand-yellow/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-yellow text-brand-navy flex items-center justify-center font-black shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-wide">
                  Generator & Cetak Nametag Panitia
                </h3>
                <span className="text-[10px] font-bold bg-brand-royal text-brand-yellow px-2 py-0.5 rounded-full uppercase tracking-wider border border-brand-yellow/30">
                  Resmi 2026
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Otomatisasi ID Card Panitia siap potong ke Lembar A4 & A3 (Tour de Gunung Batu)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List & Forms (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Tabs Navigation */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('manage')}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'manage'
                    ? 'bg-white text-brand-navy shadow-sm border border-slate-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Daftar Panitia ({members.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'paste'
                    ? 'bg-white text-brand-navy shadow-sm border border-slate-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>Paste Massal (WA)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
                  activeTab === 'export'
                    ? 'bg-brand-royal text-brand-yellow shadow-md font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Ekspor</span>
              </button>
            </div>

            {/* Notification */}
            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: MANAGE & SINGLE FORM */}
            {activeTab === 'manage' && (
              <div className="space-y-4">
                {/* Form Tambah/Edit */}
                <form
                  onSubmit={handleSaveMember}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-inner"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-brand-navy flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-royal" />
                      <span>{editingId ? 'Edit Data Panitia' : 'Tambah Panitia Baru'}</span>
                    </span>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setFormNama('');
                          setFormKontak('');
                          setFormNomor('');
                        }}
                        className="text-[11px] text-rose-600 font-bold hover:underline"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Nama Panitia *</label>
                      <input
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        value={formNama}
                        onChange={(e) => setFormNama(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-royal"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Divisi / Tugas *</label>
                      <select
                        value={formDivisi}
                        onChange={(e) => setFormDivisi(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-royal bg-white"
                      >
                        {Object.keys(DIVISION_PRESETS).map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">No. WhatsApp Darurat</label>
                      <input
                        type="text"
                        placeholder="0812-XXXX-XXXX"
                        value={formKontak}
                        onChange={(e) => setFormKontak(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-royal font-mono"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Kode Panitia</label>
                        <input
                          type="text"
                          placeholder="CREW #01"
                          value={formNomor}
                          onChange={(e) => setFormNomor(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-royal font-mono uppercase"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Gol. Darah</label>
                        <select
                          value={formGoldar}
                          onChange={(e) => setFormGoldar(e.target.value)}
                          className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-royal bg-white"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                          <option value="-">-</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center space-x-2 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-brand-yellow" />
                    <span>{editingId ? 'Simpan Perubahan' : 'Tambahkan ke Daftar'}</span>
                  </button>
                </form>

                {/* Table Panitia */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-brand-navy">
                      Daftar Panitia ({members.length} Orang)
                    </span>
                    <button
                      type="button"
                      onClick={handleResetDefault}
                      className="text-[11px] text-slate-500 hover:text-brand-royal flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Contoh Panitia</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 z-10 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Nama</th>
                          <th className="p-2.5">Divisi</th>
                          <th className="p-2.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {members.map((m) => {
                          const isSelected = m.id === selectedMemberId;
                          const divCfg = getDivisionConfig(m.divisi);
                          return (
                            <tr
                              key={m.id}
                              onClick={() => setSelectedMemberId(m.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-amber-50 font-bold' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="p-2.5">
                                <div className="font-extrabold text-slate-900">{m.nama}</div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {m.nomor_panitia || 'CREW'} • WA: {m.kontak || '-'}
                                </div>
                              </td>
                              <td className="p-2.5">
                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase inline-block"
                                  style={{
                                    backgroundColor: divCfg.bg,
                                    color: divCfg.color,
                                  }}
                                >
                                  {m.divisi}
                                </span>
                              </td>
                              <td className="p-2.5 text-center space-x-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(m);
                                  }}
                                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
                                  title="Edit Data"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMember(m.id);
                                  }}
                                  className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BULK PASTE FROM WHATSAPP */}
            {activeTab === 'paste' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div>
                  <h4 className="font-black text-brand-navy text-xs sm:text-sm">
                    📥 Salin-Tempel Cepat dari WhatsApp / Catatan
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tulis atau paste satu panitia per baris dengan format: <br />
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-brand-royal text-[10px]">
                      Nama - Divisi - No WhatsApp
                    </code>
                  </p>
                </div>

                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Contoh:\n1. Budi Santoso - Marshall - 08123456789\n2. Siti Aminah - Tim Medis - 0877998877\n3. Doni Pradana - Sweeper - 08561234\n4. Eko Logistik - Logistik\n5. Rini Registrasi - Registrasi & BIB`}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-royal"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Sistem otomatis merapikan nomor & divisi
                  </span>
                  <button
                    type="button"
                    disabled={!pasteText.trim()}
                    onClick={handleParseBulkPaste}
                    className="px-5 py-2 rounded-xl bg-brand-royal hover:bg-blue-800 text-brand-yellow text-xs font-black flex items-center space-x-2 shadow disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambahkan Semua ke Daftar</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: EXPORT & CETAK */}
            {activeTab === 'export' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="font-black text-brand-navy text-sm">
                    Pilihan Format Cetak & Pengemasan
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pilih format yang paling efisien untuk kebutuhan cetak Anda
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A4 */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 hover:border-brand-royal space-y-2.5 transition-all">
                    <div className="flex items-center space-x-2 text-brand-navy font-black text-xs sm:text-sm">
                      <FileText className="w-4 h-4 text-brand-royal" />
                      <span>Lembar A4 (4 ID Card / Lembar)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Sangat pas untuk printer kantor / rumahan. Lengkap dengan garis potong (siku potong) sehingga tinggal gunting rapi.
                    </p>
                    <div className="text-[10px] font-bold text-brand-royal bg-blue-50 px-2 py-1 rounded-lg">
                      Total: {Math.ceil(members.length / 4)} Lembar A4
                    </div>
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => handleExportZip('sheet_a4')}
                      className="w-full py-2.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-brand-yellow font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh ZIP Lembar A4</span>
                    </button>
                  </div>

                  {/* Option A3 */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-white to-amber-50/30 space-y-2.5 transition-all">
                    <div className="flex items-center space-x-2 text-brand-navy font-black text-xs sm:text-sm">
                      <Printer className="w-4 h-4 text-amber-600" />
                      <span>Lembar A3 (8 ID Card / Lembar)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Standar cetak digital printing percetakan (hemat biaya & kertas). Dilengkapi slug info dan tanda pisau potong.
                    </p>
                    <div className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-lg">
                      Total: {Math.ceil(members.length / 8)} Lembar A3
                    </div>
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={() => handleExportZip('sheet_a3')}
                      className="w-full py-2.5 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-navy font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh ZIP Lembar A3</span>
                    </button>
                  </div>
                </div>

                {/* Option Individual PNG */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Unduh Semua File Satuan:</span>
                    <span className="text-[11px] text-slate-500">Tiap panitia menjadi 1 file PNG 300 DPI resolusi tinggi</span>
                  </div>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => handleExportZip('individual')}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ZIP PNG Satuan</span>
                  </button>
                </div>

                {/* Export Progress */}
                {isExporting && exportProgress && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in">
                    <div className="flex justify-between text-xs font-extrabold text-brand-navy">
                      <span className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 text-brand-royal animate-spin" />
                        <span>{exportProgress.message}</span>
                      </span>
                      <span>{exportProgress.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-brand-royal h-full rounded-full transition-all duration-200"
                        style={{ width: `${exportProgress.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Live Interactive Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-900 rounded-3xl p-4 sm:p-5 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="w-full flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-brand-yellow" />
                <span>Live Preview Kartu Panitia</span>
              </span>
              <span className="font-mono text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Ukuran B3 (1000x1480px)
              </span>
            </div>

            {/* Canvas Container with realistic badge shadow */}
            <div className="w-full flex items-center justify-center p-2">
              <div className="relative max-w-[280px] w-full rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10">
                <canvas
                  ref={previewCanvasRef}
                  width={NAMETAG_WIDTH}
                  height={NAMETAG_HEIGHT}
                  className="w-full h-auto block"
                />
              </div>
            </div>

            {/* Bottom Preview Controls */}
            <div className="w-full space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Panitia Terpilih:</span>
                <span className="font-bold text-white truncate max-w-[160px]">
                  {selectedMember?.nama || '-'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDownloadSinglePreview}
                className="w-full py-2.5 rounded-xl bg-brand-yellow hover:bg-amber-400 text-brand-navy text-xs font-black flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Gambar PNG Kartu Ini</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Tersimpan otomatis di browser. Anda tidak perlu mengulang ketik jika keluar.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
