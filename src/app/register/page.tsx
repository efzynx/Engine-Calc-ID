'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Generate a default avatar URL
        const photoURL = `https://ui-avatars.com/api/?name=${displayName}&background=0D8ABC&color=fff`;

        // Update Auth profile with name and photo
        await updateProfile(user, { displayName, photoURL });

        // Create a user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: displayName,
          email: user.email,
          photoURL: photoURL, // ADDED: Save the default photo URL
          status: "Free User",
          calculationCount: 0,
          lastCalculationDate: null,
        });
      }
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password terlalu lemah (minimal 6 karakter).');
      } else {
        setError('Gagal membuat akun.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-800">Daftar Akun Baru</h1>
        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Nama Tampilan</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password (minimal 6 karakter)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 p-3 shadow-sm text-slate-900"/>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-lg font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-slate-400">
            {isLoading ? 'Mendaftarkan...' : 'Daftar'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun? <Link href="/login" className="font-semibold text-blue-600 hover:underline">Login disini</Link>
        </p>
      </div>
    </div>
  );
}
