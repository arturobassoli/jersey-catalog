import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-[#39FF14] transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald mb-2">
          Your Profile
        </h1>
        <p className="text-gray-400 mb-8 text-sm">
          Your username appears on your jerseys in the public showcase so other collectors can find your collection.
        </p>

        <ProfileForm
          email={user.email ?? ''}
          currentUsername={profile?.username ?? ''}
          userId={user.id}
        />
      </div>
    </div>
  );
}
