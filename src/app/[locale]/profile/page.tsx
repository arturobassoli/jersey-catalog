import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronLeft } from 'lucide-react';
import ProfileForm from '@/components/profile/ProfileForm';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations('profile');

  if (!user) redirect(`/${locale}/login`);

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
          {t('backToDashboard')}
        </Link>

        <h1 className="text-4xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald mb-2">
          {t('title')}
        </h1>
        <p className="text-gray-400 mb-8 text-sm">
          {t('subtitle')}
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
