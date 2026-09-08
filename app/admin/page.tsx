'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopoBackground from '@/components/TopoBackground';
import BibCard from '@/components/BibCard';
import { downloadBibCard } from '@/lib/downloadBib';
import {
  ShieldCheck,
  Users,
  Shirt,
  Download,
  Settings as SettingsIcon,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Save,
  Search,
  Eye,
  FileText,
  Phone,
  UserPlus,
  Trash2,
  Lock,
  Sparkles,
  Edit,
  X,
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'verifikasi' | 'rekap' | 'pengaturan' | 'profil' | 'kelola_pic'>('verifikasi');

  const [loading, setLoading] = useState(true);
  const [registrantsData, setRegistrantsData] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [adminsList, setAdminsList] = useState<any[]>([]);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    harga_short_sleeve: 175000,
    harga_long_sleeve: 185000,
    qris_image_url: '/qris-peaderal.png',
    nomor_rekening: '5220394811',
    nama_bank: 'BCA',
    nama_pemilik_rekening: 'PERGERAKAN SEPEDAH PEADERAL',
    tanggal_tutup_po: '2026-09-20T23:59:59',
    tanggal_tutup_pendaftaran: '2026-09-25T23:59:59',
    kontak_wa_panitia: '6287745870767'
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    nama_pic: '',
    kontak_pic: ''
  });

  // New PIC Form state
  const [newPicForm, setNewPicForm] = useState({
    pihak: 'rudeboys' as 'rudeboys' | 'peaderal',
    nama_pic: '',
    kontak_pic: '',
    email_login: '',
    password: 'admin123'
  });
  const [creatingPic, setCreatingPic] = useState(false);

  const [poFilterStatus, setPoFilterStatus] = useState<string>('semua');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit & Delete State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    registrantId: '',
    nama_lengkap: '',
    komunitas: '',
    no_telepon: '',
    no_telepon_kerabat: '',
    alamat_lengkap: '',
    po_id: '',
    jenis_lengan: 'short_sleeve' as 'short_sleeve' | 'long_sleeve',
    ukuran: 'L' as 'S' | 'M' | 'L' | 'XL' | 'XXL',
    qty: 1,
    metode_ambil: 'ambil_langsung' as 'ambil_langsung' | 'dikirim',
    alamat_pengiriman: '',
    status_pembayaran: 'menunggu_verifikasi' as 'menunggu_verifikasi' | 'lunas' | 'perlu_klarifikasi' | 'kedaluwarsa',
    bukti_transfer_url: ''
  });

  const [deleteRegistrantId, setDeleteRegistrantId] = useState<{ id: string; nama: string } | null>(null);
  const [deletePoId, setDeletePoId] = useState<{ id: string; nama: string } | null>(null);
  const [selectedBibParticipant, setSelectedBibParticipant] = useState<any>(null);

  const openEditModal = (item: any) => {
    const r = item.registrant;
    const p = item.jersey_po;
    setEditingItem(item);
    setEditForm({
      registrantId: r.id,
      nama_lengkap: r.nama_lengkap || '',
      komunitas: r.komunitas || '',
      no_telepon: r.no_telepon || '',
      no_telepon_kerabat: r.no_telepon_kerabat || '',
      alamat_lengkap: r.alamat_lengkap || '',
      po_id: p ? p.id : '',
      jenis_lengan: p ? p.jenis_lengan : 'short_sleeve',
      ukuran: p ? p.ukuran : 'L',
      qty: p ? p.qty : 1,
      metode_ambil: p ? p.metode_ambil : 'ambil_langsung',
      alamat_pengiriman: p ? (p.alamat_pengiriman || '') : '',
      status_pembayaran: p ? p.status_pembayaran : 'menunggu_verifikasi',
      bukti_transfer_url: p ? (p.bukti_transfer_url || '') : ''
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/registrant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Data peserta "${editForm.nama_lengkap}" berhasil diperbarui!`);
        setEditingItem(null);
        setTimeout(() => setMessage(''), 3500);
        fetchAdminData(false);
      } else {
        alert(data.error || 'Gagal memperbarui data peserta');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  const confirmDeleteRegistrant = async () => {
    if (!deleteRegistrantId) return;
    try {
      const res = await fetch(`/api/admin/registrant?registrantId=${deleteRegistrantId.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      setDeleteRegistrantId(null);
      if (data.success) {
        setMessage(`Peserta "${deleteRegistrantId.nama}" berhasil dihapus total dari database.`);
        setTimeout(() => setMessage(''), 3500);
        fetchAdminData(false);
      } else {
        alert(data.error || 'Gagal menghapus data peserta');
      }
    } catch (err) {
      setDeleteRegistrantId(null);
      alert('Terjadi kesalahan koneksi');
    }
  };

  const confirmDeletePo = async () => {
    if (!deletePoId) return;
    try {
      const res = await fetch(`/api/admin/registrant?poId=${deletePoId.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      setDeletePoId(null);
      if (data.success) {
        setMessage(`Pesanan PO Jersey milik "${deletePoId.nama}" berhasil dihapus.`);
        setTimeout(() => setMessage(''), 3500);
        fetchAdminData(false);
      } else {
        alert(data.error || 'Gagal menghapus pesanan PO jersey');
      }
    } catch (err) {
      setDeletePoId(null);
      alert('Terjadi kesalahan koneksi');
    }
  };

  const fetchAdminData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`/api/admin/data?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const d = await res.json();
      if (showLoading) setLoading(false);
      if (d.success) {
        setRegistrantsData(d.registrants_with_po || []);
        if (d.settings) {
          setSettings(d.settings);
          setSettingsForm(d.settings);
        }
      }
      fetchAdminsList();
    } catch (err) {
      if (showLoading) setLoading(false);
    }
  };

  const fetchAdminsList = async () => {
    try {
      const res = await fetch(`/api/admin/users?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const d = await res.json();
      if (d.success) {
        setAdminsList(d.admins || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    const sessionStr = localStorage.getItem('tdgb_admin_session');
    if (!sessionStr) {
      router.push('/admin/login');
      return;
    }
    const session = JSON.parse(sessionStr);
    setAdminSession(session);
    setProfileForm({
      nama_pic: session.nama_pic || '',
      kontak_pic: session.kontak_pic || ''
    });
    fetchAdminData(true);

    const handleFocus = () => fetchAdminData(false);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [router]);

  const isSuperAdmin = adminSession?.role === 'superadmin' || adminSession?.pihak === 'superadmin';

  const handleVerify = async (poId: string, newStatus: 'lunas' | 'menunggu_verifikasi' | 'perlu_klarifikasi') => {
    const previousData = [...registrantsData];
    setRegistrantsData((prev) =>
      prev.map((item) => {
        if (item.jersey_po && item.jersey_po.id === poId) {
          return {
            ...item,
            jersey_po: {
              ...item.jersey_po,
              status_pembayaran: newStatus,
              verified_by: adminSession?.nama_pic || adminSession?.pihak || 'Admin',
              verified_at: new Date().toISOString()
            }
          };
        }
        return item;
      })
    );

    setMessage(`Status pembayaran langsung diubah menjadi "${newStatus.toUpperCase()}"!`);
    setTimeout(() => setMessage(''), 3500);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId,
          status: newStatus,
          adminId: adminSession?.nama_pic || adminSession?.pihak || 'Admin'
        })
      });
      const data = await res.json();
      if (!data.success) {
        setRegistrantsData(previousData);
        alert(data.error || 'Gagal mengubah status');
      } else {
        fetchAdminData(false);
      }
    } catch (err) {
      setRegistrantsData(previousData);
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Pengaturan pembayaran berhasil disimpan!');
        setSettings(data.settings);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Gagal menyimpan pengaturan');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSession) return;
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: adminSession.id,
          nama_pic: profileForm.nama_pic,
          kontak_pic: profileForm.kontak_pic
        })
      });
      const data = await res.json();
      if (data.success) {
        const newSession = { ...adminSession, nama_pic: profileForm.nama_pic, kontak_pic: profileForm.kontak_pic };
        localStorage.setItem('tdgb_admin_session', JSON.stringify(newSession));
        setAdminSession(newSession);
        setMessage('Profil PIC berhasil diperbarui!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Gagal memperbarui profil');
    }
  };

  const handleCreatePIC = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPic(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPicForm)
      });
      const data = await res.json();
      setCreatingPic(false);

      if (data.success) {
        setMessage(`Akun PIC "${newPicForm.nama_pic}" untuk ${newPicForm.pihak.toUpperCase()} berhasil dibuat!`);
        setTimeout(() => setMessage(''), 4000);
        setNewPicForm({
          pihak: 'rudeboys',
          nama_pic: '',
          kontak_pic: '',
          email_login: '',
          password: 'admin123'
        });
        fetchAdminsList();
      } else {
        alert(data.error || 'Gagal membuat akun PIC');
      }
    } catch (err) {
      setCreatingPic(false);
      alert('Terjadi kesalahan koneksi');
    }
  };

  const handleDeletePIC = async (id: string, namaPic: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      setDeleteConfirmId(null);
      if (data.success) {
        setMessage(`Akun PIC "${namaPic}" berhasil dihapus.`);
        setTimeout(() => setMessage(''), 3000);
        fetchAdminsList();
      } else {
        alert(data.error || 'Gagal menghapus akun');
      }
    } catch (err) {
      setDeleteConfirmId(null);
      alert('Terjadi kesalahan koneksi saat menghapus akun');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tdgb_admin_session');
    router.push('/admin/login');
  };

  if (!adminSession) return null;

  const poList = registrantsData.filter((item) => item.jersey_po);
  const filteredPoList = poList.filter((item) => {
    const matchesFilter =
      poFilterStatus === 'semua'
        ? true
        : item.jersey_po.status_pembayaran === poFilterStatus;

    const matchesSearch =
      item.registrant.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registrant.nomor_registrasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registrant.no_telepon.includes(searchTerm) ||
      (item.registrant.komunitas || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const filteredAllRegistrants = registrantsData.filter((item) => {
    return (
      item.registrant.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registrant.nomor_registrasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registrant.no_telepon.includes(searchTerm) ||
      (item.registrant.komunitas || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen pt-24 sm:pt-28 md:pt-32 pb-12 px-3 sm:px-6 lg:px-8 relative bg-brand-iceBg">
      <TopoBackground />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        <div className="bg-brand-navy text-white p-6 rounded-3xl border border-brand-yellow/40 shadow-glow flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-brand-royal text-brand-yellow flex items-center justify-center font-black text-xl border border-brand-yellow shadow-sm">
              {isSuperAdmin ? '⭐' : adminSession.pihak === 'rudeboys' ? 'R' : 'P'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-brand-yellow uppercase tracking-widest">
                  {isSuperAdmin ? 'SUPERADMIN • ADMIN UTAMA' : `ADMIN PANEL • ${adminSession.pihak.toUpperCase()}`}
                </span>
                {isSuperAdmin && (
                  <span className="bg-brand-yellow text-brand-navy text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Akses Penuh
                  </span>
                )}
              </div>
              <h1 className="text-xl font-extrabold font-display">{adminSession.nama_pic || adminSession.email_login}</h1>
              <span className="text-xs text-brand-sky">Login: {adminSession.email_login} • Kontak: {adminSession.kontak_pic || '-'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchAdminData(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center space-x-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <a
              href="/api/admin/export"
              target="_blank"
              download
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Rekap CSV</span>
            </a>
            <button
              onClick={handleLogout}
              className="bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold text-center animate-fade-in">
            {message}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-brand-sky/30 shadow-card">
          <button
            onClick={() => setActiveTab('verifikasi')}
            className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === 'verifikasi' ? 'bg-brand-navy text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-brand-yellow" />
            <span>Antrean Verifikasi PO Jersey ({poList.filter(p => p.jersey_po?.status_pembayaran === 'menunggu_verifikasi').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === 'rekap' ? 'bg-brand-navy text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-brand-sky" />
            <span>Rekap Semua Peserta ({registrantsData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === 'pengaturan' ? 'bg-brand-navy text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SettingsIcon className="w-4 h-4 text-brand-sky" />
            <span>Pengaturan Pembayaran &amp; QRIS</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('kelola_pic')}
              className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
                activeTab === 'kelola_pic'
                  ? 'bg-gradient-to-r from-brand-navy to-brand-royal text-brand-yellow shadow-md border border-brand-yellow/50'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <UserPlus className="w-4 h-4 text-brand-yellow" />
              <span>Manajemen Akun PIC</span>
              <span className="bg-brand-yellow text-brand-navy text-[9px] font-black px-1.5 py-0.5 rounded">UTAMA</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('profil')}
            className={`px-5 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 ${
              activeTab === 'profil' ? 'bg-brand-navy text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4 text-brand-yellow" />
            <span>Profil Saya</span>
          </button>
        </div>

        {activeTab === 'verifikasi' && (
          <div className="bg-white p-6 rounded-3xl border border-brand-sky/40 shadow-card space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">Antrean Verifikasi Pre-Order Jersey</h2>
                <p className="text-xs text-slate-500">
                  Verifikasi manual bukti transfer oleh Rudeboys &amp; PEADERAL. 100% donasi utuh tanpa fee platform.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'semua', label: 'Semua Status' },
                  { id: 'menunggu_verifikasi', label: 'Menunggu Verifikasi' },
                  { id: 'lunas', label: 'Lunas' },
                  { id: 'perlu_klarifikasi', label: 'Perlu Klarifikasi' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPoFilterStatus(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      poFilterStatus === tab.id
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, nomor registrasi, atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-royal"
              />
            </div>

            <div className="lg:hidden space-y-4">
              {filteredPoList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 font-medium text-xs">
                  Tidak ada antrean pesanan PO jersey yang sesuai filter.
                </div>
              ) : (
                filteredPoList.map((item) => {
                  const r = item.registrant;
                  const p = item.jersey_po;
                  const status = p.status_pembayaran;

                  return (
                    <div key={p.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2 border-b pb-2">
                        <div>
                          <span className="font-extrabold text-sm text-brand-navy block">{r.nama_lengkap}</span>
                          <button
                            onClick={() => setSelectedBibParticipant(r)}
                            className="text-[10px] text-brand-royal hover:underline font-mono inline-flex items-center space-x-1 font-bold bg-brand-royal/10 px-1.5 py-0.5 rounded border border-brand-royal/20 mt-0.5"
                            title="Klik untuk Pratinjau & Unduh BIB"
                          >
                            <span>BIB #{r.nomor_bib}</span>
                            <Download className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            status === 'lunas'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : status === 'perlu_klarifikasi'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {status === 'lunas' ? 'LUNAS' : status === 'perlu_klarifikasi' ? 'KLARIFIKASI' : 'MENUNGGU'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Komunitas &amp; WA:</span>
                          <span className="font-semibold text-slate-700 block">{r.komunitas || 'Umum'}</span>
                          <a
                            href={`https://wa.me/${r.no_telepon.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-emerald-600 hover:underline inline-flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{r.no_telepon}</span>
                          </a>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Jersey &amp; Total:</span>
                          <span className="font-bold text-slate-800 block">
                            {p.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve'} ({p.ukuran}) x{p.qty}
                          </span>
                          <span className="font-black text-brand-royal text-xs font-mono block">
                            Rp {p.harga_total.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs pt-2 border-t flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 truncate max-w-[65%]">
                          {p.metode_ambil === 'ambil_langsung' ? 'Ambil di Lokasi' : `Kirim: ${p.alamat_pengiriman || '-'}`}
                        </span>
                        {p.bukti_transfer_url ? (
                          <button
                            onClick={() => setPreviewImage(p.bukti_transfer_url)}
                            className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-royal bg-brand-royal/10 px-2.5 py-1 rounded-lg border border-brand-royal/20"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Bukti</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">No Proof</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t">
                        <div className="flex items-center space-x-1">
                          {status !== 'lunas' ? (
                            <>
                              <button
                                onClick={() => handleVerify(p.id, 'lunas')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center space-x-1 shadow-sm"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Lunas</span>
                              </button>
                              <button
                                onClick={() => handleVerify(p.id, 'perlu_klarifikasi')}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-1.5 rounded-lg text-[11px]"
                              >
                                <span>Klarifikasi</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleVerify(p.id, 'menunggu_verifikasi')}
                              className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center space-x-1 border border-rose-300"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Batal Lunas</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => downloadBibCard({
                              nomorBib: r.nomor_bib,
                              namaLengkap: r.nama_lengkap,
                              komunitas: r.komunitas,
                              nomorRegistrasi: r.nomor_registrasi,
                              jenisRegistrasi: r.jenis_registrasi
                            })}
                            className="bg-brand-navy hover:bg-brand-royal text-white font-bold px-2 py-1 rounded-lg text-[11px] flex items-center space-x-1 shadow-sm"
                            title="Unduh Gambar BIB PNG"
                          >
                            <Download className="w-3 h-3" />
                            <span>BIB</span>
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal font-bold px-2 py-1 rounded-lg text-[11px] flex items-center space-x-1 border border-brand-royal/30"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeletePoId({ id: p.id, nama: r.nama_lengkap })}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center space-x-1 border border-amber-300"
                          >
                            <Shirt className="w-3 h-3" />
                            <span>PO</span>
                          </button>
                          <button
                            onClick={() => setDeleteRegistrantId({ id: r.id, nama: r.nama_lengkap })}
                            className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center space-x-1 border border-rose-300"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="hidden lg:block">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-3 px-3">Peserta &amp; BIB</th>
                    <th className="py-3 px-3">Kontak &amp; Komunitas</th>
                    <th className="py-3 px-3">Jersey &amp; Total</th>
                    <th className="py-3 px-3 text-center">Bukti</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-center">Verifikasi</th>
                    <th className="py-3 px-3 text-center">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPoList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        Tidak ada antrean pesanan PO jersey yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPoList.map((item) => {
                      const r = item.registrant;
                      const p = item.jersey_po;
                      const status = p.status_pembayaran;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-xs text-brand-navy block">{r.nama_lengkap}</span>
                            <button
                              onClick={() => setSelectedBibParticipant(r)}
                              className="text-[10px] text-brand-royal hover:underline font-mono inline-flex items-center space-x-1 font-bold bg-brand-royal/10 px-1.5 py-0.5 rounded border border-brand-royal/20 mt-0.5"
                              title="Klik untuk Pratinjau & Unduh BIB"
                            >
                              <span>BIB #{r.nomor_bib}</span>
                              <Download className="w-2.5 h-2.5" />
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-slate-700 block text-xs">{r.komunitas || 'Umum'}</span>
                            <a
                              href={`https://wa.me/${r.no_telepon.replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-600 hover:underline inline-flex items-center space-x-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{r.no_telepon}</span>
                            </a>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-800 block text-xs">
                              {p.jenis_lengan === 'short_sleeve' ? 'Short' : 'Long'} ({p.ukuran}) x{p.qty}
                            </span>
                            <span className="font-black text-brand-royal text-xs font-mono block">
                              Rp {p.harga_total.toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {p.bukti_transfer_url ? (
                              <button
                                onClick={() => setPreviewImage(p.bukti_transfer_url)}
                                className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-royal hover:underline bg-brand-royal/10 px-2 py-1 rounded-lg"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Lihat</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Belum</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                status === 'lunas'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : status === 'perlu_klarifikasi'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {status === 'lunas' ? 'LUNAS' : status === 'perlu_klarifikasi' ? 'KLARIFIKASI' : 'MENUNGGU'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              {status !== 'lunas' ? (
                                <>
                                  <button
                                    onClick={() => handleVerify(p.id, 'lunas')}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded-lg text-[11px] flex items-center space-x-0.5 shadow-sm"
                                    title="Tandai Lunas"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Lunas</span>
                                  </button>
                                  <button
                                    onClick={() => handleVerify(p.id, 'perlu_klarifikasi')}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-1.5 py-1 rounded-lg text-[11px]"
                                    title="Perlu Klarifikasi"
                                  >
                                    <span>Klarifikasi</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleVerify(p.id, 'menunggu_verifikasi')}
                                  className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold px-2 py-1 rounded-lg text-[11px] flex items-center space-x-0.5 border border-rose-300"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Batal</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => downloadBibCard({
                                  nomorBib: r.nomor_bib,
                                  namaLengkap: r.nama_lengkap,
                                  komunitas: r.komunitas,
                                  nomorRegistrasi: r.nomor_registrasi,
                                  jenisRegistrasi: r.jenis_registrasi
                                })}
                                className="bg-brand-navy hover:bg-brand-royal text-white font-bold px-1.5 py-1 rounded-lg text-[11px] flex items-center space-x-0.5 shadow-sm"
                                title="Unduh Gambar BIB PNG"
                              >
                                <Download className="w-3 h-3" />
                                <span>BIB</span>
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                className="bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal font-bold px-2 py-1 rounded-lg text-[11px] flex items-center space-x-0.5 border border-brand-royal/30"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setDeletePoId({ id: p.id, nama: r.nama_lengkap })}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-1.5 py-1 rounded-lg text-[11px] border border-amber-300"
                                title="Hapus PO Jersey"
                              >
                                <span>Hapus PO</span>
                              </button>
                              <button
                                onClick={() => setDeleteRegistrantId({ id: r.id, nama: r.nama_lengkap })}
                                className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-1.5 py-1 rounded-lg text-[11px] border border-rose-300"
                                title="Hapus Peserta"
                              >
                                <span>Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rekap' && (
          <div className="bg-white p-6 rounded-3xl border border-brand-sky/40 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">Rekap Keseluruhan Peserta Terdaftar</h2>
                <p className="text-xs text-slate-500">
                  Seluruh data pendaftar ("Daftar Saja" maupun "Daftar + PO Jersey") untuk logistik, rute &amp; ambulans/emergency.
                </p>
              </div>

              <a
                href="/api/admin/export"
                target="_blank"
                download
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download File Rekap CSV</span>
              </a>
            </div>

            <div className="relative max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari peserta berdasarkan nama, komunitas, telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-brand-royal"
              />
            </div>

            <div className="lg:hidden space-y-4">
              {filteredAllRegistrants.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 font-medium text-xs">
                  Belum ada data pendaftar.
                </div>
              ) : (
                filteredAllRegistrants.map((item) => {
                  const r = item.registrant;
                  const p = item.jersey_po;

                  return (
                    <div key={r.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2 border-b pb-2">
                        <div>
                          <span className="font-extrabold text-sm text-brand-navy block">{r.nama_lengkap}</span>
                          <button
                            onClick={() => setSelectedBibParticipant(r)}
                            className="text-[10px] text-brand-royal hover:underline font-mono inline-flex items-center space-x-1 font-bold bg-brand-royal/10 px-1.5 py-0.5 rounded border border-brand-royal/20 mt-0.5"
                            title="Klik untuk Pratinjau & Unduh BIB"
                          >
                            <span>BIB #{r.nomor_bib}</span>
                            <Download className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        {p ? (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status_pembayaran === 'lunas'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            PO ({p.status_pembayaran})
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Daftar Saja (Gratis)</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Komunitas &amp; WA:</span>
                          <span className="font-semibold text-slate-700 block">{r.komunitas || 'Umum'}</span>
                          <a
                            href={`https://wa.me/${r.no_telepon.replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-emerald-600 hover:underline inline-flex items-center space-x-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{r.no_telepon}</span>
                          </a>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Kontak Kerabat:</span>
                          <span className="font-mono text-slate-600 text-[11px] block">{r.no_telepon_kerabat || '-'}</span>
                        </div>
                      </div>

                      <div className="text-xs pt-2 border-t">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Alamat Domisili:</span>
                        <span className="text-slate-600 text-[11px]">{r.alamat_lengkap}</span>
                      </div>

                      <div className="flex items-center justify-end space-x-1.5 pt-2 border-t">
                        <button
                          onClick={() => downloadBibCard({
                            nomorBib: r.nomor_bib,
                            namaLengkap: r.nama_lengkap,
                            komunitas: r.komunitas,
                            nomorRegistrasi: r.nomor_registrasi,
                            jenisRegistrasi: r.jenis_registrasi
                          })}
                          className="bg-brand-navy hover:bg-brand-royal text-white font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center space-x-1 shadow-sm"
                          title="Unduh Gambar BIB PNG"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh BIB</span>
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center space-x-1 border border-brand-royal/30"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit Data</span>
                        </button>
                        {p && (
                          <button
                            onClick={() => setDeletePoId({ id: p.id, nama: r.nama_lengkap })}
                            className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center space-x-1 border border-amber-300"
                          >
                            <Shirt className="w-3 h-3" />
                            <span>Hapus PO</span>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteRegistrantId({ id: r.id, nama: r.nama_lengkap })}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center space-x-1 border border-rose-300"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus Total</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="hidden lg:block">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="py-3 px-3">BIB</th>
                    <th className="py-3 px-3">Nama Lengkap</th>
                    <th className="py-3 px-3">Komunitas</th>
                    <th className="py-3 px-3">No. Telp</th>
                    <th className="py-3 px-3">Kontak Kerabat</th>
                    <th className="py-3 px-3">Alamat Domisili</th>
                    <th className="py-3 px-3 text-center">Status PO</th>
                    <th className="py-3 px-3 text-center">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAllRegistrants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                        Belum ada data pendaftar.
                      </td>
                    </tr>
                  ) : (
                    filteredAllRegistrants.map((item) => {
                      const r = item.registrant;
                      const p = item.jersey_po;

                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-500">
                            <button
                              onClick={() => setSelectedBibParticipant(r)}
                              className="text-[11px] text-brand-royal hover:underline font-mono inline-flex items-center space-x-1 font-extrabold bg-brand-royal/10 px-1.5 py-0.5 rounded border border-brand-royal/20"
                              title="Klik untuk Pratinjau & Unduh BIB"
                            >
                              <span>#{r.nomor_bib}</span>
                              <Download className="w-2.5 h-2.5" />
                            </button>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-xs text-brand-navy block">{r.nama_lengkap}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{r.nomor_registrasi}</span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">{r.komunitas || 'Umum'}</td>
                          <td className="py-3 px-3 font-mono">{r.no_telepon}</td>
                          <td className="py-3 px-3 font-mono text-slate-500">{r.no_telepon_kerabat || '-'}</td>
                          <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{r.alamat_lengkap}</td>
                          <td className="py-3 px-3 text-center">
                            {p ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status_pembayaran === 'lunas'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                PO ({p.status_pembayaran})
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Daftar Saja</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => downloadBibCard({
                                  nomorBib: r.nomor_bib,
                                  namaLengkap: r.nama_lengkap,
                                  komunitas: r.komunitas,
                                  nomorRegistrasi: r.nomor_registrasi,
                                  jenisRegistrasi: r.jenis_registrasi
                                })}
                                className="bg-brand-navy hover:bg-brand-royal text-white font-bold px-1.5 py-1 rounded-lg text-[11px] flex items-center space-x-0.5 shadow-sm"
                                title="Unduh Gambar BIB PNG"
                              >
                                <Download className="w-3 h-3" />
                                <span>BIB</span>
                              </button>
                              <button
                                onClick={() => openEditModal(item)}
                                className="bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal font-bold px-2 py-1 rounded-lg text-[11px] flex items-center space-x-0.5 border border-brand-royal/30"
                                title="Edit"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              {p && (
                                <button
                                  onClick={() => setDeletePoId({ id: p.id, nama: r.nama_lengkap })}
                                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold px-1.5 py-1 rounded-lg text-[11px] border border-amber-300"
                                  title="Hapus PO Jersey"
                                >
                                  <span>Hapus PO</span>
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteRegistrantId({ id: r.id, nama: r.nama_lengkap })}
                                className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold px-1.5 py-1 rounded-lg text-[11px] border border-rose-300"
                                title="Hapus Peserta Total"
                              >
                                <span>Hapus</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pengaturan' && (
          <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sky/40 shadow-card space-y-6">
            <h2 className="text-lg font-bold text-brand-navy border-b pb-3">
              Pengaturan QRIS Statis, Harga &amp; Rekening Bank Panitia
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Harga Jersey Short Sleeve (Rp)</label>
                <input
                  type="number"
                  required
                  value={settingsForm.harga_short_sleeve}
                  onChange={(e) => setSettingsForm({ ...settingsForm, harga_short_sleeve: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Harga Jersey Long Sleeve (Rp)</label>
                <input
                  type="number"
                  required
                  value={settingsForm.harga_long_sleeve}
                  onChange={(e) => setSettingsForm({ ...settingsForm, harga_long_sleeve: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gambar QRIS Statis URL</label>
                <input
                  type="text"
                  required
                  value={settingsForm.qris_image_url}
                  onChange={(e) => setSettingsForm({ ...settingsForm, qris_image_url: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bank Panitia</label>
                <input
                  type="text"
                  required
                  value={settingsForm.nama_bank}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nama_bank: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Rekening Bank Panitia</label>
                <input
                  type="text"
                  required
                  value={settingsForm.nomor_rekening}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nomor_rekening: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={settingsForm.nama_pemilik_rekening}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nama_pemilik_rekening: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Tutup PO Jersey</label>
                <input
                  type="text"
                  required
                  value={settingsForm.tanggal_tutup_po}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tanggal_tutup_po: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Format: YYYY-MM-DDTHH:mm:ss</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Tutup Pendaftaran Event</label>
                <input
                  type="text"
                  required
                  value={settingsForm.tanggal_tutup_pendaftaran}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tanggal_tutup_pendaftaran: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">Format: YYYY-MM-DDTHH:mm:ss</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Panitia Resmi</label>
                <input
                  type="text"
                  required
                  placeholder="6287745870767"
                  value={settingsForm.kontak_wa_panitia}
                  onChange={(e) => setSettingsForm({ ...settingsForm, kontak_wa_panitia: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Gunakan awalan 62 tanpa spasi/tanda hubung, contoh: 6287745870767 (Rangga Rudeboys)</p>
              </div>
            </div>

            <button
              type="submit"
              className="bg-brand-navy hover:bg-brand-royalDark text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center space-x-2 shadow cursor-pointer"
            >
              <Save className="w-4 h-4 text-brand-yellow" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </form>
        )}

        {activeTab === 'kelola_pic' && isSuperAdmin && (
          <div className="space-y-6">
            <form onSubmit={handleCreatePIC} className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-brand-yellow/50 shadow-card space-y-6">
              <div className="border-b pb-3">
                <div className="flex items-center space-x-2 text-brand-navy">
                  <UserPlus className="w-5 h-5 text-brand-yellow" />
                  <h2 className="text-lg font-extrabold">Buat Akun PIC Baru (Rudeboys / PEADERAL)</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin utama dapat mendaftarkan akun PIC untuk tim Rudeboys maupun PEADERAL agar memiliki akses penuh verifikasi data.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block font-bold text-slate-700 mb-2">Pilih Pihak / Organisasi PIC *</label>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                      type="button"
                      onClick={() => setNewPicForm({ ...newPicForm, pihak: 'rudeboys' })}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        newPicForm.pihak === 'rudeboys'
                          ? 'bg-brand-navy text-brand-yellow border-brand-yellow shadow-md'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Rudeboys Cyclist
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPicForm({ ...newPicForm, pihak: 'peaderal' })}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                        newPicForm.pihak === 'peaderal'
                          ? 'bg-brand-royal text-white border-brand-royal shadow-md'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      PEADERAL Indonesia
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap PIC *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ilham - PIC Rudeboys"
                      value={newPicForm.nama_pic}
                      onChange={(e) => setNewPicForm({ ...newPicForm, nama_pic: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs focus:ring-2 focus:ring-brand-royal"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. WhatsApp PIC *</label>
                    <input
                      type="text"
                      required
                      placeholder="08123456789"
                      value={newPicForm.kontak_pic}
                      onChange={(e) => setNewPicForm({ ...newPicForm, kontak_pic: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-brand-royal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email / Akun Login PIC *</label>
                    <input
                      type="text"
                      required
                      placeholder="pic.rudeboys@tourdegunungbatu.com"
                      value={newPicForm.email_login}
                      onChange={(e) => setNewPicForm({ ...newPicForm, email_login: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-royal font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kata Sandi Akun PIC *</label>
                    <input
                      type="text"
                      required
                      placeholder="admin123"
                      value={newPicForm.password}
                      onChange={(e) => setNewPicForm({ ...newPicForm, password: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-brand-royal"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingPic}
                className="bg-brand-navy hover:bg-brand-royal text-brand-yellow font-extrabold px-6 py-3 rounded-xl text-xs flex items-center space-x-2 shadow cursor-pointer border border-brand-yellow/40"
              >
                <UserPlus className="w-4 h-4 text-brand-yellow" />
                <span>{creatingPic ? 'Mendaftarkan Akun PIC...' : 'Buat & Daftarkan Akun PIC Baru'}</span>
              </button>
            </form>

            <div className="bg-white p-6 rounded-3xl border border-brand-sky/40 shadow-card space-y-4">
              <h3 className="font-extrabold text-brand-navy text-base flex items-center space-x-2 border-b pb-3">
                <Users className="w-5 h-5 text-brand-royal" />
                <span>Daftar Seluruh Akun Admin &amp; PIC Terdaftar ({adminsList.length})</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-navy text-white uppercase text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-4">Pihak</th>
                      <th className="py-3 px-4">Nama PIC</th>
                      <th className="py-3 px-4">Email / Akun Login</th>
                      <th className="py-3 px-4">No. WhatsApp</th>
                      <th className="py-3 px-4 text-center">Tingkat Akses</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminsList.map((admin) => {
                      const isSuper = admin.role === 'superadmin' || admin.pihak === 'superadmin';

                      return (
                        <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isSuper
                                  ? 'bg-brand-yellow text-brand-navy border border-amber-400'
                                  : admin.pihak === 'rudeboys'
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-brand-royal text-white'
                              }`}
                            >
                              {admin.pihak.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-800 text-sm">{admin.nama_pic}</td>
                          <td className="py-3 px-4 font-mono font-medium text-brand-royal">{admin.email_login}</td>
                          <td className="py-3 px-4 font-mono">{admin.kontak_pic || '-'}</td>
                          <td className="py-3 px-4 text-center">
                            {isSuper ? (
                              <span className="text-amber-700 font-extrabold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Superadmin (Utama)
                              </span>
                            ) : (
                              <span className="text-slate-600 font-semibold text-[11px]">
                                PIC Panitia
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isSuper ? (
                              <span className="text-slate-400 text-[10px] italic font-semibold">Permanen</span>
                            ) : deleteConfirmId === admin.id ? (
                              <div className="inline-flex items-center space-x-1 animate-fade-in">
                                <button
                                  type="button"
                                  onClick={() => handleDeletePIC(admin.id, admin.nama_pic)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm cursor-pointer"
                                >
                                  Ya, Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(admin.id)}
                                className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors inline-flex items-center space-x-1 cursor-pointer"
                                title="Hapus Akun PIC ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-semibold">Hapus</span>
                              </button>
                            )}
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

        {activeTab === 'profil' && (
          <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-sky/40 shadow-card space-y-6 max-w-xl">
            <h2 className="text-lg font-bold text-brand-navy border-b pb-3">
              Profil &amp; Kontak PIC ({adminSession.pihak.toUpperCase()})
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama PIC *</label>
                <input
                  type="text"
                  required
                  value={profileForm.nama_pic}
                  onChange={(e) => setProfileForm({ ...profileForm, nama_pic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-xs focus:ring-2 focus:ring-brand-royal"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / Kontak PIC *</label>
                <input
                  type="text"
                  required
                  value={profileForm.kontak_pic}
                  onChange={(e) => setProfileForm({ ...profileForm, kontak_pic: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 font-semibold text-xs focus:ring-2 focus:ring-brand-royal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-brand-royal hover:bg-brand-royalDark text-white font-extrabold px-6 py-3 rounded-xl text-xs flex items-center space-x-2 shadow cursor-pointer"
            >
              <Save className="w-4 h-4 text-brand-yellow" />
              <span>Perbarui Profil PIC</span>
            </button>
          </form>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm text-slate-800">Bukti Transfer Pembayaran</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-xl p-2">
              {previewImage.startsWith('http') || previewImage.startsWith('data:') ? (
                <img src={previewImage} alt="Bukti Transfer" className="max-w-full h-auto rounded-lg" />
              ) : (
                <div className="p-6 text-center text-xs text-slate-600">
                  <p className="font-bold mb-2">Tautan Bukti Transfer:</p>
                  <a href={previewImage} target="_blank" rel="noreferrer" className="text-brand-royal underline break-all">
                    {previewImage}
                  </a>
                </div>
              )}
            </div>
            <div className="text-right pt-2">
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-brand-navy">Edit Data Peserta &amp; Jersey</h3>
                <p className="text-xs text-slate-500 font-mono">BIB #{editingItem.registrant.nomor_bib} • {editingItem.registrant.nomor_registrasi}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs text-brand-navy uppercase tracking-wider">1. Informasi Peserta</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={editForm.nama_lengkap}
                      onChange={(e) => setEditForm({ ...editForm, nama_lengkap: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Komunitas / Club</label>
                    <input
                      type="text"
                      value={editForm.komunitas}
                      onChange={(e) => setEditForm({ ...editForm, komunitas: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                    <input
                      type="text"
                      required
                      value={editForm.no_telepon}
                      onChange={(e) => setEditForm({ ...editForm, no_telepon: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. Telp Kerabat (Darurat)</label>
                    <input
                      type="text"
                      value={editForm.no_telepon_kerabat}
                      onChange={(e) => setEditForm({ ...editForm, no_telepon_kerabat: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Alamat Domisili Lengkap</label>
                  <textarea
                    rows={2}
                    value={editForm.alamat_lengkap}
                    onChange={(e) => setEditForm({ ...editForm, alamat_lengkap: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {editingItem.jersey_po && (
                <div className="bg-brand-royal/5 p-4 rounded-2xl border border-brand-royal/20 space-y-3">
                  <h4 className="font-extrabold text-xs text-brand-royal uppercase tracking-wider">2. Spesifikasi PO Jersey &amp; Pembayaran</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis Lengan</label>
                      <select
                        value={editForm.jenis_lengan}
                        onChange={(e) => setEditForm({ ...editForm, jenis_lengan: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      >
                        <option value="short_sleeve">Short Sleeve</option>
                        <option value="long_sleeve">Long Sleeve</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ukuran Jersey</label>
                      <select
                        value={editForm.ukuran}
                        onChange={(e) => setEditForm({ ...editForm, ukuran: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      >
                        <option value="S">Size S</option>
                        <option value="M">Size M</option>
                        <option value="L">Size L</option>
                        <option value="XL">Size XL</option>
                        <option value="XXL">Size XXL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jumlah (Qty)</label>
                      <input
                        type="number"
                        min={1}
                        value={editForm.qty}
                        onChange={(e) => setEditForm({ ...editForm, qty: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Metode Pengambilan</label>
                      <select
                        value={editForm.metode_ambil}
                        onChange={(e) => setEditForm({ ...editForm, metode_ambil: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      >
                        <option value="ambil_langsung">Ambil Langsung di Lokasi Event</option>
                        <option value="dikirim">Dikirim ke Alamat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status Pembayaran</label>
                      <select
                        value={editForm.status_pembayaran}
                        onChange={(e) => setEditForm({ ...editForm, status_pembayaran: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      >
                        <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                        <option value="lunas">Lunas (Sudah Verifikasi)</option>
                        <option value="perlu_klarifikasi">Perlu Klarifikasi</option>
                        <option value="kedaluwarsa">Kedaluwarsa</option>
                      </select>
                    </div>
                  </div>

                  {editForm.metode_ambil === 'dikirim' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-xs">Alamat Pengiriman Jersey</label>
                      <textarea
                        rows={2}
                        value={editForm.alamat_pengiriman}
                        onChange={(e) => setEditForm({ ...editForm, alamat_pengiriman: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-xs">URL / Link Bukti Transfer</label>
                    <input
                      type="text"
                      value={editForm.bukti_transfer_url}
                      onChange={(e) => setEditForm({ ...editForm, bukti_transfer_url: e.target.value })}
                      placeholder="https://... atau data:image/..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-royal hover:bg-brand-royalDark text-white text-xs font-extrabold shadow flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4 text-brand-yellow" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteRegistrantId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">Hapus Peserta Total?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data peserta <strong className="text-slate-800">"{deleteRegistrantId.nama}"</strong> secara permanen dari database?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteRegistrantId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 w-1/2"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteRegistrant}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow w-1/2"
              >
                Ya, Hapus Total
              </button>
            </div>
          </div>
        </div>
      )}

      {deletePoId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Shirt className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">Hapus Pesanan PO Jersey?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hapus pesanan jersey milik <strong className="text-slate-800">"{deletePoId.nama}"</strong>? Status peserta ini akan tetap terdaftar sebagai <strong className="text-brand-royal">"Daftar Saja (Gratis)"</strong>.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeletePoId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 w-1/2"
              >
                Batal
              </button>
              <button
                onClick={confirmDeletePo}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow w-1/2"
              >
                Ya, Hapus PO
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBibParticipant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedBibParticipant(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center pt-2">
              <h3 className="font-black text-xl text-brand-navy">Kartu Digital BIB Peserta</h3>
              <p className="text-xs text-slate-500">Pratinjau &amp; Unduh Gambar BIB Resmi</p>
            </div>
            <BibCard
              nomorBib={selectedBibParticipant.nomor_bib}
              namaLengkap={selectedBibParticipant.nama_lengkap}
              komunitas={selectedBibParticipant.komunitas}
              nomorRegistrasi={selectedBibParticipant.nomor_registrasi}
              jenisRegistrasi={selectedBibParticipant.jenis_registrasi}
            />
          </div>
        </div>
      )}
    </div>
  );
}
