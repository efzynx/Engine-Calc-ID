'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronsLeft, Calculator, Gauge, User as UserIcon, Menu, LogIn, LogOut } from 'lucide-react';
// Now we also get userProfile to display the limit
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// ... (MenuItem component remains the same)
interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  href: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, href }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li>
      <Link href={href} className={`flex items-center p-4 mx-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-700'}`}>
        {icon}
        <span className="ml-4 whitespace-nowrap">{text}</span>
      </Link>
    </li>
  );
};


// Main Layout Component
export const AppLayout: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Get userProfile from our context
  const { user, userProfile, loading } = useAuth();
  const [headerImgError, setHeaderImgError] = useState(false);

  useEffect(() => {
    setHeaderImgError(false);
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };
  
  return (
    <div className="h-screen bg-slate-100 font-sans">
      <aside className={`fixed top-0 left-0 h-full z-30 bg-slate-800 text-white w-64 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 h-16">
          <h1 className="text-xl font-bold">EngineCalc</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-700">
            <ChevronsLeft size={20} />
          </button>
        </div>
        <nav className="mt-4">
          <ul>
            <MenuItem icon={<Calculator size={20} />} text="Volume (CC)" href="/" />
            <MenuItem icon={<Gauge size={20} />} text="Rasio Kompresi" href="/rasio-kompresi" />
          </ul>
        </nav>
      </aside>
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-20" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className="h-full flex flex-col overflow-hidden">
        <header className="bg-white shadow-md h-16 flex items-center justify-between px-4 sm:px-6 z-10 border-b border-slate-200">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full text-slate-700 hover:bg-slate-100">
            <Menu size={24} />
          </button>
          
          <h2 className="text-base sm:text-xl font-semibold text-slate-700 whitespace-nowrap">{title}</h2>
          
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-24 h-8 bg-slate-200 rounded-md animate-pulse"></div>
            ) : user ? (
              <>
                {/* ADDED: Daily Limit Counter */}
                {userProfile && userProfile.status === 'Free User' && (
                  <div className="hidden sm:flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <span>Limit Harian:</span>
                    <span className="font-semibold ml-1.5">{userProfile.calculationCount || 0} / 50</span>
                  </div>
                )}

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100">
                      <img 
                        key={user.uid}
                        src={headerImgError || !user.photoURL ? `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=0D8ABC&color=fff` : user.photoURL}
                        onError={() => setHeaderImgError(true)}
                        alt="User Avatar" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="w-56 bg-white rounded-md shadow-lg p-2 mt-2 border" sideOffset={5}>
                      <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold text-slate-900">{user.displayName || 'Pengguna'}</DropdownMenu.Label>
                      <DropdownMenu.Label className="px-2 text-xs text-slate-500">{user.email}</DropdownMenu.Label>
                      <DropdownMenu.Separator className="h-[1px] bg-slate-200 my-1" />
                      <DropdownMenu.Item asChild>
                        <Link href="/profil" className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-slate-700 rounded-md hover:bg-slate-100 outline-none">
                          <UserIcon size={16} /> Profil
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={handleLogout} className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-red-500 rounded-md hover:bg-red-50 outline-none cursor-pointer">
                        <LogOut size={16} /> Logout
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                <LogIn size={16} />
                Login
              </Link>
            )}
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
