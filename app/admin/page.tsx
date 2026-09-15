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
  AlertCircle,
  Upload,
  Baby,
  Image as ImageIcon,
  Clock,
  Truck,
  Bike,
  CheckSquare,
  PackageCheck,
  Layers,
  Factory,
  Copy,
  Check,
  Filter
} from 'lucide-react';
import { compressImage, estimateDataUrlSize } from '@/lib/imageCompression';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'checkin' | 'logistik' | 'verifikasi' | 'batch_produksi' | 'rekap' | 'pengaturan' | 'profil' | 'kelola_pic'>('checkin');

  const [loading, setLoading] = useState(true);
  const [registrantsData, setRegistrantsData] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [adminsList, setAdminsList] = useState<any[]>([]);

  // Batch Produksi State
  const [selectedBatchView, setSelectedBatchView] = useState<'batch_1' | 'unbatched'>('batch_1');
  const [poFilterBatch, setPoFilterBatch] = useState<'semua' | 'batch_1' | 'unbatched'>('semua');
  const [batchCopyFeedback, setBatchCopyFeedback] = useState<string | null>(null);
  const [assigningBatch, setAssigningBatch] = useState(false);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');

  // Check-In Hari H State
  const [checkInSearch, setCheckInSearch] = useState('');
  const [checkInFilter, setCheckInFilter] = useState<'semua' | 'belum' | 'sudah' | 'on_site' | 'daftar_saja'>('semua');

  // Logistics Shipping State
  const [shippingSearch, setShippingSearch] = useState('');
  const [shippingFilter, setShippingFilter] = useState<'semua' | 'belum_kirim' | 'sudah_kirim'>('semua');
  const [editingResiId, setEditingResiId] = useState<string | null>(null);
  const [tempResiValue, setTempResiValue] = useState('');

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
  const [compressingProof, setCompressingProof] = useState(false);
  const [proofCompressInfo, setProofCompressInfo] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    registrantId: '',
    nama_lengkap: '',
    komunitas: '',
    no_telepon: '',
    no_telepon_kerabat: '',
    alamat_lengkap: '',
    po_id: '',
    kategori_ukuran: 'dewasa' as 'dewasa' | 'anak',
    jenis_lengan: 'short_sleeve' as 'short_sleeve' | 'long_sleeve',
    ukuran: 'L' as string,
    qty: 1,
    metode_ambil: 'ambil_langsung' as 'ambil_langsung' | 'dikirim',
    alamat_pengiriman: '',
    status_pembayaran: 'menunggu_verifikasi' as 'menunggu_verifikasi' | 'lunas' | 'perlu_klarifikasi' | 'kedaluwarsa',
    bukti_transfer_url: '',
    batch_produksi: null as number | null
  });

  const [deleteRegistrantId, setDeleteRegistrantId] = useState<{ id: string; nama: string } | null>(null);
  const [deletePoId, setDeletePoId] = useState<{ id: string; nama: string } | null>(null);
  const [selectedBibParticipant, setSelectedBibParticipant] = useState<any>(null);

  // Quick Upload Proof Modal State
  const [quickUploadItem, setQuickUploadItem] = useState<any | null>(null);
  const [quickUploadProof, setQuickUploadProof] = useState<string>('');
  const [quickUploadStatus, setQuickUploadStatus] = useState<'menunggu_verifikasi' | 'lunas'>('lunas');
  const [quickCompressInfo, setQuickCompressInfo] = useState<string | null>(null);
  const [quickCompressing, setQuickCompressing] = useState(false);
  const [quickSaving, setQuickSaving] = useState(false);

  const handleAdminProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar bukti transfer (JPG/PNG/WebP).');
      return;
    }

    setCompressingProof(true);
    try {
      const origSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      const compressed = await compressImage(file, { maxDimension: 1600, quality: 0.75 });
      const compSize = estimateDataUrlSize(compressed);

      setEditForm(prev => ({
        ...prev,
        bukti_transfer_url: compressed
      }));
      setProofCompressInfo(`Terkompresi otomatis: ${origSize} → ${compSize}`);
    } catch (err) {
      console.error('Failed compressing proof:', err);
      alert('Gagal mengompresi gambar bukti transfer.');
    } finally {
      setCompressingProof(false);
    }
  };

  const handleQuickFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar bukti transfer (JPG/PNG/WebP).');
      return;
    }

    setQuickCompressing(true);
    try {
      const origSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      const compressed = await compressImage(file, { maxDimension: 1600, quality: 0.75 });
      const compSize = estimateDataUrlSize(compressed);

      setQuickUploadProof(compressed);
      setQuickCompressInfo(`Foto terkompresi otomatis: ${origSize} → ${compSize}`);
    } catch (err) {
      console.error('Failed compressing proof:', err);
      alert('Gagal mengompresi gambar bukti transfer.');
    } finally {
      setQuickCompressing(false);
    }
  };

  const handleSaveQuickUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUploadItem || !quickUploadProof) {
      alert('Mohon pilih foto bukti transfer terlebih dahulu.');
      return;
    }
    setQuickSaving(true);
    try {
      const r = quickUploadItem.registrant;
      const p = quickUploadItem.jersey_po;

      const res = await fetch('/api/admin/registrant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrantId: r.id,
          poId: p.id,
          bukti_transfer_url: quickUploadProof,
          status_pembayaran: quickUploadStatus,
          verified_by: quickUploadStatus === 'lunas' ? (adminSession?.nama_pic || 'Admin') : undefined
        })
      });
      const d = await res.json();
      if (d.success) {
        setMessage(`Bukti transfer untuk ${r.nama_lengkap} berhasil disimpan! (${quickUploadStatus === 'lunas' ? 'LUNAS' : 'Menunggu Verifikasi'})`);
        setQuickUploadItem(null);
        setQuickUploadProof('');
        setQuickCompressInfo(null);
        fetchAdminData(false);
      } else {
        alert(d.error || 'Gagal menyimpan bukti transfer');
      }
    } catch (err) {
      console.error('Error uploading proof:', err);
      alert('Terjadi kesalahan koneksi jaringan.');
    } finally {
      setQuickSaving(false);
    }
  };

  const openEditModal = (item: any) => {
    const r = item.registrant;
    const p = item.jersey_po;
    setEditingItem(item);
    setProofCompressInfo(null);
    setEditForm({
      registrantId: r.id,
      nama_lengkap: r.nama_lengkap || '',
      komunitas: r.komunitas || '',
      no_telepon: r.no_telepon || '',
      no_telepon_kerabat: r.no_telepon_kerabat || '',
      alamat_lengkap: r.alamat_lengkap || '',
      po_id: p ? p.id : '',
      kategori_ukuran: p?.kategori_ukuran || 'dewasa',
      jenis_lengan: p ? p.jenis_lengan : 'short_sleeve',
      ukuran: p ? p.ukuran : 'L',
      qty: p ? p.qty : 1,
      metode_ambil: p ? p.metode_ambil : 'ambil_langsung',
      alamat_pengiriman: p ? (p.alamat_pengiriman || '') : '',
      status_pembayaran: p ? p.status_pembayaran : 'menunggu_verifikasi',
      bukti_transfer_url: p ? (p.bukti_transfer_url || '') : '',
      batch_produksi: p ? (p.batch_produksi !== undefined ? p.batch_produksi : (r.nomor_bib <= 1184 ? 1 : null)) : null
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

  const handleToggleCheckIn = async (registrantId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const picName = adminSession?.nama_pic || adminSession?.email_login || 'Panitia';
    const previousData = [...registrantsData];

    // Optimistic UI: Instant response in 0.001s
    setRegistrantsData((prev) =>
      prev.map((item) => {
        if (item.registrant.id === registrantId) {
          return {
            ...item,
            registrant: {
              ...item.registrant,
              is_checked_in: newStatus,
              checked_in_at: newStatus ? new Date().toISOString() : null,
              checked_in_by: newStatus ? picName : null
            }
          };
        }
        return item;
      })
    );

    setMessage(newStatus ? '✓ Peserta berhasil di-check-in / diserahkan!' : 'Status check-in peserta dibatalkan.');
    setTimeout(() => setMessage(''), 3000);

    try {
      const res = await fetch('/api/admin/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrantId,
          isCheckedIn: newStatus,
          checkedInBy: picName
        })
      });
      const data = await res.json();
      if (!data.success) {
        setRegistrantsData(previousData);
        alert(data.error || 'Gagal mengubah status check-in');
      }
    } catch (err) {
      setRegistrantsData(previousData);
      alert('Gagal mengubah status check-in karena masalah koneksi.');
    }
  };

  const handleToggleShipping = async (poId: string, currentStatus: boolean, customResi?: string) => {
    const newStatus = !currentStatus;
    const picName = adminSession?.nama_pic || adminSession?.email_login || 'Panitia Logistik';
    const previousData = [...registrantsData];

    // Optimistic UI
    setRegistrantsData((prev) =>
      prev.map((item) => {
        if (item.jersey_po && item.jersey_po.id === poId) {
          return {
            ...item,
            jersey_po: {
              ...item.jersey_po,
              is_shipped: newStatus,
              shipped_at: newStatus ? new Date().toISOString() : null,
              shipped_by: newStatus ? picName : null,
              no_resi: customResi !== undefined ? customResi : item.jersey_po.no_resi
            }
          };
        }
        return item;
      })
    );

    setMessage(newStatus ? '✓ Paket jersey ditandai SUDAH DIKIRIM!' : 'Status pengiriman jersey dibatalkan.');
    setTimeout(() => setMessage(''), 3000);

    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId,
          isShipped: newStatus,
          shippedBy: picName,
          noResi: customResi
        })
      });
      const data = await res.json();
      if (!data.success) {
        setRegistrantsData(previousData);
        alert(data.error || 'Gagal memperbarui status pengiriman');
      }
    } catch (err) {
      setRegistrantsData(previousData);
      alert('Gagal memperbarui status pengiriman.');
    }
  };

  const handleSaveResi = async (poId: string) => {
    const picName = adminSession?.nama_pic || adminSession?.email_login || 'Panitia Logistik';
    const resiVal = tempResiValue.trim();
    setEditingResiId(null);
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poId,
          isShipped: true,
          shippedBy: picName,
          noResi: resiVal
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✓ Nomor resi pengiriman berhasil disimpan!');
        setTimeout(() => setMessage(''), 3000);
        fetchAdminData(false);
      }
    } catch (err) {
      alert('Gagal menyimpan nomor resi.');
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

  // Metrics for Dashboard & Tabs
  const totalPeserta = registrantsData.length;
  const checkedInCount = registrantsData.filter((i) => i.registrant?.is_checked_in).length;
  const notCheckedInCount = totalPeserta - checkedInCount;

  const jerseyOnSiteList = registrantsData.filter((i) => i.jersey_po && i.jersey_po.metode_ambil === 'ambil_langsung');
  const jerseyOnSiteTotal = jerseyOnSiteList.length;
  const jerseyOnSiteTaken = jerseyOnSiteList.filter((i) => i.registrant?.is_checked_in).length;
  const jerseyOnSiteRemaining = jerseyOnSiteTotal - jerseyOnSiteTaken;

  const shippingList = registrantsData.filter((i) => i.jersey_po && i.jersey_po.metode_ambil === 'dikirim');
  const totalShipping = shippingList.length;
  const totalShipped = shippingList.filter((i) => i.jersey_po?.is_shipped).length;
  const totalNotShipped = totalShipping - totalShipped;

  // Filtered check-in items (Live 0.001s in-memory search)
  const filteredCheckInList = registrantsData.filter((item) => {
    const r = item.registrant;
    const p = item.jersey_po;
    if (!r) return false;

    if (checkInFilter === 'belum' && r.is_checked_in) return false;
    if (checkInFilter === 'sudah' && !r.is_checked_in) return false;
    if (checkInFilter === 'on_site' && (!p || p.metode_ambil !== 'ambil_langsung')) return false;
    if (checkInFilter === 'daftar_saja' && p) return false;

    if (!checkInSearch.trim()) return true;
    const q = checkInSearch.toLowerCase().trim();
    const bibStr = (r.nomor_bib || '').toString();
    const nameStr = (r.nama_lengkap || '').toLowerCase();
    const phoneStr = (r.no_telepon || '').toLowerCase();
    const commStr = (r.komunitas || '').toLowerCase();
    const regNumStr = (r.nomor_registrasi || '').toLowerCase();

    return bibStr.includes(q) || nameStr.includes(q) || phoneStr.includes(q) || commStr.includes(q) || regNumStr.includes(q);
  });

  // Filtered shipping list
  const filteredShippingList = shippingList.filter((item) => {
    const r = item.registrant;
    const p = item.jersey_po;
    if (!p) return false;

    if (shippingFilter === 'belum_kirim' && p.is_shipped) return false;
    if (shippingFilter === 'sudah_kirim' && !p.is_shipped) return false;

    if (!shippingSearch.trim()) return true;
    const q = shippingSearch.toLowerCase().trim();
    const bibStr = (r?.nomor_bib || '').toString();
    const nameStr = (r?.nama_lengkap || '').toLowerCase();
    const phoneStr = (r?.no_telepon || '').toLowerCase();
    const addrStr = (p.alamat_pengiriman || r?.alamat_lengkap || '').toLowerCase();
    const resiStr = (p.no_resi || '').toLowerCase();

    return bibStr.includes(q) || nameStr.includes(q) || phoneStr.includes(q) || addrStr.includes(q) || resiStr.includes(q);
  });

  const poList = registrantsData.filter((item) => item.jersey_po);

  // Batch Calculations
  const computeBatchSummary = (items: any[]) => {
    let totalQty = 0;
    let shortQty = 0;
    let longQty = 0;
    let lunasQty = 0;
    let unpaidQty = 0;

    const dewasaSizes: { [key: string]: { short: number; long: number; total: number } } = {
      '2XS': { short: 0, long: 0, total: 0 },
      'XS': { short: 0, long: 0, total: 0 },
      'S': { short: 0, long: 0, total: 0 },
      'M': { short: 0, long: 0, total: 0 },
      'L': { short: 0, long: 0, total: 0 },
      'XL': { short: 0, long: 0, total: 0 },
      'XXL': { short: 0, long: 0, total: 0 },
      '3XL': { short: 0, long: 0, total: 0 },
      '4XL': { short: 0, long: 0, total: 0 },
      '5XL': { short: 0, long: 0, total: 0 }
    };

    const anakSizes: { [key: string]: { short: number; long: number; total: number } } = {
      'Kids 2XS': { short: 0, long: 0, total: 0 },
      'Kids XS': { short: 0, long: 0, total: 0 },
      'Kids S': { short: 0, long: 0, total: 0 },
      'Kids M': { short: 0, long: 0, total: 0 },
      'Kids L': { short: 0, long: 0, total: 0 },
      'Kids XL': { short: 0, long: 0, total: 0 },
      'Kids 2XL': { short: 0, long: 0, total: 0 }
    };

    items.forEach((item) => {
      const p = item.jersey_po;
      if (!p) return;
      const qty = p.qty || 1;
      totalQty += qty;

      if (p.jenis_lengan === 'short_sleeve') shortQty += qty;
      else longQty += qty;

      if (p.status_pembayaran === 'lunas') lunasQty += qty;
      else unpaidQty += qty;

      const isAnak = p.kategori_ukuran === 'anak' || (typeof p.ukuran === 'string' && (p.ukuran.startsWith('Kids') || p.ukuran.startsWith('kids')));
      const targetMap = isAnak ? anakSizes : dewasaSizes;
      let rawSize = (p.ukuran || 'L').toString();
      if (isAnak && !rawSize.startsWith('Kids ') && !rawSize.startsWith('Kids')) {
        rawSize = `Kids ${rawSize}`;
      }

      if (!targetMap[rawSize]) {
        targetMap[rawSize] = { short: 0, long: 0, total: 0 };
      }

      if (p.jenis_lengan === 'short_sleeve') {
        targetMap[rawSize].short += qty;
      } else {
        targetMap[rawSize].long += qty;
      }
      targetMap[rawSize].total += qty;
    });

    return {
      totalQty,
      shortQty,
      longQty,
      lunasQty,
      unpaidQty,
      dewasaSizes,
      anakSizes,
      totalCount: items.length
    };
  };

  const batch1List = poList.filter((item) => item.jersey_po?.batch_produksi === 1);
  const unbatchedList = poList.filter((item) => !item.jersey_po?.batch_produksi);
  const batch1Summary = computeBatchSummary(batch1List);
  const unbatchedSummary = computeBatchSummary(unbatchedList);

  const handleCopyVendorSummary = (isBatch1: boolean) => {
    const summary = isBatch1 ? batch1Summary : unbatchedSummary;
    const title = isBatch1 ? 'REKAP ORDER PRODUKSI JERSEY - BATCH 1' : 'REKAP ORDER PRODUKSI JERSEY - UNBATCHED (SIAP BATCH 2)';
    const note = isBatch1
      ? 'Cut-off: Data awal s/d Peserta Hanifsyah Aditya (BIB #1184)'
      : 'Data Pesanan Baru (Nomor BIB > 1184)';

    let text = `*${title}*\n*TOUR DE GUNUNG BATU 2026*\n_${note}_\n\n`;
    text += `*RINGKASAN TOTAL:* ${summary.totalQty} pcs (${summary.totalCount} pendaftar)\n`;
    text += `- Lengan Pendek (Short Sleeve): ${summary.shortQty} pcs\n`;
    text += `- Lengan Panjang (Long Sleeve): ${summary.longQty} pcs\n`;
    text += `- Status Lunas: ${summary.lunasQty} pcs | Belum Lunas: ${summary.unpaidQty} pcs\n\n`;

    text += `*BREAKDOWN UKURAN DEWASA:*\n`;
    Object.entries(summary.dewasaSizes).forEach(([size, data]) => {
      if (data.total > 0) {
        text += `• Size ${size}: ${data.total} pcs (Short: ${data.short} | Long: ${data.long})\n`;
      }
    });

    const hasAnak = Object.values(summary.anakSizes).some(d => d.total > 0);
    if (hasAnak) {
      text += `\n*BREAKDOWN UKURAN ANAK-ANAK (KIDS):*\n`;
      Object.entries(summary.anakSizes).forEach(([size, data]) => {
        if (data.total > 0) {
          text += `• ${size}: ${data.total} pcs (Short: ${data.short} | Long: ${data.long})\n`;
        }
      });
    }

    text += `\n_Generated via Sistem Panitia Tour De Gunung Batu 2026_`;

    navigator.clipboard.writeText(text);
    setBatchCopyFeedback(isBatch1 ? 'batch1' : 'unbatched');
    setTimeout(() => setBatchCopyFeedback(null), 3000);
  };

  const handleUpdateBatch = async (poId: string, registrantId: string, batchNumber: number | null) => {
    try {
      const res = await fetch('/api/admin/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poId, registrantId, batchNumber })
      });
      const d = await res.json();
      if (d.success) {
        setMessage(d.message || 'Status batch jersey berhasil diubah');
        setTimeout(() => setMessage(''), 3000);
        fetchAdminData(false);
      } else {
        alert(d.error || 'Gagal mengubah status batch');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleAssignUnbatchedToBatch2 = async () => {
    if (unbatchedList.length === 0) {
      alert('Tidak ada pesanan yang belum masuk batch saat ini.');
      return;
    }
    const conf = window.confirm(`Apakah Anda yakin ingin memasukkan ${unbatchedList.length} pesanan PO jersey ini ke Batch 2? Data Batch 1 tidak akan berubah.`);
    if (!conf) return;

    setAssigningBatch(true);
    try {
      const res = await fetch('/api/admin/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign_unbatched', batchNumber: 2 })
      });
      const d = await res.json();
      if (d.success) {
        setMessage(d.message);
        setTimeout(() => setMessage(''), 4000);
        fetchAdminData(false);
      } else {
        alert(d.error || 'Gagal memasukkan ke Batch 2');
      }
    } catch (e) {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setAssigningBatch(false);
    }
  };

  const filteredPoList = poList.filter((item) => {
    const matchesStatus =
      poFilterStatus === 'semua'
        ? true
        : item.jersey_po.status_pembayaran === poFilterStatus;

    const matchesBatch =
      poFilterBatch === 'semua'
        ? true
        : poFilterBatch === 'batch_1'
        ? item.jersey_po.batch_produksi === 1
        : !item.jersey_po.batch_produksi;

    const matchesSearch =
      item.registrant.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registrant.nomor_registrasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.registrant.no_telepon.includes(searchTerm) ||
      (item.registrant.komunitas || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesBatch && matchesSearch;
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
    <div className="min-h-screen pt-20 sm:pt-24 md:pt-28 pb-12 px-3 sm:px-6 lg:px-8 relative bg-slate-900/5 overflow-x-hidden font-sans">
      <TopoBackground />

      <div className="max-w-7xl mx-auto relative z-10 space-y-5">
        {/* Top Header Bar (Clean & Professional) */}
        <div className="bg-brand-navy/95 backdrop-blur-xl text-white px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-royal to-blue-700 text-brand-yellow flex items-center justify-center font-black text-lg border border-brand-yellow/40 shadow-sm">
              {isSuperAdmin ? '⭐' : adminSession.pihak === 'rudeboys' ? 'R' : 'P'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight truncate">{adminSession.nama_pic || adminSession.email_login}</h1>
                <span className="bg-brand-yellow/20 text-brand-yellow text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-brand-yellow/30">
                  {isSuperAdmin ? 'Superadmin' : 'Panitia'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">{adminSession.email_login}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => fetchAdminData(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 flex items-center space-x-1.5 transition-all"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a
              href="/api/admin/export"
              target="_blank"
              download
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-bold border border-rose-400/30 flex items-center space-x-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold text-center animate-fade-in shadow-sm">
            {message}
          </div>
        )}

        {/* Segmented Navigation Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm [-webkit-overflow-scrolling:touch]">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'checkin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Meja Check-In</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === 'checkin' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
              {checkedInCount}/{totalPeserta}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logistik')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'logistik'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Kirim Jersey</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === 'logistik' ? 'bg-white/20 text-brand-yellow' : 'bg-slate-200 text-slate-700'}`}>
              {totalShipped}/{totalShipping}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('verifikasi')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'verifikasi'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verifikasi PO</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === 'verifikasi' ? 'bg-white/20 text-brand-yellow' : 'bg-slate-200 text-slate-700'}`}>
              {poList.filter(p => p.jersey_po?.status_pembayaran === 'menunggu_verifikasi').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('batch_produksi')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'batch_produksi'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shirt className="w-4 h-4" />
            <span>Batch Vendor</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === 'batch_produksi' ? 'bg-amber-800 text-amber-100' : 'bg-amber-100 text-amber-800'}`}>
              B1 ({batch1List.length}) {unbatchedList.length > 0 ? `| +${unbatchedList.length}` : ''}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rekap')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'rekap'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Semua Peserta</span>
          </button>

          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'pengaturan'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('kelola_pic')}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'kelola_pic'
                  ? 'bg-brand-royal text-brand-yellow shadow-md'
                  : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <UserPlus className="w-4 h-4 text-brand-yellow" />
              <span>Akun PIC</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('profil')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'profil'
                ? 'bg-brand-navy text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MEJA REGISTRASI HARI H (SPEED CHECK-IN) */}
        {/* ======================================================== */}
        {activeTab === 'checkin' && (
          <div className="space-y-4">
            {/* Minimalist Live Stat Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total Peserta</span>
                  <div className="text-xl font-black text-slate-800 font-mono">{totalPeserta}</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-sm flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-100 uppercase">Sudah Hadir</span>
                  <div className="text-xl font-black text-white font-mono">
                    {checkedInCount} <span className="text-xs font-normal opacity-80">({totalPeserta > 0 ? ((checkedInCount / totalPeserta) * 100).toFixed(0) : 0}%)</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Belum Hadir</span>
                  <div className="text-xl font-black text-rose-600 font-mono">{notCheckedInCount}</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Jersey Lokasi</span>
                  <div className="text-xl font-black text-amber-700 font-mono">
                    {jerseyOnSiteTaken} <span className="text-xs text-slate-400 font-normal">/ {jerseyOnSiteTotal}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Search Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik No. BIB (misal: 1001), Nama Peserta, atau Komunitas..."
                  value={checkInSearch}
                  onChange={(e) => setCheckInSearch(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-slate-50/50"
                />
                {checkInSearch && (
                  <button
                    onClick={() => setCheckInSearch('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Fast Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs font-bold">
                {[
                  { id: 'semua', label: `Semua (${registrantsData.length})` },
                  { id: 'belum', label: `Belum Hadir (${notCheckedInCount})` },
                  { id: 'sudah', label: `Sudah Hadir (${checkedInCount})` },
                  { id: 'on_site', label: `Ambil Jersey (${jerseyOnSiteTotal})` },
                  { id: 'daftar_saja', label: `Hanya BIB (${registrantsData.filter(i => !i.jersey_po).length})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCheckInFilter(f.id as any)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg transition-all ${
                      checkInFilter === f.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Clean Check-in Cards List */}
              <div className="space-y-2.5 pt-2">
                {filteredCheckInList.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <p className="text-xs font-bold">Tidak ada peserta yang cocok dengan pencarian.</p>
                  </div>
                ) : (
                  filteredCheckInList.map((item) => {
                    const r = item.registrant;
                    const p = item.jersey_po;
                    const isChecked = Boolean(r.is_checked_in);
                    const isJerseyOnSite = p && p.metode_ambil === 'ambil_langsung';
                    const isJerseyShipped = p && p.metode_ambil === 'dikirim';

                    return (
                      <div
                        key={r.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isChecked
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        {/* Info Block */}
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center font-mono border ${
                            isChecked
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-slate-900 text-brand-yellow border-slate-800'
                          }`}>
                            <span className="text-[9px] font-bold uppercase opacity-75">BIB</span>
                            <span className="text-base font-black leading-none mt-0.5">#{r.nomor_bib}</span>
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">{r.nama_lengkap}</h3>
                              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                                {r.komunitas || 'Umum'}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {!p ? (
                                <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                  🏷️ Hanya Nomor BIB
                                </span>
                              ) : isJerseyOnSite ? (
                                <span className="inline-flex items-center text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                                  🎁 BIB + Jersey {p.kategori_ukuran === 'anak' ? 'Anak' : ''} ({p.ukuran}, {p.jenis_lengan === 'short_sleeve' ? 'Pendek' : 'Panjang'})
                                </span>
                              ) : isJerseyShipped ? (
                                <span className="inline-flex items-center text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                  📦 Jersey Dikirim ke Alamat
                                </span>
                              ) : null}

                              <span className="text-[11px] text-slate-400 font-mono">📞 {r.no_telepon}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Block */}
                        <div className="shrink-0 flex items-center justify-end space-x-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {isChecked ? (
                            <div className="flex items-center space-x-2">
                              <div className="text-right">
                                <span className="inline-flex items-center space-x-1 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Sudah Diambil</span>
                                </span>
                                {r.checked_in_at && (
                                  <span className="block text-[10px] text-slate-400 mt-0.5">
                                    {new Date(r.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB • {r.checked_in_by || 'Panitia'}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleToggleCheckIn(r.id, true)}
                                className="text-slate-400 hover:text-rose-600 text-xs font-bold p-1"
                                title="Batal check-in"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleToggleCheckIn(r.id, false)}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-200" />
                              <span>Check-In</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: LOGISTIK PENGIRIMAN JERSEY */}
        {/* ======================================================== */}
        {activeTab === 'logistik' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Paket Dikirim</span>
                <div className="text-xl font-black text-slate-900 font-mono mt-0.5">{totalShipping}</div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">Sudah Terkirim</span>
                <div className="text-xl font-black text-emerald-800 font-mono mt-0.5">{totalShipped}</div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm">
                <span className="text-[11px] font-bold text-amber-700 uppercase">Menunggu Pengiriman</span>
                <div className="text-xl font-black text-amber-800 font-mono mt-0.5">{totalNotShipped}</div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari penerima, no. telp, alamat, no. resi..."
                    value={shippingSearch}
                    onChange={(e) => setShippingSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-navy"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {[
                    { id: 'semua', label: `Semua (${shippingList.length})` },
                    { id: 'belum_kirim', label: `Belum Kirim (${totalNotShipped})` },
                    { id: 'sudah_kirim', label: `Sudah Kirim (${totalShipped})` }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setShippingFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        shippingFilter === f.id
                          ? 'bg-brand-navy text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shipping List Cards */}
              <div className="space-y-2.5 pt-1">
                {filteredShippingList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-bold">
                    Tidak ada paket yang cocok dengan filter.
                  </div>
                ) : (
                  filteredShippingList.map((item) => {
                    const r = item.registrant;
                    const p = item.jersey_po;
                    const isShipped = Boolean(p.is_shipped);

                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          isShipped ? 'bg-slate-50 border-slate-200' : 'bg-white border-amber-200 shadow-sm'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-black bg-brand-navy text-brand-yellow px-2 py-0.5 rounded">
                              BIB #{r?.nomor_bib || '-'}
                            </span>
                            <h3 className="font-black text-sm text-slate-900">{r?.nama_lengkap}</h3>
                            <a
                              href={`https://wa.me/${r?.no_telepon?.replace(/^0/, '62')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-emerald-600 hover:underline inline-flex items-center space-x-0.5"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{r?.no_telepon}</span>
                            </a>
                          </div>

                          <p className="text-xs text-slate-600">
                            📍 <strong>Alamat:</strong> {p.alamat_pengiriman || r?.alamat_lengkap || '-'}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              👕 {p.ukuran} ({p.jenis_lengan === 'short_sleeve' ? 'Pendek' : 'Panjang'}) x{p.qty}
                            </span>

                            {editingResiId === p.id ? (
                              <div className="inline-flex items-center space-x-1">
                                <input
                                  type="text"
                                  placeholder="No. Resi..."
                                  value={tempResiValue}
                                  onChange={(e) => setTempResiValue(e.target.value)}
                                  className="px-2 py-0.5 text-xs border rounded font-mono"
                                />
                                <button
                                  onClick={() => handleSaveResi(p.id)}
                                  className="bg-brand-navy text-white text-[11px] px-2 py-0.5 rounded font-bold"
                                >
                                  Simpan
                                </button>
                                <button
                                  onClick={() => setEditingResiId(null)}
                                  className="text-slate-400 text-[11px]"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500">
                                Resi: <strong className="font-mono text-slate-800">{p.no_resi || '-'}</strong>
                                <button
                                  onClick={() => {
                                    setEditingResiId(p.id);
                                    setTempResiValue(p.no_resi || '');
                                  }}
                                  className="text-brand-royal hover:underline font-bold ml-1.5 text-[10px]"
                                >
                                  {p.no_resi ? 'Edit' : '+ Input'}
                                </button>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right Toggle */}
                        <div className="shrink-0 flex items-center justify-end">
                          {isShipped ? (
                            <button
                              onClick={() => handleToggleShipping(p.id, true)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-rose-100 text-emerald-800 hover:text-rose-800 font-black text-xs border border-emerald-300 transition-all flex items-center space-x-1"
                              title="Batalkan status terkirim"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Sudah Dikirim</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleShipping(p.id, false)}
                              className="px-3.5 py-2 rounded-xl bg-brand-navy hover:bg-brand-royal text-white font-black text-xs shadow-sm transition-all flex items-center space-x-1.5"
                            >
                              <Truck className="w-3.5 h-3.5 text-brand-yellow" />
                              <span>Tandai Terkirim</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verifikasi' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-sky/40 shadow-card space-y-5 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">Antrean Verifikasi Pre-Order Jersey</h2>
                <p className="text-xs text-slate-500">
                  Verifikasi manual bukti transfer oleh Rudeboys &amp; PEADERAL. 100% donasi utuh tanpa fee platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
                {/* Status Filter */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5">
                  {[
                    { id: 'semua', label: 'Semua Status' },
                    { id: 'menunggu_verifikasi', label: 'Menunggu' },
                    { id: 'lunas', label: 'Lunas' },
                    { id: 'perlu_klarifikasi', label: 'Klarifikasi' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPoFilterStatus(tab.id)}
                      className={`min-h-9 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        poFilterStatus === tab.id
                          ? 'bg-brand-navy text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Batch Filter */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'semua', label: 'Semua Batch' },
                    { id: 'batch_1', label: `Batch 1 (${batch1List.length})` },
                    { id: 'unbatched', label: `Belum Batch (${unbatchedList.length})` }
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setPoFilterBatch(b.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        poFilterBatch === b.id
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative w-full max-w-md">
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
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-sm text-brand-navy block">{r.nama_lengkap}</span>
                            {p.batch_produksi === 1 ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                BATCH 1
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                BELUM BATCH
                              </span>
                            )}
                          </div>
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
                          className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
                            {p.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve'} {p.kategori_ukuran === 'anak' ? '(Anak)' : ''} ({p.ukuran}) x{p.qty}
                          </span>
                          <span className="font-black text-brand-royal text-xs font-mono block">
                            Rp {p.harga_total.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs pt-2 border-t flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 truncate max-w-[60%]">
                          {p.metode_ambil === 'ambil_langsung' ? 'Ambil di Lokasi' : `Kirim: ${p.alamat_pengiriman || '-'}`}
                        </span>
                        {p.bukti_transfer_url ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => setPreviewImage(p.bukti_transfer_url)}
                              className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-royal bg-brand-royal/10 hover:bg-brand-royal/20 px-2 py-1 rounded-lg border border-brand-royal/20"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Bukti</span>
                            </button>
                            <button
                              onClick={() => {
                                setQuickUploadItem(item);
                                setQuickUploadProof(p.bukti_transfer_url || '');
                                setQuickCompressInfo(null);
                                setQuickUploadStatus(p.status_pembayaran === 'lunas' ? 'lunas' : 'menunggu_verifikasi');
                              }}
                              className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg border border-slate-300"
                              title="Ganti / Upload Ulang Bukti"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Ganti</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setQuickUploadItem(item);
                              setQuickUploadProof('');
                              setQuickCompressInfo(null);
                              setQuickUploadStatus('lunas');
                            }}
                            className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-300 shadow-sm"
                            title="Bantu upload bukti transfer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Bukti</span>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
                        <div className="flex flex-wrap items-center gap-1">
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

                        <div className="flex flex-wrap items-center gap-1">
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
                              {p.jenis_lengan === 'short_sleeve' ? 'Short' : 'Long'} {p.kategori_ukuran === 'anak' ? '(Anak)' : ''} ({p.ukuran}) x{p.qty}
                            </span>
                            <span className="font-black text-brand-royal text-xs font-mono block">
                              Rp {p.harga_total.toLocaleString('id-ID')}
                            </span>
                            <div className="mt-1 flex items-center gap-1">
                              {p.batch_produksi === 1 ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  BATCH 1
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                  BELUM BATCH
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {p.bukti_transfer_url ? (
                              <div className="inline-flex items-center space-x-1.5">
                                <button
                                  onClick={() => setPreviewImage(p.bukti_transfer_url)}
                                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-brand-royal hover:underline bg-brand-royal/10 px-2 py-1 rounded-lg border border-brand-royal/20"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Lihat</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setQuickUploadItem(item);
                                    setQuickUploadProof(p.bukti_transfer_url || '');
                                    setQuickCompressInfo(null);
                                    setQuickUploadStatus(p.status_pembayaran === 'lunas' ? 'lunas' : 'menunggu_verifikasi');
                                  }}
                                  className="text-slate-400 hover:text-brand-royal p-1 rounded hover:bg-slate-100"
                                  title="Ganti / Upload Ulang Bukti"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setQuickUploadItem(item);
                                  setQuickUploadProof('');
                                  setQuickCompressInfo(null);
                                  setQuickUploadStatus('lunas');
                                }}
                                className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 shadow-sm"
                                title="Upload bukti transfer"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload</span>
                              </button>
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

        {/* ======================================================== */}
        {/* TAB: BATCH PRODUKSI JERSEY VENDOR                        */}
        {/* ======================================================== */}
        {activeTab === 'batch_produksi' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-sky/40 shadow-card space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                      <Shirt className="w-4 h-4" />
                    </span>
                    <h2 className="text-lg font-bold text-brand-navy">Manajemen Batch Produksi Jersey</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Sistem pemisahan order konveksi per batch untuk mencegah duplikasi order ke vendor.
                  </p>
                </div>

                {/* Sub-view Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    onClick={() => setSelectedBatchView('batch_1')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
                      selectedBatchView === 'batch_1'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Batch 1 (Siap Produksi)</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${selectedBatchView === 'batch_1' ? 'bg-amber-800 text-amber-100' : 'bg-slate-200 text-slate-700'}`}>
                      {batch1List.length} Order ({batch1Summary.totalQty} pcs)
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedBatchView('unbatched')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-2 ${
                      selectedBatchView === 'unbatched'
                        ? 'bg-brand-navy text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Belum Masuk Batch</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${selectedBatchView === 'unbatched' ? 'bg-white/20 text-brand-yellow' : 'bg-slate-200 text-slate-700'}`}>
                      {unbatchedList.length} Order ({unbatchedSummary.totalQty} pcs)
                    </span>
                  </button>
                </div>
              </div>

              {/* Banner Info Cut-Off */}
              {selectedBatchView === 'batch_1' ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs flex items-start space-x-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Cut-Off Batch 1: s/d Hanifsyah Aditya (BIB #1184)</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Seluruh data pesanan PO jersey dari awal pendaftaran sampai dengan nomor BIB 1184 dikunci ke Batch 1. Data ini yang diberikan ke vendor produksi konveksi pertama hari ini.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Pesanan PO Jersey Baru (Setelah BIB 1184)</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Peserta yang mendaftar atau memesan jersey setelah cutoff BIB 1184 akan masuk ke status ini. Pesanan ini aman dan terpisah dari Batch 1. Jika sudah cukup banyak, panitia dapat mengunci &amp; memasukkannya ke Batch 2.
                    </p>
                  </div>
                </div>
              )}

              {/* 4 Stat Badges */}
              {(() => {
                const currentSummary = selectedBatchView === 'batch_1' ? batch1Summary : unbatchedSummary;
                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Jersey</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-brand-navy">{currentSummary.totalQty}</span>
                        <span className="text-xs font-bold text-slate-500">pcs ({currentSummary.totalCount} pemesan)</span>
                      </div>
                    </div>

                    <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-600 block">Lengan Pendek (Short)</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-sky-900">{currentSummary.shortQty}</span>
                        <span className="text-xs font-bold text-sky-700">pcs</span>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">Lengan Panjang (Long)</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-indigo-900">{currentSummary.longQty}</span>
                        <span className="text-xs font-bold text-indigo-700">pcs</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 block">Status Pembayaran</span>
                      <div className="flex items-baseline space-x-1.5 mt-0.5">
                        <span className="text-xl sm:text-2xl font-black text-emerald-900">{currentSummary.lunasQty}</span>
                        <span className="text-xs font-bold text-emerald-700">Lunas ({currentSummary.unpaidQty} blm)</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopyVendorSummary(selectedBatchView === 'batch_1')}
                    className="min-h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
                  >
                    {batchCopyFeedback === selectedBatchView ? (
                      <>
                        <Check className="w-4 h-4 text-brand-yellow animate-bounce" />
                        <span>✓ Teks Format WA Vendor Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Rekap untuk WA Vendor</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`/api/admin/export?batch=${selectedBatchView === 'batch_1' ? '1' : 'unbatched'}`}
                    target="_blank"
                    download
                    className="min-h-10 px-4 py-2 bg-brand-navy hover:bg-brand-royal text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4 text-brand-yellow" />
                    <span>Download CSV {selectedBatchView === 'batch_1' ? 'Batch 1' : 'Unbatched'}</span>
                  </a>
                </div>

                {selectedBatchView === 'unbatched' && unbatchedList.length > 0 && (
                  <button
                    onClick={handleAssignUnbatchedToBatch2}
                    disabled={assigningBatch}
                    className="min-h-10 px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center space-x-2 shadow-md transition-all"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{assigningBatch ? 'Memproses...' : `Kunci ${unbatchedList.length} Pesanan ke Batch 2`}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Matrix Rekap Ukuran Vendor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Ukuran Dewasa */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-brand-navy" />
                    <h3 className="font-extrabold text-sm text-brand-navy">Rekap Ukuran Dewasa (Adult)</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {Object.values((selectedBatchView === 'batch_1' ? batch1Summary : unbatchedSummary).dewasaSizes).reduce((acc, d) => acc + d.total, 0)} pcs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2 px-3">Size</th>
                        <th className="py-2 px-3 text-center">Short Sleeve</th>
                        <th className="py-2 px-3 text-center">Long Sleeve</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries((selectedBatchView === 'batch_1' ? batch1Summary : unbatchedSummary).dewasaSizes).map(([size, data]) => (
                        <tr key={size} className={data.total > 0 ? 'font-bold bg-amber-50/40' : 'text-slate-400'}>
                          <td className="py-2 px-3 font-mono">{size}</td>
                          <td className="py-2 px-3 text-center">{data.short}</td>
                          <td className="py-2 px-3 text-center">{data.long}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-brand-navy">
                            {data.total > 0 ? `${data.total} pcs` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ukuran Anak-Anak */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Baby className="w-4 h-4 text-amber-600" />
                    <h3 className="font-extrabold text-sm text-brand-navy">Rekap Ukuran Anak-Anak (Kids)</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-700">
                    {Object.values((selectedBatchView === 'batch_1' ? batch1Summary : unbatchedSummary).anakSizes).reduce((acc, d) => acc + d.total, 0)} pcs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-amber-50 text-amber-900 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-2 px-3">Size Anak</th>
                        <th className="py-2 px-3 text-center">Short Sleeve</th>
                        <th className="py-2 px-3 text-center">Long Sleeve</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries((selectedBatchView === 'batch_1' ? batch1Summary : unbatchedSummary).anakSizes).map(([size, data]) => (
                        <tr key={size} className={data.total > 0 ? 'font-bold bg-amber-100/40' : 'text-slate-400'}>
                          <td className="py-2 px-3 font-mono">{size}</td>
                          <td className="py-2 px-3 text-center">{data.short}</td>
                          <td className="py-2 px-3 text-center">{data.long}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-amber-900">
                            {data.total > 0 ? `${data.total} pcs` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Tabel Detail Peserta dalam Batch */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <h3 className="font-extrabold text-sm text-brand-navy">
                  Daftar Peserta {selectedBatchView === 'batch_1' ? 'Batch 1' : 'Belum Masuk Batch'}
                </h3>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari peserta dalam batch..."
                    value={batchSearchTerm}
                    onChange={(e) => setBatchSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              {(() => {
                const targetList = selectedBatchView === 'batch_1' ? batch1List : unbatchedList;
                const filtered = targetList.filter((item) => {
                  if (!batchSearchTerm.trim()) return true;
                  const q = batchSearchTerm.toLowerCase();
                  return (
                    item.registrant.nama_lengkap.toLowerCase().includes(q) ||
                    item.registrant.nomor_registrasi.toLowerCase().includes(q) ||
                    (item.registrant.nomor_bib || '').toString().includes(q) ||
                    (item.registrant.komunitas || '').toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-400 font-medium text-xs bg-slate-50 rounded-2xl">
                      Tidak ada pesanan di {selectedBatchView === 'batch_1' ? 'Batch 1' : 'status Belum Masuk Batch'}.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">BIB &amp; Peserta</th>
                          <th className="py-2.5 px-3">Komunitas</th>
                          <th className="py-2.5 px-3">Spesifikasi Jersey</th>
                          <th className="py-2.5 px-3 text-center">Pengambilan</th>
                          <th className="py-2.5 px-3 text-center">Status Bayar</th>
                          <th className="py-2.5 px-3 text-center">Batch</th>
                          <th className="py-2.5 px-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((item, idx) => {
                          const r = item.registrant;
                          const p = item.jersey_po;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-extrabold text-xs text-brand-navy block">{r.nama_lengkap}</span>
                                <span className="text-[10px] font-mono text-brand-royal font-bold">BIB #{r.nomor_bib}</span>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-700">{r.komunitas || 'Umum'}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-800 block">
                                  {p.jenis_lengan === 'short_sleeve' ? 'Short' : 'Long'} {p.kategori_ukuran === 'anak' ? '(Anak)' : ''} Size {p.ukuran} x{p.qty}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.metode_ambil === 'dikirim' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {p.metode_ambil === 'dikirim' ? 'Dikirim' : 'Di Lokasi'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  p.status_pembayaran === 'lunas'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {p.status_pembayaran === 'lunas' ? 'LUNAS' : p.status_pembayaran}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {p.batch_produksi === 1 ? (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Batch 1
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                    Belum Batch
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <div className="inline-flex items-center space-x-1">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="bg-brand-royal/10 hover:bg-brand-royal/20 text-brand-royal font-bold px-2 py-1 rounded-lg text-[10px] border border-brand-royal/30"
                                  >
                                    Edit
                                  </button>
                                  {selectedBatchView === 'batch_1' ? (
                                    <button
                                      onClick={() => handleUpdateBatch(p.id, r.id, null)}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-1.5 py-1 rounded-lg text-[10px]"
                                      title="Keluarkan dari Batch 1"
                                    >
                                      Lepas Batch
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateBatch(p.id, r.id, 1)}
                                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-1.5 py-1 rounded-lg text-[10px]"
                                      title="Masukkan ke Batch 1"
                                    >
                                      + Batch 1
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'rekap' && (
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-sky/40 shadow-card space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
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
                className="w-full sm:w-auto min-h-11 justify-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download File Rekap CSV</span>
              </a>
            </div>

            <div className="relative w-full max-w-md">
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
                        <div className="min-w-0">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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

                      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-1.5 pt-2 border-t">
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
                              <div className="text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    p.status_pembayaran === 'lunas'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  PO ({p.status_pembayaran})
                                </span>
                                <span className="text-[10px] text-slate-500 block font-medium mt-0.5">
                                  {p.jenis_lengan === 'short_sleeve' ? 'Short' : 'Long'} {p.kategori_ukuran === 'anak' ? '(Anak)' : ''} ({p.ukuran}) x{p.qty}
                                </span>
                              </div>
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
          <form onSubmit={handleSaveSettings} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-brand-sky/40 shadow-card space-y-5 sm:space-y-6">
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
            <form onSubmit={handleCreatePIC} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-brand-yellow/50 shadow-card space-y-5 sm:space-y-6">
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

            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-brand-sky/40 shadow-card space-y-4">
              <h3 className="font-extrabold text-brand-navy text-base flex items-center space-x-2 border-b pb-3">
                <Users className="w-5 h-5 text-brand-royal" />
                <span>Daftar Seluruh Akun Admin &amp; PIC Terdaftar ({adminsList.length})</span>
              </h3>

              <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <table className="min-w-[680px] w-full text-left text-xs">
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
          <form onSubmit={handleSaveProfile} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-brand-sky/40 shadow-card space-y-5 sm:space-y-6 max-w-xl">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Pratinjau bukti transfer">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-4 space-y-3 my-auto mx-auto">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Edit data peserta dan jersey">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl my-auto mx-auto">
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
                <div className="bg-brand-royal/5 p-4 rounded-2xl border border-brand-royal/20 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-brand-royal uppercase tracking-wider">
                      2. Spesifikasi PO Jersey &amp; Pembayaran
                    </h4>
                    <span className="text-[10px] font-bold text-slate-500">
                      Status: {editForm.status_pembayaran.toUpperCase()}
                    </span>
                  </div>

                  {/* Kategori Usia: Dewasa vs Anak */}
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">Kategori Jersey</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            kategori_ukuran: 'dewasa',
                            ukuran: prev.kategori_ukuran === 'dewasa' ? prev.ukuran : 'L'
                          }))
                        }
                        className={`py-1.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                          editForm.kategori_ukuran === 'dewasa'
                            ? 'border-brand-navy bg-brand-navy text-brand-yellow shadow-sm'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Dewasa (Adult)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            kategori_ukuran: 'anak',
                            ukuran: prev.kategori_ukuran === 'anak' ? prev.ukuran : 'M'
                          }))
                        }
                        className={`py-1.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all ${
                          editForm.kategori_ukuran === 'anak'
                            ? 'border-brand-royal bg-brand-royal text-white shadow-sm'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Baby className="w-3.5 h-3.5 text-amber-300" />
                        <span>Anak-Anak (Kids)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jenis Lengan</label>
                      <select
                        value={editForm.jenis_lengan}
                        onChange={(e) => setEditForm({ ...editForm, jenis_lengan: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                      >
                        <option value="short_sleeve">Short Sleeve</option>
                        <option value="long_sleeve">Long Sleeve</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {editForm.kategori_ukuran === 'dewasa' ? 'Ukuran Dewasa' : 'Ukuran Anak'}
                      </label>
                      {editForm.kategori_ukuran === 'dewasa' ? (
                        <select
                          value={editForm.ukuran}
                          onChange={(e) => setEditForm({ ...editForm, ukuran: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                        >
                          <option value="S">Size S (P 69cm / L 48cm)</option>
                          <option value="M">Size M (P 71cm / L 50cm)</option>
                          <option value="L">Size L (P 73cm / L 52cm)</option>
                          <option value="XL">Size XL (P 75cm / L 54cm)</option>
                          <option value="XXL">Size XXL / 2XL (P 77cm / L 56cm)</option>
                          <option value="3XL">Size 3XL / XXXL (P 79cm / L 58cm)</option>
                          <option value="4XL">Size 4XL / XXXXL (P 81cm / L 60cm)</option>
                          <option value="5XL">Size 5XL (P 83cm / L 62cm)</option>
                        </select>
                      ) : (
                        <select
                          value={editForm.ukuran}
                          onChange={(e) => setEditForm({ ...editForm, ukuran: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-amber-300 font-bold bg-amber-50 text-xs"
                        >
                          <option value="2XS">Size 2XS (1-2 Thn / P 45cm / L 33cm)</option>
                          <option value="XS">Size XS (3-4 Thn / P 48cm / L 35cm)</option>
                          <option value="S">Size S (5-6 Thn / P 50cm / L 37cm)</option>
                          <option value="M">Size M (7-8 Thn / P 53cm / L 39cm)</option>
                          <option value="L">Size L (8-9 Thn / P 55cm / L 41cm)</option>
                          <option value="XL">Size XL (10-11 Thn / P 58cm / L 43cm)</option>
                          <option value="2XL">Size 2XL (12-13 Thn / P 62cm / L 45cm)</option>
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Jumlah (Qty)</label>
                      <input
                        type="number"
                        min={1}
                        value={editForm.qty}
                        onChange={(e) => setEditForm({ ...editForm, qty: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Metode Pengambilan</label>
                      <select
                        value={editForm.metode_ambil}
                        onChange={(e) => setEditForm({ ...editForm, metode_ambil: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs"
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                      >
                        <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                        <option value="lunas">Lunas (Sudah Verifikasi)</option>
                        <option value="perlu_klarifikasi">Perlu Klarifikasi</option>
                        <option value="kedaluwarsa">Kedaluwarsa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Batch Produksi Vendor</label>
                      <select
                        value={editForm.batch_produksi === null || editForm.batch_produksi === undefined ? 'unbatched' : editForm.batch_produksi.toString()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditForm({
                            ...editForm,
                            batch_produksi: val === 'unbatched' ? null : parseInt(val, 10)
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 font-bold bg-amber-50/60 text-xs"
                      >
                        <option value="1">Batch 1 (Produksi Pertama - s/d BIB 1184)</option>
                        <option value="2">Batch 2</option>
                        <option value="3">Batch 3</option>
                        <option value="unbatched">Belum Masuk Batch (Unbatched / PO Baru)</option>
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

                  {/* Upload Bukti Transfer dengan Kompresi Otomatis */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block font-bold text-slate-700 mb-1.5 text-xs flex items-center justify-between">
                      <span>Bukti Transfer Pembayaran</span>
                      {proofCompressInfo && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ {proofCompressInfo}
                        </span>
                      )}
                    </label>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-brand-yellow font-bold text-xs cursor-pointer shadow-sm transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{compressingProof ? 'Mengompres Foto...' : 'Pilih / Foto Bukti Transfer'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={compressingProof}
                            onChange={handleAdminProofUpload}
                            className="hidden"
                          />
                        </label>

                        {editForm.bukti_transfer_url && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(editForm.bukti_transfer_url)}
                            className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-brand-royal/10 text-brand-royal hover:bg-brand-royal/20 font-bold text-xs border border-brand-royal/30"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti ({estimateDataUrlSize(editForm.bukti_transfer_url)})</span>
                          </button>
                        )}

                        {editForm.bukti_transfer_url && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditForm((prev) => ({ ...prev, bukti_transfer_url: '' }));
                              setProofCompressInfo(null);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs border border-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>

                      {/* Thumbnail Preview */}
                      {editForm.bukti_transfer_url && (
                        <div className="relative w-full max-w-[180px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-brand-royal/30 shadow-sm bg-black/5 mt-2">
                          <img
                            src={editForm.bukti_transfer_url}
                            alt="Preview Bukti Transfer"
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                            onClick={() => setPreviewImage(editForm.bukti_transfer_url)}
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 text-center truncate">
                            Klik untuk perbesar
                          </div>
                        </div>
                      )}

                      {/* Manual Link Input Fallback */}
                      <details className="text-[11px] text-slate-500 pt-1">
                        <summary className="cursor-pointer hover:text-slate-800 font-medium">
                          Atau masukkan link URL gambar manual
                        </summary>
                        <input
                          type="text"
                          value={editForm.bukti_transfer_url}
                          onChange={(e) => setEditForm({ ...editForm, bukti_transfer_url: e.target.value })}
                          placeholder="https://... atau data:image/..."
                          className="w-full mt-1.5 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-[10px] bg-white"
                        />
                      </details>
                    </div>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus peserta">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center my-auto mx-auto">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Konfirmasi hapus pesanan jersey">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-center my-auto mx-auto">
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Kartu digital BIB peserta">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl relative my-auto mx-auto">
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

      {/* QUICK UPLOAD BUKTI TRANSFER MODAL */}
      {quickUploadItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Upload Bukti Pembayaran">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl relative border border-brand-sky/40 my-auto">
            <button
              onClick={() => {
                setQuickUploadItem(null);
                setQuickUploadProof('');
                setQuickCompressInfo(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold flex-shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-brand-navy">
                  Upload Bukti Transfer Peserta
                </h3>
                <p className="text-xs text-slate-500">
                  Bantu unggah bukti struk pembayaran peserta yang dikirim via WhatsApp
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Nama Peserta:</span>
                <span className="font-extrabold text-brand-navy">{quickUploadItem.registrant.nama_lengkap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Nomor BIB / Reg:</span>
                <span className="font-mono text-brand-royal font-bold">BIB #{quickUploadItem.registrant.nomor_bib} ({quickUploadItem.registrant.nomor_registrasi})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Pesanan Jersey:</span>
                <span className="font-bold text-slate-800">
                  {quickUploadItem.jersey_po.jenis_lengan === 'short_sleeve' ? 'Short Sleeve' : 'Long Sleeve'} {quickUploadItem.jersey_po.kategori_ukuran === 'anak' ? '(Anak)' : ''} ({quickUploadItem.jersey_po.ukuran}) x{quickUploadItem.jersey_po.qty}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Total Tagihan:</span>
                <span className="font-black text-emerald-600 text-sm font-mono">
                  Rp {quickUploadItem.jersey_po.harga_total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveQuickUpload} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center justify-between">
                  <span>Pilih File Gambar Bukti Transfer (JPG/PNG/WebP)</span>
                  {quickCompressInfo && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ {quickCompressInfo}
                    </span>
                  )}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-navy hover:bg-brand-navyLight text-brand-yellow font-bold text-xs cursor-pointer shadow-sm transition-all border border-brand-yellow/30">
                    <Upload className="w-4 h-4" />
                    <span>{quickCompressing ? 'Mengompres Foto...' : 'Pilih / Foto Bukti Transfer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={quickCompressing || quickSaving}
                      onChange={handleQuickFileChange}
                      className="hidden"
                    />
                  </label>

                  {quickUploadProof && (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(quickUploadProof)}
                      className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-brand-royal/10 text-brand-royal hover:bg-brand-royal/20 font-bold text-xs border border-brand-royal/30"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Ukuran Penuh ({estimateDataUrlSize(quickUploadProof)})</span>
                    </button>
                  )}
                </div>

                {quickUploadProof && (
                  <div className="relative w-full max-w-[200px] aspect-[4/3] rounded-2xl overflow-hidden border-2 border-brand-royal/40 shadow-sm bg-black/5 mt-3 mx-auto sm:mx-0">
                    <img
                      src={quickUploadProof}
                      alt="Pratinjau Bukti"
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90"
                      onClick={() => setPreviewImage(quickUploadProof)}
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 text-center">
                      Klik untuk perbesar
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">
                  Set Status Pembayaran Setelah Simpan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickUploadStatus('lunas')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      quickUploadStatus === 'lunas'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm font-extrabold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span>Langsung Lunas (Verifikasi)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickUploadStatus('menunggu_verifikasi')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                      quickUploadStatus === 'menunggu_verifikasi'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-sm font-extrabold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <span>Menunggu Verifikasi</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setQuickUploadItem(null);
                    setQuickUploadProof('');
                    setQuickCompressInfo(null);
                  }}
                  disabled={quickSaving}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!quickUploadProof || quickSaving || quickCompressing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold shadow flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>{quickSaving ? 'Menyimpan...' : 'Simpan Bukti Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
