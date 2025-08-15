'use client'
import React, { useState } from 'react';
import { SlidersHorizontal, Info, ChevronDown } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';

// The actual calculator component
const KalkulatorRasioKompresi: React.FC = () => {
  const [vcc, setVcc] = useState<string>(''); // Volume Ruang Bakar
  const [vp, setVp] = useState<string>('');  // Volume Paking
  const [vk, setVk] = useState<string>('');  // Volume Kubah Piston
  const [vs, setVs] = useState<string>('');  // Volume Silinder
  
  const [rasio, setRasio] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormulaVisible, setIsFormulaVisible] = useState(false);

  const handleCalculate = () => {
    setError(null);
    const vccNum = parseFloat(vcc);
    const vpNum = parseFloat(vp);
    const vkNum = parseFloat(vk);
    const vsNum = parseFloat(vs);

    if (isNaN(vccNum) || isNaN(vpNum) || isNaN(vkNum) || isNaN(vsNum) || vsNum <= 0) {
      setError("Mohon masukkan semua nilai dengan benar.");
      setRasio(null);
      return;
    }
    
    // Rumus Rasio Kompresi = (Volume Silinder + Volume Ruang Bakar) / Volume Ruang Bakar
    // Volume Ruang Bakar (Total) = vcc + vp - vk
    const totalVolumeRuangBakar = vccNum + vpNum - vkNum;
    if (totalVolumeRuangBakar <= 0) {
      setError("Volume ruang bakar tidak valid (hasilnya nol atau negatif).");
      setRasio(null);
      return;
    }

    const calculatedRatio = (vsNum + totalVolumeRuangBakar) / totalVolumeRuangBakar;
    setRasio(calculatedRatio);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left Column: Calculator Form */}
      <div className="lg:col-span-3">
        <div className="w-full rounded-xl bg-white p-6 sm:p-8 shadow-lg">
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg"><div className="flex"><div className="flex-shrink-0"><Info className="h-5 w-5 text-blue-400" /></div><div className="ml-3"><p className="text-sm text-blue-700"><b>Rasio Kompresi</b> adalah perbandingan antara volume total silinder dan volume ruang bakar.</p></div></div></div>
          <div className="space-y-4">
            <div><label htmlFor="vs" className="block text-sm font-medium text-slate-700 mb-1">Volume Silinder / CC (cm³)</label><input type="number" id="vs" value={vs} onChange={(e) => setVs(e.target.value)} placeholder="Contoh: 155.1" className="w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/></div>
            <div><label htmlFor="vcc" className="block text-sm font-medium text-slate-700 mb-1">Volume Ruang Bakar (cm³)</label><input type="number" id="vcc" value={vcc} onChange={(e) => setVcc(e.target.value)} placeholder="Contoh: 13.5" className="w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/></div>
            <div><label htmlFor="vp" className="block text-sm font-medium text-slate-700 mb-1">Volume Paking Head (cm³)</label><input type="number" id="vp" value={vp} onChange={(e) => setVp(e.target.value)} placeholder="Contoh: 0.8" className="w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/></div>
            <div><label htmlFor="vk" className="block text-sm font-medium text-slate-700 mb-1">Volume Kubah Piston (cm³)</label><input type="number" id="vk" value={vk} onChange={(e) => setVk(e.target.value)} placeholder="Isi 0 jika flat, isi negatif jika dome" className="w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/></div>
          </div>
          {error && <div className="mt-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          <div className="mt-6"><button onClick={handleCalculate} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-blue-700"><SlidersHorizontal className="inline-block mr-2" size={20}/> Hitung</button></div>
        </div>
      </div>

      {/* Right Column: Persistent Results and Formula */}
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-lg font-bold text-slate-800">Hasil Perhitungan:</h2>
          <p className="text-5xl font-extrabold text-green-600 mt-2">{rasio ? rasio.toFixed(2) : '--'} <span className="text-3xl font-medium text-slate-500">: 1</span></p>
        </div>
        
        <div className="border rounded-xl overflow-hidden bg-white shadow-lg">
          <button onClick={() => setIsFormulaVisible(!isFormulaVisible)} className="w-full flex justify-between items-center p-4 hover:bg-slate-50 focus:outline-none"><span className="font-semibold text-slate-700">Lihat Rumus Perhitungan</span><ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isFormulaVisible ? 'rotate-180' : ''}`} /></button>
          {isFormulaVisible && (
            <div className="p-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Rumus yang digunakan:</p>
              <div className="p-3 bg-slate-100 rounded-lg text-center font-mono text-slate-800 text-sm">
                <p>V<sub>total</sub> = V<sub>ruang bakar</sub> + V<sub>paking</sub> - V<sub>kubah piston</sub></p>
                <p className="mt-2">Rasio = (V<sub>silinder</sub> + V<sub>total</sub>) / V<sub>total</sub></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// The main page component that wraps the calculator with the layout
export default function RasioKompresiPage() {
  return (
    <AppLayout title="Kalkulator Rasio Kompresi">
      <KalkulatorRasioKompresi />
    </AppLayout>
  );
}
