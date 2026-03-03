'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, LogOut, User, LayoutDashboard, Shirt, Trophy } from 'lucide-react';

const supabase = createClient();

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleSignOut = async () => {
    closeMobile();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-[#0a0a0a] text-white p-4 border-b border-b-[#39FF14]/30">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald flex items-center gap-2">
          <Shirt className="h-7 w-7" /> JCM
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/showcase" className="text-gray-300 hover:text-[#39FF14] transition-colors font-geist-sans">
            Showcase
          </Link>
          {session && (
            <Link href="/dashboard" className="text-gray-300 hover:text-[#39FF14] transition-colors font-geist-sans">
              Dashboard
            </Link>
          )}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 rounded-full flex items-center justify-center border border-gray-600 text-[#39FF14]">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-gray-900 border-gray-700 text-gray-200" align="end">
                <DropdownMenuLabel className="text-xs text-gray-500 font-normal truncate">
                  {session.user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-[#39FF14] font-geist-sans">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#39FF14] text-black hover:bg-[#39FF14]/80 transition-colors font-oswald uppercase">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation — deferred to avoid Radix ID hydration mismatch */}
        <div className="md:hidden flex items-center">
          {mounted ? (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#39FF14]">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0a0a0a] border-l border-[#39FF14]/30 text-white w-[260px] p-0 flex flex-col">
                {/* Header */}
                <div className="px-5 pt-6 pb-4 border-b border-[#39FF14]/20">
                  <SheetTitle asChild>
                    <Link href="/" onClick={closeMobile} className="text-2xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald flex items-center gap-2">
                      <Shirt className="h-7 w-7" /> JCM
                    </Link>
                  </SheetTitle>
                </div>

                {/* Links */}
                <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
                  <Link
                    href="/showcase"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-colors"
                  >
                    <Trophy className="h-5 w-5 shrink-0" />
                    <span className="font-geist-sans">Showcase</span>
                  </Link>

                  {session ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-colors"
                      >
                        <LayoutDashboard className="h-5 w-5 shrink-0" />
                        <span className="font-geist-sans">Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-colors"
                      >
                        <User className="h-5 w-5 shrink-0" />
                        <span className="font-geist-sans">Profile</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-[#39FF14] hover:bg-[#39FF14]/10 transition-colors"
                      >
                        <span className="font-geist-sans">Login</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={closeMobile}
                        className="flex items-center justify-center px-3 py-2.5 rounded-lg bg-[#39FF14] text-black font-bold hover:bg-[#39FF14]/80 transition-colors font-oswald uppercase mt-1"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </nav>

                {/* Footer: logout + email */}
                {session && (
                  <div className="px-3 pb-6 border-t border-gray-800 pt-4">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors w-full text-left"
                    >
                      <LogOut className="h-5 w-5 shrink-0" />
                      <span className="font-geist-sans">Logout</span>
                    </button>
                    <p className="text-xs text-gray-600 truncate px-3 mt-3">{session.user?.email}</p>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          ) : (
            <button className="p-2 text-[#39FF14]" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
