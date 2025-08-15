'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// Interface for tire data
interface TireInfo {
    diameter: number;
    circumference: number;
}

// Interface for comparison results
interface ComparisonResult {
    diameterDiff: number;
    circumferenceDiffPercent: number;
    speedoAt100: number;
}

// The actual calculator component
const KalkulatorPerbandinganBan: React.FC = () => {
  const { user, userProfile } = useAuth();

  // State for stock tire
  const [stockWidth, setStockWidth] = useState<string>('');
  const [stockRatio, setStockRatio] = useState<string>('');
  const [stockRim, setStockRim] = useState<string>('');

  // State for new tire
  const [newWidth, setNewWidth] = useState<string>('');
  const [newRatio, setNewRatio] = useState<string>('');
  const [newRim, setNewRim] = useState<string>('');

  const [stockTireInfo, setStockTireInfo] = useState<TireInfo | null>(null);
  const [newTireInfo, setNewTireInfo] = useState<TireInfo | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // ADDED: State for formula visibility
  const [isFormulaVisible, setIsFormulaVisible] = useState(false);

  const calculateTireInfo = (widthStr: string, ratioStr: string, rimStr: string): TireInfo | null => {
      const width = parseFloat(widthStr);
      const ratio = parseFloat(ratioStr);
      const rim = parseFloat(rimStr);
      if (isNaN(width) || isNaN(ratio) || isNaN(rim)) return null;

      const sidewallHeight = width * (ratio / 100);
      const diameter = (sidewallHeight * 2) + (rim * 25.4);
      const circumference = diameter * Math.PI;
      return { diameter, circumference };
  };

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

    const stockInfo = calculateTireInfo(stockWidth, stockRatio, stockRim);
    const newInfo = calculateTireInfo(newWidth, newRatio, newRim);

    if (!stockInfo || !newInfo) {
      setError("Mohon isi semua kolom ukuran ban dengan angka yang valid.");
      setStockTireInfo(null);
      setNewTireInfo(null);
      setComparison(null);
      return;
    }

    setStockTireInfo(stockInfo);
    setNewTireInfo(newInfo);

    const diameterDiff = newInfo.diameter - stockInfo.diameter;
    const circumferenceDiffPercent = ((newInfo.circumference - stockInfo.circumference) / stockInfo.circumference) * 100;
    const speedoAt100 = 100 * (stockInfo.circumference / newInfo.circumference);

    setComparison({ diameterDiff, circumferenceDiffPercent, speedoAt100 });

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
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700">Bandingkan ukuran ban standar dengan ban baru untuk melihat perbedaannya.</p></div></div></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Stock Tire Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Ukuran Ban Standar</h3>
              <div><label htmlFor="stockWidth" className="block text-sm font-medium text-slate-700 mb-1">Lebar (mm)</label><input type="number" id="stockWidth" value={stockWidth} onChange={(e) => setStockWidth(e.target.value)} placeholder="180" className="w-full rounded-md bg-white shadow-sm p-3 text-slate-900 border-slate-300"/></div>
              <div><label htmlFor="stockRatio" className="block text-sm font-medium text-slate-700 mb-1">Aspek Rasio (%)</label><input type="number" id="stockRatio" value={stockRatio} onChange={(e) => setStockRatio(e.target.value)} placeholder="55" className="w-full rounded-md bg-white shadow-sm p-3 text-slate-900 border-slate-300"/></div>
              <div><label htmlFor="stockRim" className="block text-sm font-medium text-slate-700 mb-1">Diameter Velg (inch)</label><input type="number" id="stockRim" value={stockRim} onChange={(e) => setStockRim(e.target.value)} placeholder="17" className="w-full rounded-md bg-white shadow-sm p-3 text-slate-900 border-slate-300"/></div>
            </div>
            {/* New Tire Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Ukuran Ban Baru</h3>
              <div><label htmlFor="newWidth" className="block text-sm font-medium text-slate-700 mb-1">Lebar (mm)</label><input type="number" id="newWidth" value={newWidth} onChange={(e) => setNewWidth(e.target.value)} placeholder="190" className="w-full rounded-md bg-white shadow-sm p-3 text-slate-900 border-slate-300"/></div>
              <div><label htmlFor="newRatio" className="block text-sm font-medium text-slate-700 mb-1">Aspek Rasio (%)</label><input type="number" id="newRatio" value={newRatio} onChange={(e) => setNewRatio(e.target.value)} placeholder="50" className="w-full rounded-md bg-white shadow-sm p-3 text-slate-900 border-slate-300"/></div>
              <div><label htmlFor="newRim" className="block text-sm font-medium text-slate-700 mb-1">Diameter Velg (inch)</label><input type="number" id="newRim" value={newRim} onChange={(e) => setNewRim(e.target.value)} placeholder="17" className="w-full rounded-md bg-white shadow-sm p-3 text-slate-900 border-slate-300"/></div>
            </div>
          </div>

          {error && <div className="mt-6 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="mt-8"><button onClick={handleCalculate} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700"><RefreshCw className="inline-block mr-2" size={20}/> Bandingkan</button></div>
        </div>
      </div>

      {/* Right Column: Persistent Results */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Hasil Perbandingan:</h2>
          <div className="mt-4 space-y-3 border-t pt-3">
            <div className="flex justify-between text-sm"><span className="text-slate-800">Diameter Ban Standar</span><span className="font-mono text-slate-600">{stockTireInfo ? `${stockTireInfo.diameter.toFixed(1)} mm` : '--'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-800">Diameter Ban Baru</span><span className="font-mono text-slate-600">{newTireInfo ? `${newTireInfo.diameter.toFixed(1)} mm` : '--'}</span></div>
            <div className="flex justify-between text-sm font-semibold"><span className="text-slate-800">Perbedaan Diameter</span><span className={`font-mono ${comparison && comparison.diameterDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>{comparison ? `${comparison.diameterDiff.toFixed(1)} mm` : '--'}</span></div>
            <div className="flex justify-between text-sm font-semibold"><span className="text-slate-800">Perbedaan Keliling</span><span className={`font-mono ${comparison && comparison.circumferenceDiffPercent > 0 ? 'text-red-600' : 'text-green-600'}`}>{comparison ? `${comparison.circumferenceDiffPercent.toFixed(2)} %` : '--'}</span></div>
          </div>
        </div>
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Koreksi Speedometer:</h2>
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">Saat speedometer Anda menunjukkan 100 km/jam, kecepatan asli Anda adalah:</p>
            <p className="text-5xl font-extrabold text-blue-600 mt-2">{comparison ? comparison.speedoAt100.toFixed(1) : '--'} <span className="text-3xl font-medium text-slate-500">km/jam</span></p>
          </div>
        </div>
        
        {/* ADDED: Formula Section */}
        <div className="border rounded-xl overflow-hidden bg-white shadow-lg">
          <button onClick={() => setIsFormulaVisible(!isFormulaVisible)} className="w-full flex justify-between items-center p-4 hover:bg-slate-50 focus:outline-none">
            <span className="font-semibold text-slate-700">Lihat Rumus Perhitungan</span>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isFormulaVisible ? 'rotate-180' : ''}`} />
          </button>
          {isFormulaVisible && (
            <div className="p-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Rumus yang digunakan:</p>
              <div className="p-3 bg-slate-100 rounded-lg text-center font-mono text-slate-800 text-xs">
                <p>Tinggi Dinding = Lebar × (Rasio / 100)</p>
                <p className="mt-2">Diameter = (Tinggi Dinding × 2) + (Velg × 25.4)</p>
                <p className="mt-2">Keliling = Diameter × π</p>
                <p className="mt-2">Koreksi = 100 × (Keliling Standar / Keliling Baru)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function PerbandinganBanPage() {
  return (
    <AppLayout title="Perbandingan Ukuran Ban">
      <KalkulatorPerbandinganBan />
    </AppLayout>
  );
}
