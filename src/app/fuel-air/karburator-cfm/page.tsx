'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown, Wind } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// The actual calculator component
const KalkulatorKarburatorCFM: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [engineSize, setEngineSize] = useState<string>(''); // In Cubic Inches (CID)
  const [maxRpm, setMaxRpm] = useState<string>('');
  
  const [cfm, setCfm] = useState<number | null>(null);
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

    const engineSizeNum = parseFloat(engineSize);
    const maxRpmNum = parseFloat(maxRpm);

    if (isNaN(engineSizeNum) || isNaN(maxRpmNum) || engineSizeNum <= 0 || maxRpmNum <= 0) {
      setError("Mohon masukkan Ukuran Mesin (CID) dan Max RPM yang valid.");
      setCfm(null);
      return;
    }

    // Rumus Kebutuhan CFM = (Ukuran Mesin (CID) * Max RPM * Efisiensi Volumetrik) / 3456
    // Kita asumsikan efisiensi volumetrik standar untuk mesin jalanan adalah 85% (0.85)
    const volumetricEfficiency = 0.85;
    const calculatedCfm = (engineSizeNum * maxRpmNum * volumetricEfficiency) / 3456;
    setCfm(calculatedCfm);

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
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700"><b>Kebutuhan CFM</b> (Cubic Feet per Minute) adalah volume udara yang dibutuhkan mesin untuk mencapai potensi tenaganya.</p></div></div></div>
          <div className="space-y-4">
            <div><label htmlFor="engineSize" className="block text-sm font-medium text-slate-700 mb-1">Ukuran Mesin (CID - Cubic Inch)</label><input type="number" id="engineSize" value={engineSize} onChange={(e) => setEngineSize(e.target.value)} placeholder="Contoh: 350" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
            <div><label htmlFor="maxRpm" className="block text-sm font-medium text-slate-700 mb-1">Target RPM Maksimal</label><input type="number" id="maxRpm" value={maxRpm} onChange={(e) => setMaxRpm(e.target.value)} placeholder="Contoh: 6000" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
          </div>
          {error && <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="mt-6"><button onClick={handleCalculate} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><SlidersHorizontal className="inline-block mr-2" size={20}/> Hitung</button></div>
        </div>
      </div>

      {/* Right Column: Persistent Results and Formula */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Kebutuhan CFM Optimal:</h2>
          <p className="text-5xl font-extrabold text-green-600 mt-2">{cfm ? cfm.toFixed(0) : '--'} <span className="text-3xl font-medium text-slate-500">CFM</span></p>
        </div>
        
        <div className="border rounded-xl overflow-hidden bg-white shadow-lg">
          <button onClick={() => setIsFormulaVisible(!isFormulaVisible)} className="w-full flex justify-between items-center p-4 hover:bg-slate-50 focus:outline-none">
            <span className="font-semibold text-slate-700">Lihat Rumus Perhitungan</span>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isFormulaVisible ? 'rotate-180' : ''}`} />
          </button>
          {isFormulaVisible && (
            <div className="p-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Rumus yang digunakan (untuk mesin 4-tak):</p>
              <div className="p-3 bg-slate-100 rounded-lg text-center font-mono text-slate-800 text-sm sm:text-base">
                <p>CFM = (CID × RPM × 0.85) / 3456</p>
              </div>
               <p className="text-xs text-slate-500 mt-3">
                * <b>CID</b> adalah Ukuran Mesin dalam Cubic Inch. <br/>
                * <b>0.85</b> adalah asumsi Efisiensi Volumetrik (85%).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function KarburatorCFMPage() {
  return (
    <AppLayout title="Kalkulator Kebutuhan CFM">
      <KalkulatorKarburatorCFM />
    </AppLayout>
  );
}
