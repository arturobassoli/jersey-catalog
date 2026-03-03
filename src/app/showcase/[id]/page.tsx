import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ExternalLink } from 'lucide-react';

export default async function ShowcaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Explicitly exclude private_note — never expose it to non-owners
  const { data: jersey } = await supabase
    .from('jerseys')
    .select('id, team, player, season, image_url, purchase_location, purchase_date, purchase_price, estimated_value, notes, external_link, is_public')
    .eq('id', id)
    .eq('is_public', true)
    .single();

  if (!jersey) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link
          href="/showcase"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-[#39FF14] transition-colors text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Showcase
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Image */}
          <div className="w-full aspect-square relative rounded-xl overflow-hidden bg-gray-800 border border-[#39FF14]/20">
            {jersey.image_url ? (
              <Image
                src={jersey.image_url}
                alt={`${jersey.team} ${jersey.player} ${jersey.season} jersey`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-6xl">
                👕
              </div>
            )}
            <span className="absolute top-3 right-3 bg-[#39FF14] text-black text-sm font-bold px-3 py-1 rounded-full font-oswald uppercase">
              {jersey.season}
            </span>
          </div>

          {/* Core info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-extrabold text-[#39FF14] font-oswald uppercase leading-tight">
                {jersey.team}
              </h1>
              <p className="text-2xl text-gray-200 mt-1">{jersey.player}</p>
            </div>

            {/* Value info */}
            {(jersey.purchase_price || jersey.estimated_value) && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {jersey.purchase_price && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <p className="text-[#39FF14] font-oswald text-xl font-bold">
                      €{Number(jersey.purchase_price).toLocaleString('it-IT')}
                    </p>
                    <p className="text-gray-500 text-xs uppercase mt-0.5">Paid</p>
                  </div>
                )}
                {jersey.estimated_value && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                    <p className="text-[#39FF14] font-oswald text-xl font-bold">
                      €{Number(jersey.estimated_value).toLocaleString('it-IT')}
                    </p>
                    <p className="text-gray-500 text-xs uppercase mt-0.5">Est. Value</p>
                  </div>
                )}
              </div>
            )}

            {/* Purchase details */}
            {(jersey.purchase_location || jersey.purchase_date) && (
              <div className="space-y-2 pt-2">
                {jersey.purchase_location && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Purchased at</span>
                    <span className="text-gray-200">{jersey.purchase_location}</span>
                  </div>
                )}
                {jersey.purchase_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Purchase date</span>
                    <span className="text-gray-200">
                      {new Date(jersey.purchase_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* External link */}
            {jersey.external_link && (
              <a
                href={jersey.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#39FF14] hover:underline mt-2"
              >
                <ExternalLink className="h-4 w-4" />
                View external link
              </a>
            )}
          </div>
        </div>

        {/* Notes */}
        {jersey.notes && (
          <div className="border border-white/10 bg-white/5 rounded-xl p-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Notes</h2>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{jersey.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
