'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown, Gauge } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// Interface for the results
interface TopSpeedResult {
  gear: number;
  speed: number;
}

// The actual calculator component
const KalkulatorTopSpeed: React.FC = () => {
  const { user, userProfile } = useAuth();

  const [primaryRatio, setPrimaryRatio] = useState<string>('');
  const [gearRatios, setGearRatios] = useState<string[]>(['', '', '', '', '', '']);
  const [frontSprocket, setFrontSprocket] = useState<string>('');
  const [rearSprocket, setRearSprocket] = useState<string>('');
  const [tireWidth, setTireWidth] = useState<string>('');
  const [tireAspectRatio, setTireAspectRatio] = useState<string>('');
  const [tireRim, setTireRim] = useState<string>('');
  const [maxRpm, setMaxRpm] = useState<string>('');
  
  const [results, setResults] = useState<TopSpeedResult[] | null>(null);
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

    const inputs = [primaryRatio, frontSprocket, rearSprocket, tireWidth, tireAspectRatio, tireRim, maxRpm];
    const parsedInputs = inputs.map(parseFloat);
    const gearRatioNums = gearRatios.map(r => parseFloat(r)).filter(r => !isNaN(r) && r > 0);

    if (parsedInputs.some(isNaN) || gearRatioNums.length === 0) {
      setError("Mohon isi semua kolom dengan angka yang valid.");
      setResults(null);
      return;
    }
    
    const [primaryNum, frontNum, rearNum, width, ratio, rim, rpm] = parsedInputs;

    // Calculate Tire Circumference in mm
    const sidewallHeight = width * (ratio / 100);
    const totalDiameter = (sidewallHeight * 2) + (rim * 25.4);
    const tireCircumference = totalDiameter * Math.PI;

    const finalRatio = rearNum / frontNum;
    const topSpeeds = gearRatioNums.map((gearRatio, index) => {
      const totalRatio = primaryNum * gearRatio * finalRatio;
      const speed = (rpm * tireCircumference * 60) / (totalRatio * 1000000); // convert mm/min to km/h
      return { gear: index + 1, speed: speed };
    });
    
    setResults(topSpeeds);

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
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700"><b>Kalkulator Top Speed</b> mengestimasi kecepatan puncak (km/jam) di setiap gigi.</p></div></div></div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Data Mesin & RPM</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label htmlFor="primaryRatio" className="block text-sm font-medium text-slate-700 mb-1">Rasio Primer</label><input type="number" id="primaryRatio" value={primaryRatio} onChange={(e) => setPrimaryRatio(e.target.value)} placeholder="3.04" className="w-full rounded-md p-3 bg-white shadow-sm text-slate-900 border-slate-300 "/></div>
                <div><label htmlFor="maxRpm" className="block text-sm font-medium text-slate-700 mb-1">Target RPM Puncak</label><input type="number" id="maxRpm" value={maxRpm} onChange={(e) => setMaxRpm(e.target.value)} placeholder="12000" className="w-full rounded-md p-3 bg-white shadow-sm text-slate-900 border-slate-300"/></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Data Final Gear</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label htmlFor="frontSprocket" className="block text-sm font-medium text-slate-700 mb-1">Sproket Depan</label><input type="number" id="frontSprocket" value={frontSprocket} onChange={(e) => setFrontSprocket(e.target.value)} placeholder="15" className="w-full rounded-md p-3 bg-white shadow-sm text-slate-900 border-slate-300"/></div>
                <div><label htmlFor="rearSprocket" className="block text-sm font-medium text-slate-700 mb-1">Sproket Belakang</label><input type="number" id="rearSprocket" value={rearSprocket} onChange={(e) => setRearSprocket(e.target.value)} placeholder="46" className="w-full rounded-md p-3 bg-white shadow-sm text-slate-900 border-slate-300"/></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Ukuran Ban Belakang (Contoh: 180/55-17)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label htmlFor="tireWidth" className="block text-sm font-medium text-slate-700 mb-1">Lebar (180)</label><input type="number" id="tireWidth" value={tireWidth} onChange={(e) => setTireWidth(e.target.value)} placeholder="180" className="w-full rounded-md p-3 bg-white shadow-sm text-slate-900 border-slate-300"/></div>
                <div><label htmlFor="tireAspectRatio" className="block text-sm font-medium text-slate-700 mb-1">Aspek Rasio (55)</label><input type="number" id="tireAspectRatio" value={tireAspectRatio} onChange={(e) => setTireAspectRatio(e.target.value)} placeholder="55" className="w-full rounded-md p-3 bg-white shadow-sm text-slate-900 border-slate-300"/></div>
                <div><label htmlFor="tireRim" className="block text-sm font-medium text-slate-700 mb-1">Diameter Velg (17)</label><input type="number" id="tireRim" value={tireRim} onChange={(e) => setTireRim(e.target.value)} placeholder="17" className="w-full rounded-md p-3 bg-white shadow-sm text-slate-900 border-slate-300"/></div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Rasio Gigi (Kosongkan jika tidak ada)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gearRatios.map((ratio, index) => (
                  <div key={index}>
                    <label htmlFor={`gear${index + 1}`} className="block text-sm font-medium text-slate-700 mb-1">{`Gigi ${index + 1}`}</label>
                    <input type="number" id={`gear${index + 1}`} value={ratio} onChange={(e) => handleGearRatioChange(index, e.target.value)} placeholder="2.833" className="w-full rounded-md p-3 bg-white shadow-sm text-slate-900 border-slate-300"/>
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
          <h2 className="text-lg font-bold text-slate-800">Estimasi Top Speed per Gigi:</h2>
          <div className="mt-4 space-y-2 border-t pt-2">
            {results ? (
              results.map((result) => (
                <div key={result.gear} className="flex justify-between items-baseline text-sm">
                  <span className="text-slate-600">{`Gigi ${result.gear}`}</span>
                  <p className="font-mono font-semibold text-slate-800">{result.speed.toFixed(1)} <span className="font-sans text-xs text-slate-500">km/jam</span></p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">Hasil akan muncul di sini.</p>
            )}
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
                <p>Keliling Ban (mm) = ((Lebar × Rasio/100) × 2 + (Velg × 25.4)) × π</p>
                <p className="mt-2">Rasio Total = Rasio Primer × Rasio Gigi × (Sproket Belakang / Depan)</p>
                <p className="mt-2">Top Speed (km/jam) = (RPM × Keliling Ban × 60) / (Rasio Total × 1,000,000)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function TopSpeedPage() {
  return (
    <AppLayout title="Kalkulator Top Speed">
      <KalkulatorTopSpeed />
    </AppLayout>
  );
}
