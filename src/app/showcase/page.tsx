import { createClient } from '@/lib/supabase/server';
import JerseyCard from '@/components/jersey/JerseyCard';
import ShowcaseFilters from '@/components/showcase/ShowcaseFilters';

type SearchParams = {
  team?: string;
  player?: string;
  season?: string;
  owner?: string;
  sort?: string;
};

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { team, player, season, owner, sort = 'newest' } = await searchParams;
  const supabase = await createClient();

  // If filtering by owner username, resolve to user_ids first
  let ownerIds: string[] | null = null;
  if (owner?.trim()) {
    const { data: ownerProfiles } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', `%${owner.trim()}%`);
    ownerIds = ownerProfiles?.map((p) => p.id) ?? [];
  }

  // Main jersey query — run in parallel with filter-option queries
  let jerseyQuery = supabase
    .from('jerseys')
    .select('id, team, player, season, image_url, is_public, user_id')
    .eq('is_public', true);

  if (team?.trim()) jerseyQuery = jerseyQuery.ilike('team', `%${team.trim()}%`);
  if (player?.trim()) jerseyQuery = jerseyQuery.ilike('player', `%${player.trim()}%`);
  if (season?.trim()) jerseyQuery = jerseyQuery.eq('season', season.trim());

  // ownerIds = [] means "no matching users" → we want 0 results
  if (ownerIds !== null) {
    if (ownerIds.length === 0) {
      // Short-circuit: skip DB round-trip, return empty list
      return renderPage([], [], [], [], { team: team ?? '', player: player ?? '', season: season ?? '', owner: owner ?? '', sort });
    }
    jerseyQuery = jerseyQuery.in('user_id', ownerIds);
  }

  if (sort === 'oldest') jerseyQuery = jerseyQuery.order('created_at', { ascending: true });
  else if (sort === 'team') jerseyQuery = jerseyQuery.order('team', { ascending: true });
  else if (sort === 'player') jerseyQuery = jerseyQuery.order('player', { ascending: true });
  else jerseyQuery = jerseyQuery.order('created_at', { ascending: false });

  // Run jersey fetch + filter-option queries in parallel
  const [{ data: jerseys }, { data: allOptions }, { data: allOwnerRows }] = await Promise.all([
    jerseyQuery,
    supabase.from('jerseys').select('team, season').eq('is_public', true),
    supabase.from('jerseys').select('user_id').eq('is_public', true),
  ]);

  const jerseyList = jerseys ?? [];

  // Fetch profiles for the displayed jerseys (owner display)
  const displayedUserIds = [...new Set(jerseyList.map((j) => j.user_id))];
  const profileMap: Record<string, string> = {};

  if (displayedUserIds.length > 0) {
    const { data: displayedProfiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', displayedUserIds);
    displayedProfiles?.forEach((p) => { if (p.username) profileMap[p.id] = p.username; });
  }

  // Build filter option lists
  const allTeams = [...new Set(allOptions?.map((j) => j.team).filter(Boolean))].sort() as string[];
  const allSeasons = [...new Set(allOptions?.map((j) => j.season).filter(Boolean))].sort().reverse() as string[];

  const allOwnerUserIds = [...new Set(allOwnerRows?.map((j) => j.user_id) ?? [])];
  const allUsernames: string[] = [];
  if (allOwnerUserIds.length > 0) {
    const { data: ownerProfiles } = await supabase
      .from('profiles')
      .select('username')
      .in('id', allOwnerUserIds)
      .not('username', 'is', null);
    ownerProfiles?.forEach((p) => { if (p.username) allUsernames.push(p.username); });
    allUsernames.sort();
  }

  return renderPage(jerseyList, allTeams, allSeasons, allUsernames, {
    team: team ?? '',
    player: player ?? '',
    season: season ?? '',
    owner: owner ?? '',
    sort,
  }, profileMap);
}

function renderPage(
  jerseyList: { id: string; team: string; player: string; season: string; image_url?: string; is_public: boolean; user_id: string }[],
  teams: string[],
  seasons: string[],
  usernames: string[],
  currentFilters: { team: string; player: string; season: string; owner: string; sort: string },
  profileMap: Record<string, string> = {},
) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <ShowcaseFilters
          teams={teams}
          seasons={seasons}
          usernames={usernames}
          totalCount={jerseyList.length}
          currentFilters={currentFilters}
        />

        {jerseyList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jerseyList.map((jersey) => (
              <JerseyCard
                key={jersey.id}
                jersey={jersey}
                href={`/showcase/${jersey.id}`}
                owner={profileMap[jersey.user_id]}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="text-2xl font-bold text-gray-300 font-oswald uppercase mb-2">
              No Jerseys Found
            </h2>
            <p className="text-gray-500 text-sm">
              {Object.values(currentFilters).some(Boolean)
                ? 'Try adjusting your filters.'
                : 'No jerseys have been shared publicly yet. Be the first!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
