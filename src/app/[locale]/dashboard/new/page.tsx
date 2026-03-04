import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ChevronLeft } from 'lucide-react';
import JerseyForm from '@/components/jersey/JerseyForm';

export default async function NewJerseyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations('jerseyForm');

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-[#39FF14] transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('backToDashboard')}
        </Link>

        <h1 className="text-4xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald mb-8">
          {t('addNewTitle')}
        </h1>

        <JerseyForm mode="create" />
      </div>
    </div>
  );
}
