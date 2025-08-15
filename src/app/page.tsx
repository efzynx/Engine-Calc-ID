'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This component will automatically redirect users from the root URL ("/")
// to the first calculator page.
export default function HomePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the default calculator page
    router.replace('/engine/volume-cc');
  }, [router]);

  // Render a simple loading state while redirecting
  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <p className="text-slate-500">Mengarahkan...</p>
    </div>
  );
}
