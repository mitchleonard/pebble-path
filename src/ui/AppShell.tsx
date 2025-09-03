import { Link, NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getUserProfile, UserProfile } from '@/lib/firebase';
import { getAuth, signOut } from 'firebase/auth';

export function AppShell() {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(() => auth.currentUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => { 
      setUser(u); 
      if (u) {
        try {
          const profile = await getUserProfile(u.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setReady(true); 
    });
    return () => unsub();
  }, []);
  return (
    <div className="mx-auto max-w-screen-sm min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-100">
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="font-display font-bold text-primary text-lg">Pebble Path</div>
          </Link>
          <nav className="flex gap-2 items-center">
            <NavLink to="/" className={({ isActive }) => `btn ${isActive && location.pathname === '/' ? 'btn-primary' : ''}`}>Home</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `btn ${isActive ? 'btn-primary' : ''}`}>Dashboard</NavLink>
            {user && (
              <button 
                className="btn bg-lilac/60 hover:bg-lilac" 
                onClick={() => signOut(getAuth())}
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
        {userProfile && (
          <div className="px-4 py-2 bg-lilac/10 border-t border-lilac/20">
            <div className="text-sm text-slate-600">
              Welcome back, <span className="font-medium text-primary">{userProfile.firstName}</span>! 👋
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 px-4 py-4">
        {!ready ? null : user ? <Outlet /> : <Navigate to="/welcome" replace />}
      </main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">
        Built with love ❤
      </footer>
    </div>
  );
}


