import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const t = await getTranslations('home');

  const ctaHref = user ? '/dashboard' : '/login';

  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-oswald uppercase leading-tight mb-4">
            <span className="block text-6xl md:text-7xl text-white">{t('heroLine1')}</span>
            <span className="block text-6xl md:text-7xl text-[#39FF14]">{t('heroLine2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ctaHref}>
              <Button className="bg-[#39FF14] text-black font-bold text-lg px-8 py-3 hover:bg-[#39FF14]/80 font-oswald uppercase w-full sm:w-auto">
                {user ? t('ctaDashboard') : t('ctaStart')}
              </Button>
            </Link>
            <Link href="/showcase">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-[#39FF14] text-lg px-8 py-3 font-oswald uppercase w-full sm:w-auto"
              >
                {t('ctaShowcase')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 border-t border-[#39FF14]/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center font-oswald uppercase text-gray-200 mb-12">
            {t('featuresTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-[#39FF14] font-oswald uppercase mb-2">
                {t('feature1Title')}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('feature1Desc')}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-bold text-[#39FF14] font-oswald uppercase mb-2">
                {t('feature2Title')}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('feature2Desc')}
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-[#39FF14] font-oswald uppercase mb-2">
                {t('feature3Title')}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {t('feature3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
