'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown, CircleDot } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// The actual calculator component
const KalkulatorRekomendasiKlep: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [bore, setBore] = useState<string>('');
  const [valveCount, setValveCount] = useState<string>('2'); // '2' for 2-valve, '4' for 4-valve
  
  const [klepIn, setKlepIn] = useState<number | null>(null);
  const [klepEx, setKlepEx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormulaVisible, setIsFormulaVisible] = useState(false);

  const handleCalculate = async () => {
    setError(null);
    setKlepIn(null);
    setKlepEx(null);

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

    const boreNum = parseFloat(bore);

    if (isNaN(boreNum) || boreNum <= 0) {
      setError("Mohon masukkan Diameter Piston (Bore) yang valid.");
      return;
    }

    let calculatedKlepIn = 0;
    if (valveCount === '2') {
      // Untuk mesin 2 klep, ukuran klep IN idealnya sekitar 50% dari diameter piston
      calculatedKlepIn = boreNum * 0.50;
    } else { // valveCount === '4'
      // Untuk mesin 4 klep, ukuran per klep IN sekitar 33-35% dari diameter piston
      calculatedKlepIn = boreNum * 0.34;
    }
    
    // Ukuran klep EX umumnya sekitar 85% dari ukuran klep IN
    const calculatedKlepEx = calculatedKlepIn * 0.85;

    setKlepIn(calculatedKlepIn);
    setKlepEx(calculatedKlepEx);

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
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700"><b>Rekomendasi Ukuran Klep</b> memberikan estimasi diameter klep IN dan EX berdasarkan diameter piston.</p></div></div></div>
          <div className="space-y-4">
            <div><label htmlFor="bore" className="block text-sm font-medium text-slate-700 mb-1">Diameter Piston / Bore (mm)</label><input type="number" id="bore" value={bore} onChange={(e) => setBore(e.target.value)} placeholder="Contoh: 70" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Klep per Silinder</label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setValveCount('2')} className={`p-3 rounded-lg border-2 text-center text-slate-600 ${valveCount === '2' ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>2 Klep</button>
                <button onClick={() => setValveCount('4')} className={`p-3 rounded-lg border-2 text-center text-slate-600 ${valveCount === '4' ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>4 Klep</button>
              </div>
            </div>
          </div>
          {error && <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="mt-6"><button onClick={handleCalculate} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><SlidersHorizontal className="inline-block mr-2" size={20}/> Hitung</button></div>
        </div>
      </div>

      {/* Right Column: Persistent Results and Formula */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Rekomendasi Ukuran:</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Klep IN (Intake)</span>
              <p className="text-3xl font-extrabold text-green-600">{klepIn ? klepIn.toFixed(1) : '--'} <span className="text-xl font-medium text-slate-500">mm</span></p>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Klep EX (Exhaust)</span>
              <p className="text-3xl font-extrabold text-green-600">{klepEx ? klepEx.toFixed(1) : '--'} <span className="text-xl font-medium text-slate-500">mm</span></p>
            </div>
            {valveCount === '4' && <p className="text-xs text-slate-500 text-right pt-2">*Ukuran per satu klep.</p>}
          </div>
        </div>
        
        <div className="border rounded-xl overflow-hidden bg-white shadow-lg">
          <button onClick={() => setIsFormulaVisible(!isFormulaVisible)} className="w-full flex justify-between items-center p-4 hover:bg-slate-50 focus:outline-none">
            <span className="font-semibold text-slate-700">Lihat Rumus Perhitungan</span>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isFormulaVisible ? 'rotate-180' : ''}`} />
          </button>
          {isFormulaVisible && (
            <div className="p-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Rumus umum yang digunakan:</p>
              <div className="p-3 bg-slate-100 rounded-lg text-center font-mono text-slate-800 text-sm">
                <p>Klep IN (2 klep) = Bore × 0.50</p>
                <p>Klep IN (4 klep) = Bore × 0.34</p>
                <p className="mt-2">Klep EX = Ukuran Klep IN × 0.85</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function RekomendasiKlepPage() {
  return (
    <AppLayout title="Rekomendasi Ukuran Klep">
      <KalkulatorRekomendasiKlep />
    </AppLayout>
  );
}
