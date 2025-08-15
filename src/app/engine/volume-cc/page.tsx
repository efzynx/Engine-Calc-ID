'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
// ADDED: Import useAuth to get user data
import { useAuth } from '@/context/auth-context';
// ADDED: Import Firestore functions to update data
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// The actual calculator component
const KalkulatorVolume: React.FC = () => {
  // Get user data from our context
  const { user, userProfile } = useAuth();

  const [bore, setBore] = useState<string>('');
  const [stroke, setStroke] = useState<string>('');
  const [cylinders, setCylinders] = useState<string>('1');
  const [volume, setVolume] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormulaVisible, setIsFormulaVisible] = useState(false);

  const handleCalculate = async () => {
    setError(null);

    // --- USAGE LIMIT LOGIC START ---
    if (user && userProfile) {
      const today = new Date().toDateString();
      // Firestore timestamp needs to be converted to a JS Date to be compared
      const lastCalcDate = userProfile.lastCalculationDate?.toDate().toDateString();

      if (lastCalcDate === today && userProfile.calculationCount >= 50) {
        setError("Anda telah mencapai batas perhitungan harian (50 kali). Upgrade ke Premium untuk akses tanpa batas.");
        return;
      }
    }
    // --- USAGE LIMIT LOGIC END ---

    const boreNum = parseFloat(bore);
    const strokeNum = parseFloat(stroke);
    const cylinderCount = parseInt(cylinders, 10);

    if (isNaN(boreNum) || isNaN(strokeNum) || boreNum <= 0 || strokeNum <= 0 || isNaN(cylinderCount) || cylinderCount <= 0) {
      setError("Mohon masukkan semua nilai dengan benar.");
      setVolume(null);
      return;
    }

    const singleCylinderVolume = (Math.PI / 4) * (boreNum * boreNum) * strokeNum / 1000;
    const totalVolume = singleCylinderVolume * cylinderCount;
    setVolume(totalVolume);

    // --- UPDATE FIRESTORE DATA START ---
    if (user && userProfile) {
      const userDocRef = doc(db, 'users', user.uid);
      const today = new Date().toDateString();
      const lastCalcDate = userProfile.lastCalculationDate?.toDate().toDateString();

      if (lastCalcDate === today) {
        // If calculation was already done today, just increment
        await updateDoc(userDocRef, {
          calculationCount: increment(1)
        });
      } else {
        // If it's a new day, reset the count
        await updateDoc(userDocRef, {
          calculationCount: 1,
          lastCalculationDate: serverTimestamp() // Use server time for consistency
        });
      }
    }
    // --- UPDATE FIRESTORE DATA END ---
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left Column: Calculator Form */}
      <div className="lg:col-span-3">
        <div className="w-full rounded-xl bg-white p-6 sm:p-8 shadow-lg">
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700"><b>Volume Mesin (CC)</b> adalah total volume dari semua silinder di dalam mesin.</p></div></div></div>
          <div className="space-y-4">
            <div><label htmlFor="bore" className="block text-sm font-medium text-slate-700 mb-1">Diameter Piston / Bore (mm)</label><input type="number" id="bore" value={bore} onChange={(e) => setBore(e.target.value)} placeholder="Contoh: 58.5" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
            <div><label htmlFor="stroke" className="block text-sm font-medium text-slate-700 mb-1">Langkah Piston / Stroke (mm)</label><input type="number" id="stroke" value={stroke} onChange={(e) => setStroke(e.target.value)} placeholder="Contoh: 57.9" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
            <div><label htmlFor="cylinders" className="block text-sm font-medium text-slate-700 mb-1">Jumlah Silinder</label><input type="number" id="cylinders" value={cylinders} onChange={(e) => setCylinders(e.target.value)} min="1" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
          </div>
          {error && <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="mt-6"><button onClick={handleCalculate} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><SlidersHorizontal className="inline-block mr-2" size={20}/> Hitung</button></div>
        </div>
      </div>

      {/* Right Column: Persistent Results and Formula */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Hasil Perhitungan:</h2>
          <p className="text-5xl font-extrabold text-green-600 mt-2">{volume ? volume.toFixed(2) : '--'} <span className="text-3xl font-medium text-slate-500">CC</span></p>
          {volume && parseInt(cylinders, 10) > 1 && <p className="text-sm text-slate-600 mt-1">Total untuk {cylinders} silinder.</p>}
        </div>
        
        <div className="border rounded-xl overflow-hidden bg-white shadow-lg">
          <button onClick={() => setIsFormulaVisible(!isFormulaVisible)} className="w-full flex justify-between items-center p-4 hover:bg-slate-50 focus:outline-none">
            <span className="font-semibold text-slate-700">Lihat Rumus Perhitungan</span>
            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isFormulaVisible ? 'rotate-180' : ''}`} />
          </button>
          {isFormulaVisible && (
            <div className="p-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Rumus yang digunakan adalah:</p>
              <div className="p-3 bg-slate-100 rounded-lg text-center font-mono text-slate-800 text-sm sm:text-base">
                <p>Volume = (0.7854 × Bore² × Stroke × Jumlah Silinder) / 1000</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function HomePage() {
  return (
    <AppLayout title="Kalkulator Volume (CC)">
      <KalkulatorVolume />
    </AppLayout>
  );
}
