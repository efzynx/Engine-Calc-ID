'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
// ADDED: New icons for the collapsible menu
import { ChevronsLeft, Calculator, Gauge, FastForward, User as UserIcon, Menu, LogIn, LogOut, Wrench, ChevronDown, Tangent } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// --- Submenu Components Start ---

// Type definition for a single submenu item
interface SubMenuItemProps {
  href: string;
  text: string;
}

// Component for individual links inside a submenu
const SubMenuItem: React.FC<SubMenuItemProps> = ({ href, text }) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <li>
      <Link href={href} className={`block text-sm py-2 px-4 rounded-md transition-colors ${isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
        {text}
      </Link>
    </li>
  );
};

// Type definition for a collapsible menu item
interface CollapsibleMenuItemProps {
  icon: React.ReactNode;
  text: string;
  subItems: SubMenuItemProps[];
}

// Component for the main menu item that expands/collapses
const CollapsibleMenuItem: React.FC<CollapsibleMenuItemProps> = ({ icon, text, subItems }) => {
  const pathname = usePathname();
  // Check if any sub-item is active to keep the parent menu open
  const isParentActive = subItems.some(item => item.href === pathname);
  const [isOpen, setIsOpen] = useState(isParentActive);

  return (
    <li>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        // UPDATED: Changed hover effect from background to a left border
        className={`flex items-center justify-between w-full p-4 mx-2 rounded-lg transition-colors text-slate-300 border-l-4 border-transparent hover:border-blue-500 hover:text-white`}
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-4 whitespace-nowrap">{text}</span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
        <ul className="pl-10 pr-2 pt-1 pb-2 space-y-1">
          {subItems.map((item, index) => (
            <SubMenuItem key={index} href={item.href} text={item.text} />
          ))}
        </ul>
      </div>
    </li>
  );
};

// --- Submenu Components End ---


// Main Layout Component
export const AppLayout: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
            {/* UPDATED: Menu now uses the collapsible structure */}
            <CollapsibleMenuItem 
              icon={<Wrench size={20} />} 
              text="Engine Calculators"
              subItems={[
                { href: "/engine/volume-cc", text: "Volume (CC)" },
                { href: "/engine/rasio-kompresi", text: "Rasio Kompresi" },
                { href: "/engine/kecepatan-piston", text: "Kecepatan Piston" },
              ]}
            />
            <CollapsibleMenuItem
            icon={<Tangent size={20} />}
            text="Fuel Consumption"
            subItems={[
              { href: "/fuel-air/karburator-cfm", text: "Karburator Cfm" },
              { href: "/fuel-air/rekomendasi-karburator", text: "Ukuran Karburator" },
              ]}
            />
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
                {userProfile && userProfile.status === 'Free User' && (
                  <div className="hidden sm:flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                    <span>Limit Harian:</span>
                    <span className="font-semibold ml-1.5">{userProfile.calculationCount || 0} / 50</span>
                  </div>
                )}

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100">
                      <Image 
                        key={user.uid}
                        src={headerImgError || !user.photoURL ? `https://ui-avatars.com/api/?name=${user.displayName || 'A'}&background=0D8ABC&color=fff` : user.photoURL}
                        onError={() => setHeaderImgError(true)}
                        alt="User Avatar" 
                        width={40}
                        height={40}
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
