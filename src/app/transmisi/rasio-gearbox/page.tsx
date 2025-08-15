'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown, GitCommit } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// Interface for the results
interface RatioResults {
  finalRatio: number;
  totalRatios: number[];
}

// The actual calculator component
const KalkulatorRasioGirboks: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [primaryRatio, setPrimaryRatio] = useState<string>('');
  const [gearRatios, setGearRatios] = useState<string[]>(['', '', '', '', '', '']);
  const [frontSprocket, setFrontSprocket] = useState<string>('');
  const [rearSprocket, setRearSprocket] = useState<string>('');
  
  const [results, setResults] = useState<RatioResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  // ADDED: State for formula visibility
  const [isFormulaVisible, setIsFormulaVisible] = useState(false);

  const handleGearRatioChange = (index: number, value: string) => {
    const newRatios = [...gearRatios];
    newRatios[index] = value;
    setGearRatios(newRatios);
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

    const primaryNum = parseFloat(primaryRatio);
    const frontNum = parseInt(frontSprocket, 10);
    const rearNum = parseInt(rearSprocket, 10);
    const gearRatioNums = gearRatios.map(r => parseFloat(r)).filter(r => !isNaN(r) && r > 0);

    if (isNaN(primaryNum) || isNaN(frontNum) || isNaN(rearNum) || gearRatioNums.length === 0) {
      setError("Mohon isi Rasio Primer, Sproket, dan minimal satu Rasio Gigi.");
      setResults(null);
      return;
    }

    const finalRatio = rearNum / frontNum;
    const totalRatios = gearRatioNums.map(gearRatio => primaryNum * gearRatio * finalRatio);
    
    setResults({ finalRatio, totalRatios });

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
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700"><b>Kalkulator Rasio Girboks</b> membantu menghitung rasio total di setiap percepatan.</p></div></div></div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Rasio Primer & Final</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label htmlFor="primaryRatio" className="block text-sm font-medium text-slate-700 mb-1">Rasio Primer</label><input type="number" id="primaryRatio" value={primaryRatio} onChange={(e) => setPrimaryRatio(e.target.value)} placeholder="Contoh: 3.04" className="w-full rounded-md border-slate-300 bg-white shadow-sm p-3 text-slate-900"/></div>
                <div><label htmlFor="frontSprocket" className="block text-sm font-medium text-slate-700 mb-1">Sproket Depan</label><input type="number" id="frontSprocket" value={frontSprocket} onChange={(e) => setFrontSprocket(e.target.value)} placeholder="Contoh: 15" className="w-full rounded-md border-slate-300 bg-white shadow-sm p-3 text-slate-900"/></div>
                <div><label htmlFor="rearSprocket" className="block text-sm font-medium text-slate-700 mb-1">Sproket Belakang</label><input type="number" id="rearSprocket" value={rearSprocket} onChange={(e) => setRearSprocket(e.target.value)} placeholder="Contoh: 46" className="w-full rounded-md border-slate-300 bg-white shadow-sm p-3 text-slate-900"/></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Rasio Gigi (Kosongkan jika tidak ada)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gearRatios.map((ratio, index) => (
                  <div key={index}>
                    <label htmlFor={`gear${index + 1}`} className="block text-sm font-medium text-slate-700 mb-1">{`Gigi ${index + 1}`}</label>
                    <input type="number" id={`gear${index + 1}`} value={ratio} onChange={(e) => handleGearRatioChange(index, e.target.value)} placeholder="Contoh: 2.833" className="w-full rounded-md border-slate-300 bg-white shadow-sm p-3 text-slate-900"/>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="mt-6"><button onClick={handleCalculate} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700"><SlidersHorizontal className="inline-block mr-2" size={20}/> Hitung</button></div>
        </div>
      </div>

      {/* Right Column: Persistent Results */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Hasil Rasio:</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Rasio Final Gear</span>
              <p className="text-2xl font-extrabold text-slate-800">{results ? results.finalRatio.toFixed(3) : '--'}</p>
            </div>
            <div className="border-t pt-3">
              <h3 className="font-semibold text-slate-800 mb-2">Rasio Total per Gigi</h3>
              {results ? (
                results.totalRatios.map((totalRatio, index) => (
                  <div key={index} className="flex justify-between text-sm py-1">
                    <span className="text-slate-600">{`Gigi ${index + 1}`}</span>
                    <span className="font-mono">{totalRatio.toFixed(3)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Hasil akan muncul di sini.</p>
              )}
            </div>
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
              <div className="p-3 bg-slate-100 rounded-lg text-center font-mono text-slate-800 text-sm">
                <p>Rasio Final = Sproket Belakang / Sproket Depan</p>
                <p className="mt-2">Rasio Total = Rasio Primer × Rasio Gigi × Rasio Final</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function RasioGirboksPage() {
  return (
    <AppLayout title="Kalkulator Rasio Girboks">
      <KalkulatorRasioGirboks />
    </AppLayout>
  );
}
