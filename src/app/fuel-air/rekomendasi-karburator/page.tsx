'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown, Droplet } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// The actual calculator component
const KalkulatorRekomendasiKarbu: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [engineCC, setEngineCC] = useState<string>('');
  const [engineType, setEngineType] = useState<string>('harian'); // 'harian', 'semi', 'kompetisi'
  
  const [rekomendasi, setRekomendasi] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormulaVisible, setIsFormulaVisible] = useState(false);

  const handleCalculate = async () => {
    setError(null);

    // --- USAGE LIMIT LOGIC ---
    if (user && userProfile && userProfile.status === 'Free User') {
      const today = new Date().toDateString();
      const lastCalcDate = userProfile.lastCalculationDate?.toDate().toDateString();

      if (lastCalcDate === today && userProfile.calculationCount >= 50) {
        setError("Anda telah mencapai batas perhitungan harian (50 kali).");
        return;
      }
    }
    // --- END USAGE LIMIT LOGIC ---

    const ccNum = parseFloat(engineCC);

    if (isNaN(ccNum) || ccNum <= 0) {
      setError("Mohon masukkan Volume Mesin (CC) yang valid.");
      setRekomendasi(null);
      return;
    }

    // Rumus empiris untuk rekomendasi ukuran venturi karburator
    // Ukuran (mm) = K * sqrt(CC * Target RPM / 1000)
    // K dan Target RPM disesuaikan berdasarkan tipe penggunaan
    let k_konstanta = 0.8;
    let target_rpm = 9000;

    if (engineType === 'semi') {
      k_konstanta = 0.85;
      target_rpm = 11000;
    } else if (engineType === 'kompetisi') {
      k_konstanta = 0.9;
      target_rpm = 13000;
    }

    const calculatedSize = k_konstanta * Math.sqrt((ccNum * target_rpm) / 1000);
    
    // Pembulatan ke ukuran karburator umum terdekat (kelipatan 2)
    const roundedSize = Math.round(calculatedSize / 2) * 2;
    setRekomendasi(roundedSize);

    // --- UPDATE FIRESTORE DATA ---
    if (user && userProfile) {
      const userDocRef = doc(db, 'users', user.uid);
      const today = new Date().toDateString();
      const lastCalcDate = userProfile.lastCalculationDate?.toDate().toDateString();

      if (lastCalcDate === today) {
        await updateDoc(userDocRef, { calculationCount: increment(1) });
      } else {
        await updateDoc(userDocRef, {
          calculationCount: 1,
          lastCalculationDate: serverTimestamp()
        });
      }
    }
    // --- END UPDATE FIRESTORE DATA ---
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left Column: Calculator Form */}
      <div className="lg:col-span-3">
        <div className="w-full rounded-xl bg-white p-6 sm:p-8 shadow-lg">
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700"><b>Rekomendasi Ukuran Karburator</b> memberikan estimasi ukuran venturi (mm) yang ideal untuk mesin Anda.</p></div></div></div>
          <div className="space-y-4">
            <div><label htmlFor="engineCC" className="block text-sm font-medium text-slate-700 mb-1">Volume Mesin (CC)</label><input type="number" id="engineCC" value={engineCC} onChange={(e) => setEngineCC(e.target.value)} placeholder="Contoh: 155" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
            <div>
              <label htmlFor="engineType" className="block text-sm font-medium text-slate-700 mb-1">Tipe Penggunaan Mesin</label>
              <select id="engineType" value={engineType} onChange={(e) => setEngineType(e.target.value)} className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900">
                <option value="harian">Harian / Standar</option>
                <option value="semi">Touring / Semi Balap</option>
                <option value="kompetisi">Kompetisi / Balap Penuh</option>
              </select>
            </div>
          </div>
          {error && <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="mt-6"><button onClick={handleCalculate} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><SlidersHorizontal className="inline-block mr-2" size={20}/> Dapatkan Rekomendasi</button></div>
        </div>
      </div>

      {/* Right Column: Persistent Results and Formula */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Rekomendasi Ukuran Venturi:</h2>
          <p className="text-5xl font-extrabold text-green-600 mt-2">{rekomendasi ? rekomendasi : '--'} <span className="text-3xl font-medium text-slate-500">mm</span></p>
        </div>
        
        <div className="border rounded-xl overflow-hidden bg-white shadow-lg">
          <button onClick={() => setIsFormulaVisible(!isFormulaVisible)} className="w-full flex justify-between items-center p-4 hover:bg-slate-50 focus:outline-none">
            <span className="font-semibold text-slate-700">Lihat Rumus Perhitungan</span>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isFormulaVisible ? 'rotate-180' : ''}`} />
          </button>
          {isFormulaVisible && (
            <div className="p-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Rumus empiris yang digunakan:</p>
              <div className="p-3 bg-slate-100 rounded-lg text-center font-mono text-slate-800 text-sm sm:text-base">
                <p>Ukuran = K × √(CC × RPM) / 1000</p>
              </div>
               <p className="text-xs text-slate-500 mt-3">
                * <b>K</b> dan <b>RPM</b> adalah konstanta yang disesuaikan berdasarkan tipe penggunaan mesin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function RekomendasiKarbuPage() {
  return (
    <AppLayout title="Rekomendasi Ukuran Karburator">
      <KalkulatorRekomendasiKarbu />
    </AppLayout>
  );
}
