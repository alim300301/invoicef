import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, FileText, Upload, Building2, Check, X } from 'lucide-react';

export default function App() {
  const [logo, setLogo] = useState('../public/logo.png'); // Mengarahkan logo default ke /src/logo.png
  const [isPaid, setIsPaid] = useState(false); // Status Lunas/Belum Lunas untuk Watermark
  const [showPrintModal, setShowPrintModal] = useState(false); // Pop-up sebelum print
  const [discountValue, setDiscountValue] = useState(0); // State Diskon Global dalam nominal Rupiah (Rp)

  // Ambil tanggal hari ini secara otomatis
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const todayStr = today.toISOString().split('T')[0];
  const defaultDueDateStr = new Date(new Date().setDate(today.getDate() + 7)).toISOString().split('T')[0];

  const [invoiceData, setInvoiceData] = useState({
    // Header & Order info (Otomatis mengikuti tanggal hari ini)
    invoiceNumber: `INV/${currentYear}/${currentMonth}/001`,
    date: todayStr,
    dueDate: defaultDueDateStr,
    orderNumber: `PO-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
    orderDate: todayStr,

    // Seller Info (Default CV ACS MULTI TECHNOLOGY)
    sellerName: 'CV ACS MULTI TECHNOLOGY',
    sellerAddress: 'Tugung, Sempu, Kec. Sempu\nKabupaten Banyuwangi, Jawa Timur 68468',
    sellerPhone: '0851-5782-3230',
    sellerEmail: 'acsmultitechnology@gmail.com',
    sellerNPWP: '53.921.845.2-627.000', // NPWP Perusahaan Default

    // Billing Info (Alamat Penagihan)
    billingName: 'PT. Sukses Makmur',
    billingAddress: 'Gedung Grha Raya Lantai 5, Jl. Jend. Sudirman No. 12\nJakarta Pusat, DKI Jakarta 10220',
    billingPhone: '021-5551234',

    // Nama pemilik semua rekening bank (dijadikan satu)
    bankAccountName: 'MOHAMMAD MUNIR',

    notes: '1. Pembayaran dianggap sah jika telah diterima di salah satu rekening resmi kami di bawah ini.\n2. Mohon kirimkan bukti transfer setelah melakukan pembayaran.',
  });

  // Rekening Bank (hanya menyimpan nama bank & nomor rekening saja)
  const [bankAccounts, setBankAccounts] = useState([
    { id: 1, bankName: 'Bank BRI', accountNo: '612001021425536' },
    { id: 2, bankName: 'Bank Mandiri', accountNo: '1430030731481' },
    { id: 3, bankName: 'Bank BCA', accountNo: '2631302736' }
  ]);

  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Biaya Langganan Internet Bulanan - Layanan Dedicated',
      price: 2500000,
      quantity: 1,
      taxRate: 0, // Default PPN 0%
      taxType: 'PPN'
    },
    {
      id: 2,
      name: 'Peralatan Jaringan (Switch Hub 16 Port)',
      price: 1250000,
      quantity: 2,
      taxRate: 0, // Default PPN 0%
      taxType: 'PPN'
    }
  ]);

  const formatIDR = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number || 0);
  };

  // Fungsi konversi nominal ke format Terbilang Bahasa Indonesia
  const terbilang = (nilai) => {
    const bilangan = [
      '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
      'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
    ];
    let temp = '';
    const n = Math.floor(nilai);

    if (n < 12) {
      temp = ' ' + bilangan[n];
    } else if (n < 20) {
      temp = terbilang(n - 10) + ' Belas';
    } else if (n < 100) {
      temp = terbilang(n / 10) + ' Puluh' + terbilang(n % 10);
    } else if (n < 200) {
      temp = ' Seratus' + terbilang(n - 100);
    } else if (n < 1000) {
      temp = terbilang(n / 100) + ' Ratus' + terbilang(n % 100);
    } else if (n < 2000) {
      temp = ' Seribu' + terbilang(n - 1000);
    } else if (n < 1000000) {
      temp = terbilang(n / 1000) + ' Ribu' + terbilang(n % 1000);
    } else if (n < 1000000000) {
      temp = terbilang(n / 1000000) + ' Juta' + terbilang(n % 1000000);
    } else if (n < 1000000000000) {
      temp = terbilang(n / 1000000000) + ' Milyar' + terbilang(n % 1000000000);
    } else if (n < 1000000000000000) {
      temp = terbilang(n / 1000000000000) + ' Trilyun' + terbilang(n % 1000000000000);
    }
    return temp.trim();
  };

  const getAmountInWords = (amount) => {
    if (amount === 0) return 'Nol Rupiah';
    const hasil = terbilang(amount);
    return `${hasil} Rupiah`;
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  };

  const handleBankChange = (id, field, value) => {
    const updatedBanks = bankAccounts.map((acc) => {
      if (acc.id === id) {
        return { ...acc, [field]: value };
      }
      return acc;
    });
    setBankAccounts(updatedBanks);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now(), name: '', price: 0, quantity: 1, taxRate: 0, taxType: 'PPN' }
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const addBank = () => {
    setBankAccounts([
      ...bankAccounts,
      { id: Date.now(), bankName: 'Nama Bank', accountNo: '-' }
    ]);
  };

  const removeBank = (id) => {
    if (bankAccounts.length > 1) {
      setBankAccounts(bankAccounts.filter((acc) => acc.id !== id));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Kalkulasi Pajak dan Total per baris item
  const calculatedItems = items.map(item => {
    const netAmount = item.quantity * item.price;
    const taxAmount = netAmount * (item.taxRate / 100);
    const totalAmount = netAmount + taxAmount;
    return {
      ...item,
      netAmount,
      taxAmount,
      totalAmount
    };
  });

  const totalNet = calculatedItems.reduce((acc, item) => acc + item.netAmount, 0);
  const totalTax = calculatedItems.reduce((acc, item) => acc + item.taxAmount, 0);
  const grandTotal = totalNet - discountValue + totalTax;

  const triggerPrint = (paidStatus) => {
    setIsPaid(paidStatus);
    setShowPrintModal(false);

    const originalTitle = document.title;
    const sanitizedInvoiceNumber = invoiceData.invoiceNumber.replace(/\//g, '-');
    document.title = sanitizedInvoiceNumber;

    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 150);
  };

  return (
    <div className="app-wrapper">
      <style>
        {`
          /* === RESET & BASE CSS === */
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          /* MENGHILANGKAN TOMBOL SPIN ARROW DI INPUT NUMBER (Layar & Cetak) */
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
          input[type=number] { 
            -moz-appearance: textfield; 
          }

          .app-wrapper {
            background-color: #f3f4f6;
            min-height: 100vh;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1f2937;
            line-height: 1.3;
          }
          .container {
            max-width: 1300px;
            margin: 0 auto;
            display: flex;
            gap: 20px;
            align-items: flex-start;
          }
          
          /* === LAYOUT UTAMA === */
          .invoice-main {
            flex: 3;
            background: white;
            border-radius: 4px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            padding: 30px;
            border: 1px solid #d1d5db;
            min-width: 60%;
            position: relative;
            overflow: hidden;
          }
          .sidebar {
            flex: 1;
            min-width: 260px;
          }
          .control-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
            padding: 20px;
            border: 1px solid #d1d5db;
            position: sticky;
            top: 24px;
          }

          /* === WATERMARK LUNAS STAMP === */
          .watermark-stamp {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-15deg);
            width: 240px;
            height: 100px;
            border: 5px double #ef4444;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #ef4444;
            font-family: 'Impact', 'Arial Black', sans-serif;
            opacity: 0.18;
            z-index: 10;
            pointer-events: none;
            text-transform: uppercase;
            letter-spacing: 4px;
            background-color: rgba(255, 255, 255, 0.4);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
          }
          .watermark-stamp-title {
            font-size: 42px;
            line-height: 1;
            font-weight: 900;
          }
          .watermark-stamp-subtitle {
            font-family: 'Segoe UI', sans-serif;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-top: 1px;
            border-top: 1.5px solid #ef4444;
            padding-top: 1px;
            width: 80%;
            text-align: center;
          }

          /* === BRANDING LOGO === */
          .brand-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
          }
          .logo-wrapper {
            max-width: 250px;
          }
          .logo-preview {
            max-height: 55px;
            max-width: 100%;
            object-fit: contain;
          }
          .upload-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background-color: #f3f4f6;
            padding: 5px 8px;
            border-radius: 4px;
            border: 1px dashed #9ca3af;
            cursor: pointer;
            font-size: 10.5px;
            font-weight: 600;
          }
          .upload-label:hover {
            background-color: #e5e7eb;
          }

          .invoice-header-info {
            text-align: right;
          }
          .invoice-title {
            font-size: 22px;
            font-weight: 800;
            text-transform: uppercase;
            color: #1f2937;
            letter-spacing: 0.5px;
          }
          .invoice-subtitle {
            font-size: 9.5px;
            color: #4b5563;
            margin-top: 1px;
          }

          /* === INPUTS & TEXTAREAS === */
          input, textarea, select {
            width: 100%;
            padding: 4px 6px;
            border: 1px dashed #d1d5db;
            border-radius: 4px;
            font-family: inherit;
            font-size: 11.5px;
            margin-bottom: 3px;
            outline: none;
            background-color: #f9fafb;
            color: #1f2937;
          }
          input:focus, textarea:focus { border: 1px solid #0d9488; background-color: #fff; }
          textarea { resize: vertical; }
          
          /* === BLOK DETAIL & ALAMAT === */
          .grid-info {
            display: grid;
            grid-template-columns: 1fr 1fr 1.1fr;
            gap: 15px;
            border-top: 1.5px solid #111827;
            padding-top: 12px;
            margin-bottom: 12px;
          }
          .address-block {
            font-size: 11px;
          }
          .address-title {
            font-weight: bold;
            margin-bottom: 4px;
            text-transform: uppercase;
            color: #374151;
            font-size: 10.5px;
            letter-spacing: 0.5px;
          }
          .meta-row {
            display: flex;
            font-size: 11px;
            margin-bottom: 2px;
            align-items: center;
          }
          .meta-label {
            width: 100px;
            font-weight: 600;
            color: #4b5563;
          }
          .meta-value {
            flex: 1;
          }

          /* === TABLE STYLE (FONT TETAP BESAR 15px - 16px) === */
          .table-container {
            margin-top: 10px;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th {
            border-top: 2px solid #111827;
            border-bottom: 2px solid #111827;
            padding: 12px 6px;
            font-weight: 800;
            text-align: left;
            text-transform: uppercase;
            color: #000;
            font-size: 15px;
            letter-spacing: 0.3px;
          }
          td {
            padding: 12px 6px;
            border-bottom: 1px dashed #e5e7eb;
            vertical-align: middle;
            font-size: 16px;
            color: #000;
            line-height: 1.4;
          }
          
          table input {
            font-size: 16px !important;
            padding: 8px 6px;
            margin-bottom: 0;
            font-weight: inherit;
          }
          
          .cell-center { text-align: center; }
          .cell-right { text-align: right; }
          
          .col-no { width: 5%; text-align: center; }
          .col-desc { width: 38%; }
          .col-uprice { width: 15%; text-align: right; }
          .col-qty { width: 8%; text-align: center; }
          .col-net { width: 14%; text-align: right; }
          .col-trate { width: 7%; text-align: center; }
          .col-tamount { width: 13%; text-align: right; }
          .col-total { width: 14%; text-align: right; font-weight: bold; }
          .col-act { width: 5%; text-align: center; }

          /* === BAGIAN BAWAH (3 KOLOM BERDAMPINGAN) === */
          .bottom-section {
            display: grid;
            grid-template-columns: 1fr 1fr 0.8fr;
            gap: 20px;
            margin-top: 12px;
            border-top: 1.5px solid #111827;
            padding-top: 12px;
            font-size: 11px;
            align-items: flex-start;
          }
          .amount-words-box {
            background-color: #f9fafb;
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            margin-bottom: 8px;
          }
          .bank-info-box {
            background-color: #f0fdfa;
            padding: 10px;
            border: 1px solid #99f6e4;
            border-radius: 4px;
            font-size: 11px;
          }
          .bank-info-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #99f6e4;
            padding-bottom: 3px;
            margin-bottom: 6px;
          }
          .bank-info-title {
            font-weight: bold;
            color: #0f766e;
            text-transform: uppercase;
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .bank-grid-header {
            display: grid;
            grid-template-columns: 85px 1fr 30px;
            gap: 6px;
            font-weight: bold;
            font-size: 9.5px;
            color: #0f766e;
            margin-bottom: 2px;
            border-bottom: 1px dashed #99f6e4;
            padding-bottom: 1px;
          }
          .bank-row-item {
            display: grid;
            grid-template-columns: 85px 1fr 30px;
            gap: 6px;
            align-items: center;
            margin-bottom: 3px;
          }
          .bank-row-item input {
            margin-bottom: 0;
            padding: 2px 4px;
            font-size: 10.5px;
          }
          
          .notes-column-box {
            font-size: 11px;
            background-color: #ffffff;
            padding: 2px;
          }
          .notes-column-box textarea {
            font-size: 11px;
            margin-top: 4px;
            line-height: 1.4;
          }

          .signature-box {
            text-align: right;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 100%;
            min-height: 175px;
            position: relative;
          }
          .signature-image-container {
            display: flex;
            justify-content: flex-end;
            margin: 2px 0;
            height: 95px;
          }
          .signature-graphic-file {
            max-height: 100%;
            max-width: 170px;
            object-fit: contain;
          }

          /* === CUSTOM POPUP MODAL DIALOG === */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            font-family: sans-serif;
          }
          .modal-box {
            background: white;
            padding: 24px;
            border-radius: 12px;
            width: 420px;
            max-width: 90%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            text-align: center;
          }
          .modal-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 12px;
          }
          .modal-desc {
            font-size: 14px;
            color: #4b5563;
            margin-bottom: 20px;
            line-height: 1.5;
          }
          .modal-buttons {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .btn-modal-paid {
            background-color: #10b981;
            color: white;
            padding: 12px;
            border-radius: 8px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .btn-modal-paid:hover { background-color: #059669; }
          .btn-modal-unpaid {
            background-color: #f59e0b;
            color: white;
            padding: 12px;
            border-radius: 8px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .btn-modal-unpaid:hover { background-color: #d97706; }
          .btn-modal-cancel {
            background-color: #f3f4f6;
            color: #4b5563;
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
            font-weight: 600;
            cursor: pointer;
            font-size: 13px;
          }
          .btn-modal-cancel:hover { background-color: #e5e7eb; color: #1f2937; }

          /* === TOMBOL === */
          .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; border: none; font-size: 14px; transition: all 0.2s;}
          .btn-primary { background-color: #0d9488; color: white; width: 100%; font-size: 16px; padding: 12px; }
          .btn-primary:hover { background-color: #0f766e; }
          .btn-text { background: transparent; color: #0d9488; padding: 5px 8px; font-weight: bold; font-size: 11.5px; }
          .btn-text:hover { background-color: #f0fdfa; }
          .btn-icon { background: transparent; color: #ef4444; padding: 4px; border-radius: 50%; }
          .btn-icon:hover { background-color: #fef2f2; }
          
          .btn-icon-small {
            padding: 2px;
            color: #ef4444;
            background: transparent;
            border-radius: 4px;
          }
          .btn-icon-small:hover { background-color: #fecaca; }

          @media (max-width: 950px) {
            .container { flex-direction: column; }
            .invoice-main { min-width: 100%; padding: 20px; }
            .sidebar { width: 100%; }
            .bottom-section { grid-template-columns: 1fr; }
          }

          /* === PRINT MODE STYLES (FfONT ISI TETAP BESAR) === */
          @media print {
            @page { 
              size: landscape; 
              margin: 0.3cm 0.4cm; 
            }
            body { 
              background: white; 
              margin: 0; 
              padding: 0; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .app-wrapper { 
              background: white; 
              padding: 0; 
              min-height: auto;
            }
            .container { 
              display: block; 
              max-width: 100%; 
            }
            .sidebar, .no-print { 
              display: none !important; 
            }
            
            .invoice-main { 
              box-shadow: none; 
              border: none; 
              padding: 0 !important; 
              width: 100% !important;
              max-width: 100% !important;
            }
            
            .brand-container { margin-bottom: 8px !important; }
            .logo-preview { max-height: 48px !important; }
            
            .grid-info {
              gap: 12px !important;
              padding-top: 8px !important;
              margin-bottom: 8px !important;
            }
            .address-block { font-size: 10.5px !important; }
            .address-title { font-size: 9.5px !important; margin-bottom: 2px !important; }
            .meta-row { font-size: 10.5px !important; margin-bottom: 1px !important; }
            
            input, textarea, select { 
              border: none !important; 
              background: transparent !important; 
              padding: 0 !important; 
              margin: 0 !important;
              box-shadow: none !important;
              resize: none;
              color: black !important;
              appearance: none;
              -webkit-appearance: none;
            }
            input::placeholder, textarea::placeholder { color: transparent !important; }

            .table-container {
              margin-top: 6px !important;
              margin-bottom: 6px !important;
            }
            
            th { 
              border-bottom: 2px solid #000 !important; 
              border-top: 2px solid #000 !important; 
              background: transparent !important; 
              color: black !important; 
              padding: 8px 4px !important; 
              font-size: 14.5px !important; 
              font-weight: 800 !important;
            }
            td { 
              border-bottom: 1px dashed #ccc !important; 
              padding: 8px 4px !important; 
              font-size: 15.5px !important; 
              color: black !important;
              line-height: 1.3 !important;
            }
            table input {
              font-size: 15.5px !important;
              color: black !important;
              font-weight: inherit !important;
            }
            
            .bottom-section {
              grid-template-columns: 1fr 1fr 0.8fr !important;
              gap: 16px !important;
              margin-top: 8px !important;
              padding-top: 8px !important;
            }
            .amount-words-box { 
              border: 1px solid #000; 
              background: transparent; 
              padding: 6px 8px !important; 
              margin-bottom: 6px !important;
            }
            .bank-info-box { 
              border: 1px solid #000; 
              background: transparent; 
              padding: 6px 8px !important; 
            }
            .bank-info-header { margin-bottom: 3px !important; padding-bottom: 1px !important; }
            .bank-info-title { color: black; font-size: 9.5px !important; }
            .bank-grid-header { 
              border-bottom: 1px solid #000; 
              color: black; 
              grid-template-columns: 80px 1fr;
              font-size: 9px !important;
              margin-bottom: 2px !important;
              padding-bottom: 1px !important;
            }
            .bank-row-item { grid-template-columns: 80px 1fr; margin-bottom: 1px !important; }
            .bank-row-item input { font-size: 10px !important; }
            
            .notes-column-box { border: none !important; background: transparent !important; }
            
            .signature-box { min-height: 120px !important; }
            .signature-image-container { height: 95px !important; margin: 1px 0 !important; }
            
            .print-hide { display: none !important; }
            .print-show { display: inline-block !important; }
            
            .watermark-stamp {
              opacity: 0.16 !important;
              top: 52% !important;
              width: 220px !important;
              height: 90px !important;
            }
            .watermark-stamp-title { font-size: 38px !important; }
            
            .col-act, td:last-child { display: none !important; }
          }
          .print-show { display: none; }
        `}
      </style>

      {/* Pop-up Dialog Cetak (Status Pembayaran) */}
      {showPrintModal && (
        <div className="modal-overlay no-print">
          <div className="modal-box">
            <h4 className="modal-title">Pilih Status Transaksi</h4>
            <p className="modal-desc">
              Tentukan status pelunasan faktur ini untuk ditampilkan pada lembar cetak PDF.
            </p>
            <div className="modal-buttons">
              <button className="btn-modal-paid" onClick={() => triggerPrint(true)}>
                <Check size={18} /> LUNAS (Dengan Watermark)
              </button>
              <button className="btn-modal-unpaid" onClick={() => triggerPrint(false)}>
                <X size={18} /> BELUM LUNAS (Polos)
              </button>
              <button className="btn-modal-cancel" onClick={() => setShowPrintModal(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">

        {/* Editor Faktur Utama */}
        <div className="invoice-main">

          {/* Stempel Watermark LUNAS */}
          {isPaid && (
            <div className="watermark-stamp">
              <span className="watermark-stamp-title">LUNAS</span>
              <span className="watermark-stamp-subtitle">CV ACS MULTI TECH</span>
            </div>
          )}

          {/* Bagian Branding Logo & Judul Dokumen */}
          <div className="brand-container">
            <div className="logo-wrapper">
              <img
                src={logo}
                alt="Logo Perusahaan"
                className="logo-preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="no-print" style={{ marginTop: '5px' }}>
                <label className="upload-label">
                  <Upload size={14} /> Ganti Logo Manually
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            <div className="invoice-header-info">
              <div className="invoice-title">Invoice</div>
              <div className="invoice-subtitle">(Asli untuk Penerima / Original for Recipient)</div>
              <div className="no-print" style={{ marginTop: '8px', fontSize: '12px' }}>
                Status Dokumen: {isPaid ? (
                  <span style={{ color: '#10b981', fontWeight: 'bold', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px' }}>LUNAS</span>
                ) : (
                  <span style={{ color: '#f59e0b', fontWeight: 'bold', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>BELUM LUNAS</span>
                )}
              </div>
            </div>
          </div>

          {/* Grid Informasi Atas */}
          <div className="grid-info">
            {/* Kolom 1: Data Penjual */}
            <div className="address-block">
              <div className="address-title">Penjual (Sold By) :</div>
              <input
                type="text"
                name="sellerName"
                value={invoiceData.sellerName}
                onChange={handleInvoiceChange}
                placeholder="Nama Perusahaan Penjual"
                style={{ fontWeight: 'bold', fontSize: '12.5px', color: '#0d9488' }}
              />
              <textarea
                name="sellerAddress"
                value={invoiceData.sellerAddress}
                onChange={handleInvoiceChange}
                placeholder="Alamat Penjual"
                rows="3"
                style={{ fontWeight: '500' }}
              ></textarea>
              <div style={{ marginTop: '5px' }}>
                <div className="meta-row">
                  <span className="meta-label">No. Telepon:</span>
                  <input type="text" name="sellerPhone" value={invoiceData.sellerPhone} onChange={handleInvoiceChange} />
                </div>
                <div className="meta-row">
                  <span className="meta-label">Email:</span>
                  <input type="email" name="sellerEmail" value={invoiceData.sellerEmail} onChange={handleInvoiceChange} />
                </div>
              </div>
            </div>

            {/* Kolom 2: Tagihan Kepada */}
            <div className="address-block" style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '15px' }}>
              <div className="address-title">Tagihan Kepada (Billing To) :</div>
              <input
                type="text"
                name="billingName"
                value={invoiceData.billingName}
                onChange={handleInvoiceChange}
                placeholder="Nama Penerima Tagihan"
                style={{ fontWeight: 'bold' }}
              />
              <textarea
                name="billingAddress"
                value={invoiceData.billingAddress}
                onChange={handleInvoiceChange}
                placeholder="Alamat Lengkap Penagihan"
                rows="3"
              ></textarea>
              <div className="meta-row">
                <span className="meta-label">No. Telepon:</span>
                <input type="text" name="billingPhone" value={invoiceData.billingPhone} onChange={handleInvoiceChange} />
              </div>
            </div>

            {/* Kolom 3: Detail Faktur & Pemesanan */}
            <div className="address-block" style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '15px' }}>
              <div className="address-title">Detail Faktur & Pemesanan :</div>
              <div className="meta-row">
                <span className="meta-label">No. Faktur:</span>
                <input type="text" name="invoiceNumber" value={invoiceData.invoiceNumber} onChange={handleInvoiceChange} style={{ fontWeight: 'bold' }} />
              </div>
              <div className="meta-row">
                <span className="meta-label">Tanggal Faktur:</span>
                <input type="date" name="date" value={invoiceData.date} onChange={handleInvoiceChange} />
              </div>
              <div className="meta-row">
                <span className="meta-label">Jatuh Tempo:</span>
                <input type="date" name="dueDate" value={invoiceData.dueDate} onChange={handleInvoiceChange} />
              </div>
              <div style={{ marginTop: '8px', borderTop: '1px dashed #d1d5db', paddingTop: '8px' }}>
                <div className="meta-row">
                  <span className="meta-label">No. PO / Pesanan:</span>
                  <input type="text" name="orderNumber" value={invoiceData.orderNumber} onChange={handleInvoiceChange} />
                </div>
                <div className="meta-row">
                  <span className="meta-label">Tanggal Pesanan:</span>
                  <input type="date" name="orderDate" value={invoiceData.orderDate} onChange={handleInvoiceChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Tabel Transaksi Utama (FONT ISI TETAP BESAR) */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="col-no">No</th>
                  <th className="col-desc">Deskripsi Jasa / Barang</th>
                  <th className="col-uprice">Harga Satuan</th>
                  <th className="col-qty">Qty</th>
                  <th className="col-net">Jumlah Bersih</th>
                  <th className="col-trate">PPN (%)</th>
                  <th className="col-tamount">Jumlah Pajak</th>
                  <th className="col-total">Total Akhir</th>
                  <th className="col-act no-print"></th>
                </tr>
              </thead>
              <tbody>
                {calculatedItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="cell-center">{index + 1}</td>
                    <td>
                      <input
                        type="text"
                        style={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        placeholder="Nama Produk/Jasa"
                      />
                    </td>
                    <td className="col-uprice">
                      <input
                        type="number"
                        min="0"
                        className="text-right print-hide"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                      />
                      <span className="print-show text-right" style={{ display: 'block' }}>
                        {formatIDR(item.price)}
                      </span>
                    </td>
                    <td className="col-qty">
                      <input
                        type="number"
                        min="1"
                        className="text-center"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="col-net">
                      {formatIDR(item.netAmount)}
                    </td>
                    <td className="col-trate">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="text-center print-hide"
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                      />
                      <span className="print-show text-center" style={{ display: 'block' }}>
                        {item.taxRate}%
                      </span>
                    </td>
                    <td className="col-tamount">
                      {formatIDR(item.taxAmount)}
                    </td>
                    <td className="col-total">
                      {formatIDR(item.totalAmount)}
                    </td>
                    <td className="col-act no-print">
                      <button onClick={() => removeItem(item.id)} className="btn btn-icon" title="Hapus">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Baris Total */}
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #111827', fontSize: '16px', background: '#f9fafb' }}>
                  <td colSpan="2" className="cell-center" style={{ padding: '12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SUBTOTAL BIAYA:</td>
                  <td></td>
                  <td className="cell-center">{items.reduce((acc, i) => acc + i.quantity, 0)}</td>
                  <td className="cell-right">{formatIDR(totalNet)}</td>
                  <td></td>
                  <td className="cell-right">{formatIDR(totalTax)}</td>
                  <td className="cell-right">{formatIDR(totalNet + totalTax)}</td>
                  <td className="no-print"></td>
                </tr>

                <tr style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  <td colSpan="2" className="cell-center" style={{ padding: '10px 0', color: '#ef4444', textTransform: 'uppercase' }}>POTONGAN DISKON (Rp):</td>
                  <td colSpan="3" style={{ padding: '10px 0' }}>
                    <input
                      type="number"
                      min="0"
                      className="text-right print-hide"
                      value={discountValue || ''}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      style={{ width: '160px', padding: '6px 8px', margin: 0, border: '2px dashed #ef4444', color: '#ef4444', fontWeight: 'bold', float: 'right', marginRight: '4px', fontSize: '15px' }}
                      placeholder="Rp 0"
                    />
                    <span className="print-show" style={{ color: '#ef4444', float: 'right', marginRight: '4px' }}>-{formatIDR(discountValue)}</span>
                  </td>
                  <td colSpan="2"></td>
                  <td className="cell-right" style={{ padding: '10px 0', color: '#ef4444' }}>-{formatIDR(discountValue)}</td>
                  <td className="no-print"></td>
                </tr>

                <tr style={{ fontWeight: '900', borderBottom: '2px solid #111827', background: '#f0fdfa', fontSize: '18px' }}>
                  <td colSpan="2" className="cell-center" style={{ padding: '15px 0', color: '#0d9488', textTransform: 'uppercase', letterSpacing: '1px' }}>TOTAL AKHIR PEMBAYARAN:</td>
                  <td colSpan="5"></td>
                  <td className="cell-right" style={{ color: '#0d9488', fontWeight: '900', padding: '15px 0' }}>{formatIDR(grandTotal)}</td>
                  <td className="no-print"></td>
                </tr>
              </tbody>
            </table>

            <button onClick={addItem} className="btn btn-text no-print" style={{ marginTop: '8px' }}>
              <Plus size={14} /> Tambah Baris Transaksi Baru
            </button>
          </div>

          {/* Bagian Bawah */}
          <div className="bottom-section">

            {/* Kolom 1: Terbilang & Informasi Bank */}
            <div>
              <div className="amount-words-box">
                <div style={{ fontWeight: 'bold', fontSize: '9.5px', marginBottom: '3px', textTransform: 'uppercase', color: '#4b5563' }}>
                  Terbilang (Amount in Words):
                </div>
                <div style={{ fontStyle: 'italic', fontSize: '11.5px', fontWeight: 'bold', color: '#1f2937' }}>
                  {getAmountInWords(grandTotal)}
                </div>
              </div>

              <div className="bank-info-box">
                <div className="bank-info-header">
                  <div className="bank-info-title">
                    <Building2 size={13} /> Metode Transfer Bank:
                  </div>
                  <button onClick={addBank} className="btn btn-text no-print" style={{ padding: '1px 5px', fontSize: '10.5px' }}>
                    + Bank
                  </button>
                </div>

                <div className="meta-row" style={{ marginBottom: '6px', borderBottom: '1px dashed #99f6e4', paddingBottom: '4px' }}>
                  <span style={{ width: '100px', fontWeight: 'bold', color: '#0f766e' }}>A.N :</span>
                  <input
                    type="text"
                    name="bankAccountName"
                    value={invoiceData.bankAccountName}
                    onChange={handleInvoiceChange}
                    style={{ background: 'transparent', border: 'none', margin: 0, padding: 0, fontWeight: 'bold', color: '#111827', fontSize: '11.5px' }}
                  />
                </div>

                <div className="bank-grid-header">
                  <div>Nama Bank</div>
                  <div>No. Rekening</div>
                  <div className="no-print"></div>
                </div>

                {bankAccounts.map((acc) => (
                  <div key={acc.id} className="bank-row-item">
                    <div>
                      <input type="text" value={acc.bankName} onChange={(e) => handleBankChange(acc.id, 'bankName', e.target.value)} style={{ fontWeight: 'bold', color: '#0f766e' }} />
                    </div>
                    <div>
                      <input type="text" value={acc.accountNo} onChange={(e) => handleBankChange(acc.id, 'accountNo', e.target.value)} style={{ fontWeight: '600' }} />
                    </div>
                    <div className="no-print" style={{ textAlign: 'center' }}>
                      <button onClick={() => removeBank(acc.id)} className="btn-icon-small" title="Hapus Rekening" style={{ border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom 2: Syarat & Ketentuan Pembayaran */}
            <div className="notes-column-box">
              <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: '#374151', letterSpacing: '0.3px' }}>
                Syarat & Ketentuan Pembayaran:
              </strong>
              <textarea
                name="notes"
                value={invoiceData.notes}
                onChange={handleInvoiceChange}
                rows="6"
                style={{ marginTop: '5px', width: '100%', height: '115px' }}
                placeholder="Tulis Syarat Pembayaran..."
              ></textarea>
            </div>

            {/* Kolom 3: Box Tanda Tangan */}
            <div className="signature-box">
              <div>
                <span style={{ fontSize: '11px' }}>Hormat Kami,</span>
                <div style={{ fontWeight: 'bold', marginTop: '2px', color: '#0d9488', fontSize: '11.5px' }}>{invoiceData.sellerName || 'CV ACS MULTI TECHNOLOGY'}</div>
              </div>

              <div className="signature-image-container">
                <img src="/ttd.png" alt="Tanda Tangan Mohammad Munir" className="signature-graphic-file" />
              </div>

              <div>
                <div style={{ borderTop: '1.2px dashed #111827', display: 'inline-block', width: '100%', paddingTop: '5px', fontSize: '10.5px', fontWeight: 'bold' }}>
                  Penandatangan Sah (Authorised Signatory)
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sidebar Kanan */}
        <div className="sidebar no-print">
          <div className="control-card">
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', color: '#0d9488' }}>
              Aksi & Pengaturan
            </h3>
            <button onClick={() => setShowPrintModal(true)} className="btn btn-primary" style={{ marginBottom: '15px' }}>
              <Printer size={18} /> Cetak / Simpan PDF
            </button>
            <div style={{ fontSize: '11.5px', color: '#4b5563', lineHeight: '1.45' }}>
              <div className="control-group" style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Potongan Diskon (Rp)</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="0" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} style={{ paddingRight: '35px', border: '1px solid #d1d5db', background: 'white' }} />
                  <span style={{ position: 'absolute', right: '10px', top: '6px', color: '#6b7280', fontSize: '12px', fontWeight: 'bold' }}>Rp</span>
                </div>
              </div>
              <p><strong>Informasi Cetak:</strong></p>
              <ul style={{ paddingLeft: '12px', marginTop: '4px', marginBottom: '12px' }}>
                <li>Faktur didesain otomatis dalam posisi <strong>Landscape (Tidur)</strong>.</li>
                <li>Ukuran kertas direkomendasikan <strong>A4</strong>.</li>
                <li>Menghasilkan format **1 halaman penuh** yang super ringkas dan padat.</li>
              </ul>
              <p><strong>Rincian Rekening:</strong></p>
              <ul style={{ paddingLeft: '12px', marginTop: '4px', marginBottom: '10px' }}>
                <li><strong>BRI:</strong> 612001021425536</li>
                <li><strong>Mandiri:</strong> 1430030731481</li>
                <li><strong>BCA:</strong> 2631302736</li>
                <li>Atas Nama <strong>MOHAMMAD MUNIR</strong></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}