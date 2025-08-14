'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { AppLayout } from '@/components/app-layout';
import { Shield, Trash2, Star, Zap } from 'lucide-react';

const ProfilePageContent: React.FC = () => {
    const { user, userProfile, loading } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [profileImgError, setProfileImgError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (user) {
            setDisplayName(user.displayName || '');
            setProfileImgError(false);
        }
    }, [user, loading, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setMessage('');
        setError('');
        setIsSaving(true);

        try {
            await updateProfile(user, { displayName });
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { displayName });
            setMessage('Nama tampilan berhasil diperbarui!');
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordReset = async () => {
        setMessage('');
        setError('');
        if (user && user.email) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                setMessage('Email untuk reset password telah dikirim.');
            } catch (err: any) {
                setError(`Gagal mengirim email: ${err.message}`);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
            try {
                await deleteUser(user);
                router.push('/login');
            } catch (err: any) {
                setError(`Gagal menghapus akun: ${err.message}`);
            }
        }
    };
    
    // ADDED: Function to handle the upgrade button click
    const handleUpgradeClick = () => {
        alert("Paket Pro masih belum tersedia. Hubungi admin jika kamu sudah terkena limit harian.");
    };

    if (loading || !user || !userProfile) {
        return <div className="text-center p-10">Memuat data pengguna...</div>;
    }

    const isPremium = userProfile.status === 'Premium User';

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center md:border-r md:pr-8">
                        <img 
                            key={user.uid}
                            src={profileImgError || !user.photoURL ? `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=0D8ABC&color=fff&size=128` : user.photoURL} 
                            onError={() => setProfileImgError(true)}
                            alt="Foto Profil" 
                            className="w-32 h-32 rounded-full object-cover mb-4" 
                        />
                        <h2 className="text-xl font-bold text-slate-800 text-center">{user.displayName}</h2>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        
                        <div className={`mt-4 px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                            isPremium 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                            {isPremium && <Star size={12} />}
                            {userProfile.status}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800">Edit Nama</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nama Tampilan</label>
                                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 p-3 text-slate-900"/>
                            </div>
                            <button type="submit" disabled={isSaving} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow-md hover:bg-blue-700 disabled:bg-slate-400">
                                {isSaving ? 'Menyimpan...' : 'Simpan Nama'}
                            </button>
                            {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
                            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                        </form>

                        <div className="border-t my-6"></div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800">Pengaturan Akun</h3>
                            <button onClick={handlePasswordReset} className="w-full flex items-center justify-center gap-2 text-sm rounded-lg border border-slate-300 px-4 py-3 font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                                <Shield size={16} /> Kirim Link Ubah Password
                            </button>
                            <button onClick={handleDeleteAccount} className="w-full flex items-center justify-center gap-2 text-sm rounded-lg border border-red-500 bg-red-500 px-4 py-3 font-bold text-white shadow-sm hover:bg-red-600">
                                <Trash2 size={16} /> Hapus Akun
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade to Pro Section */}
            {!isPremium && (
                <div className="bg-slate-800 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="bg-yellow-400 p-4 rounded-full">
                            <Zap size={32} className="text-slate-900"/>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-bold">Upgrade ke Pro</h3>
                            <p className="text-slate-300 mt-1">Dapatkan lebih banyak fitur dan perhitungan harian tanpa batas!</p>
                        </div>
                        {/* UPDATED: Button now triggers the alert */}
                        <button 
                            onClick={handleUpgradeClick}
                            className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
                        >
                            Lihat Paket Pro
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ProfilePage() {
    return (
        <AppLayout title="Profil Pengguna">
            <ProfilePageContent />
        </AppLayout>
    );
}
