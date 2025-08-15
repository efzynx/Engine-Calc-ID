'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown, FastForward } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// The actual calculator component
const KalkulatorKecepatanPiston: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [stroke, setStroke] = useState<string>('');
  const [rpm, setRpm] = useState<string>('');
  
  const [pistonSpeed, setPistonSpeed] = useState<number | null>(null);
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

    const strokeNum = parseFloat(stroke);
    const rpmNum = parseFloat(rpm);

    if (isNaN(strokeNum) || isNaN(rpmNum) || strokeNum <= 0 || rpmNum <= 0) {
      setError("Mohon masukkan nilai Langkah (stroke) dan RPM yang valid.");
      setPistonSpeed(null);
      return;
    }

    // Piston Speed Formula: (Stroke * RPM) / 30000
    const calculatedSpeed = (strokeNum * rpmNum) / 30000;
    setPistonSpeed(calculatedSpeed);

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
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700"><b>Kecepatan Piston</b> adalah kecepatan rata-rata piston bergerak dari titik mati atas ke titik mati bawah.</p></div></div></div>
          <div className="space-y-4">
            <div><label htmlFor="stroke" className="block text-sm font-medium text-slate-700 mb-1">Langkah Piston / Stroke (mm)</label><input type="number" id="stroke" value={stroke} onChange={(e) => setStroke(e.target.value)} placeholder="Contoh: 57.9" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
            <div><label htmlFor="rpm" className="block text-sm font-medium text-slate-700 mb-1">Putaran Mesin (RPM)</label><input type="number" id="rpm" value={rpm} onChange={(e) => setRpm(e.target.value)} placeholder="Contoh: 9000" className="w-full rounded-md border-slate-300 bg-white p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900"/></div>
          </div>
          {error && <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="mt-6"><button onClick={handleCalculate} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"><SlidersHorizontal className="inline-block mr-2" size={20}/> Hitung</button></div>
        </div>
      </div>

      {/* Right Column: Persistent Results and Formula */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Hasil Perhitungan:</h2>
          <p className="text-5xl font-extrabold text-green-600 mt-2">{pistonSpeed ? pistonSpeed.toFixed(2) : '--'} <span className="text-3xl font-medium text-slate-500">m/s</span></p>
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
                <p>Kecepatan = (Stroke × RPM) / 30000</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function KecepatanPistonPage() {
  return (
    <AppLayout title="Kalkulator Kecepatan Piston">
      <KalkulatorKecepatanPiston />
    </AppLayout>
  );
}
