import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import JerseyForm from '@/components/jersey/JerseyForm';

export default async function NewJerseyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-[#39FF14] transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald mb-8">
          Add New Jersey
        </h1>

        <JerseyForm mode="create" />
      </div>
    </div>
  );
}
