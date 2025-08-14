'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Mail } from 'lucide-react'; // LogIn is removed as it's unused

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) { // Fixed: Specify error type
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);

      if (additionalUserInfo?.isNewUser) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          status: "Free User",
          calculationCount: 0,
          lastCalculationDate: null,
        });
      }
      router.push('/');
    } catch (err) { // Fixed: Specify error type
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800">Login</h1>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md hover:bg-blue-700">
            <Mail size={20}/> Login dengan Email
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center">
          <div className="flex-grow border-t border-slate-300"></div>
          <span className="mx-4 flex-shrink text-sm text-slate-500">atau</span>
          <div className="flex-grow border-t border-slate-300"></div>
        </div>
        <button onClick={handleGoogleLogin} className="mt-4 w-full flex justify-center items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          {/* Fixed: Use next/image */}
          <Image src="https://www.google.com/favicon.ico" alt="Google icon" width={20} height={20}/> Lanjutkan dengan Google
        </button>
        <p className="mt-6 text-center text-sm">
          Belum punya akun? <Link href="/register" className="font-semibold text-blue-600 hover:underline">Daftar disini</Link>
        </p>
      </div>
    </div>
  );
}
