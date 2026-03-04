'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();

  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please enter your email and password.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
      console.error('Login error:', error);
    } else {
      setMessage({ type: 'success', text: 'Logged in successfully! Redirecting...' });
      router.push('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-4">
      <Card className="w-full max-w-md border border-[#39FF14] shadow-neon">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald">
            Jersey Manager
          </CardTitle>
          <CardDescription className="text-gray-300 font-geist-sans">
            Sign in or create an account to manage your collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-200 font-geist-sans">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@example.com"
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14] focus:ring-[#39FF14]"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-200 font-geist-sans">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14] focus:ring-[#39FF14]"
              disabled={loading}
            />
          </div>
          {message && (
            <p className={`text-sm text-center ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {message.text}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleSignIn}
            className="w-full bg-[#39FF14] text-black font-bold py-2 hover:bg-opacity-80 transition-colors font-oswald uppercase"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          {/* <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-[#39FF14] transition-colors font-oswald uppercase"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button> */}
          <Button
            onClick={() => router.push('/register')}
            variant="outline"
            className="w-full border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-[#39FF14] transition-colors font-oswald uppercase"
            disabled={loading}
          >
            Don't have an account? Sign Up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
