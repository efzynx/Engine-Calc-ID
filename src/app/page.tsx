'use client'
import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { useAuth } from '@/context/auth-context';
import { Wrench, Tangent, GitCommit, ArrowRight, Users, Activity, Code } from 'lucide-react';

// Reusable component for the statistics cards
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; }> = ({ icon, label, value }) => (
    // UPDATED: Changed background for better contrast inside the new container
    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
            <div className="text-blue-400">{icon}</div>
            <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);


// Reusable component for the category cards with a new design
const FeatureCard: React.FC<{ href: string; icon: React.ReactNode; title: string; description: string; }> = ({ href, icon, title, description }) => (
  <Link href={href} className="group relative flex flex-col justify-between p-6 bg-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
    {/* Animated border spans */}
    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 ease-out group-hover:w-full"></span>
    <span className="absolute bottom-0 left-0 h-0 w-[2px] bg-blue-600 transition-all duration-300 ease-out group-hover:h-full group-hover:delay-300"></span>
    <span className="absolute top-0 right-0 h-[2px] w-0 bg-blue-600 transition-all duration-300 ease-out group-hover:w-full group-hover:delay-600"></span>
    <span className="absolute top-0 right-0 h-0 w-[2px] bg-blue-600 transition-all duration-300 ease-out group-hover:h-full group-hover:delay-900"></span>
    
    <div>
      <div className="bg-blue-100 p-3 rounded-lg w-min mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
    <div className="mt-4 flex items-center text-sm font-semibold text-blue-600">
      <span>Mulai Menghitung</span>
      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </div>
  </Link>
);

// The main content for the redesigned dashboard page
const DashboardContent: React.FC = () => {
    const { user } = useAuth();

    // NOTE: These are placeholder values. Real values would require backend functions.
    const stats = {
        totalUsers: "1,250+",
        dailyRequests: "7,300+",
        creator: "Ahmad Fauzan A."
    };

    const backgroundStyle = {
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    };

    return (
        <div className="relative">
             {/* ADDED: Custom CSS for the aurora effect */}
            <style jsx>{`
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .aurora-bg {
                    background: linear-gradient(-45deg, #1e3a8a, #3b82f6, #1e3a8a, #1d4ed8);
                    background-size: 400% 400%;
                    animation: aurora 10s ease infinite;
                }
            `}</style>
            
             {/* Background Pattern */}
            <div className="absolute inset-0 -z-10" style={backgroundStyle}></div>

            {/* Welcome Banner */}
            <div className="bg-slate-800 rounded-xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
                 <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10"
                    style={{
                        backgroundImage:
                        'radial-gradient(circle, rgba(63, 94, 251, 0.1) 0%, rgba(0,0,0,0) 50%)',
                    }}
                />
                <h1 className="text-3xl font-bold">
                    Selamat Datang, {user ? user.displayName : 'Mekanik'}!
                </h1>
                <p className="mt-2 text-slate-300 max-w-2xl">
                    EngineCalc ID adalah kumpulan alat bantu hitung untuk para mekanik dan penggemar otomotif. Pilih salah satu kategori di bawah ini untuk memulai.
                </p>
            </div>
            
            {/* UPDATED: Statistics Section now has the aurora effect */}
            <div className="aurora-bg rounded-xl shadow-lg p-6 mb-8 relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<Users size={24} />} label="Total Pengguna" value={stats.totalUsers} />
                    <StatCard icon={<Activity size={24} />} label="Kalkulasi Hari Ini" value={stats.dailyRequests} />
                    <StatCard icon={<Code size={24} />} label="Pembuat" value={stats.creator} />
                </div>
            </div>

            {/* Feature Grid */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Kategori Kalkulator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FeatureCard 
                        href="/engine/volume-cc"
                        icon={<Wrench className="text-blue-600" />}
                        title="Engine Calculators"
                        description="Hitung volume, rasio kompresi, kecepatan piston, dan lainnya."
                    />
                    <FeatureCard 
                        href="/fuel-air/karburator-cfm"
                        icon={<Tangent className="text-blue-600" />}
                        title="Fuel & Air"
                        description="Temukan kebutuhan CFM dan ukuran karburator yang ideal."
                    />
                    <FeatureCard 
                        href="/transmisi/rasio-girboks"
                        icon={<GitCommit className="text-blue-600" />}
                        title="Transmisi & Roda"
                        description="Analisis rasio girboks dan estimasi kecepatan puncak."
                    />
                </div>
            </div>
        </div>
    );
};

// The main page component that wraps the content with the layout
export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard">
      <DashboardContent />
    </AppLayout>
  );
}
