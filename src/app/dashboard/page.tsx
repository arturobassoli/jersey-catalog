import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import JerseyCard from '@/components/jersey/JerseyCard';
import StatsGrid from '@/components/jersey/StatsGrid';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: jerseys, error }, { data: profile }] = await Promise.all([
    supabase
      .from('jerseys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  if (error) {
    console.error('Error fetching jerseys:', error);
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-red-500 p-4">
        Error loading jerseys: {error.message}
      </div>
    );
  }

  const jerseyList = jerseys ?? [];
  const publicCount = jerseyList.filter((j) => j.is_public).length;
  const privateCount = jerseyList.filter((j) => !j.is_public).length;
  const totalValue = jerseyList.reduce((sum, j) => sum + (j.estimated_value ?? 0), 0);
  const totalSpent = jerseyList.reduce((sum, j) => sum + (j.purchase_price ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-4xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald">
            My Collection
          </h1>
          <Link href="/dashboard/new">
            <Button className="bg-[#39FF14] text-black font-bold hover:bg-[#39FF14]/80 font-oswald uppercase">
              + Add New Jersey
            </Button>
          </Link>
        </div>

        {/* No-username banner */}
        {!profile?.username && (
          <Link href="/profile" className="block mb-6">
            <div className="flex items-center gap-3 border border-yellow-500/40 bg-yellow-500/10 rounded-xl px-4 py-3 hover:bg-yellow-500/15 transition-colors">
              <span className="text-yellow-400 text-xl shrink-0">👤</span>
              <div className="min-w-0">
                <p className="text-yellow-400 font-semibold text-sm">Set your username</p>
                <p className="text-yellow-400/70 text-xs truncate">
                  Your jerseys appear in the showcase — add a username so others can find your collection.
                </p>
              </div>
              <span className="text-yellow-400 text-xs font-bold shrink-0 ml-auto">Set up →</span>
            </div>
          </Link>
        )}

        {/* Stats */}
        <StatsGrid
          total={jerseyList.length}
          publicCount={publicCount}
          privateCount={privateCount}
          totalValue={totalValue}
          totalSpent={totalSpent}
        />

        {/* Jersey Grid */}
        {jerseyList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jerseyList.map((jersey) => (
              <JerseyCard key={jersey.id} jersey={jersey} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">👕</p>
            <h2 className="text-2xl font-bold text-gray-300 font-oswald uppercase mb-2">
              No Jerseys Yet
            </h2>
            <p className="text-gray-500 mb-6">
              Start building your collection by adding your first jersey.
            </p>
            <Link href="/dashboard/new">
              <Button className="bg-[#39FF14] text-black font-bold hover:bg-[#39FF14]/80 font-oswald uppercase">
                Add Your First Jersey
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
