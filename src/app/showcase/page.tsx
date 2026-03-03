import { createClient } from '@/lib/supabase/server';
import JerseyCard from '@/components/jersey/JerseyCard';

export default async function ShowcasePage() {
  const supabase = await createClient();

  const { data: jerseys, error } = await supabase
    .from('jerseys')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching showcase jerseys:', error);
  }

  const jerseyList = jerseys ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald">
            Showcase
          </h1>
          <p className="text-gray-400 mt-2">
            {jerseyList.length} public {jerseyList.length === 1 ? 'jersey' : 'jerseys'} from the community
          </p>
        </div>

        {jerseyList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jerseyList.map((jersey) => (
              <JerseyCard key={jersey.id} jersey={jersey} href={`/showcase/${jersey.id}`} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">👕</p>
            <h2 className="text-2xl font-bold text-gray-300 font-oswald uppercase mb-2">
              Nothing Here Yet
            </h2>
            <p className="text-gray-500">
              No jerseys have been shared publicly yet. Be the first!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
