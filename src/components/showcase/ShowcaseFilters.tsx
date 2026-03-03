'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FilterState {
  team: string;
  player: string;
  season: string;
  owner: string;
  sort: string;
}

interface ShowcaseFiltersProps {
  teams: string[];
  seasons: string[];
  usernames: string[];
  totalCount: number;
  currentFilters: FilterState;
}

export default function ShowcaseFilters({
  seasons,
  totalCount,
  currentFilters,
}: ShowcaseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Local text input state (may lead URL by up to 400ms during typing)
  const [teamInput, setTeamInput] = useState(currentFilters.team);
  const [playerInput, setPlayerInput] = useState(currentFilters.player);
  const [ownerInput, setOwnerInput] = useState(currentFilters.owner);

  // Refs so debounce callbacks always read the latest values without stale closures
  const teamRef = useRef(teamInput);
  const playerRef = useRef(playerInput);
  const ownerRef = useRef(ownerInput);
  const filtersRef = useRef(currentFilters);

  useEffect(() => { teamRef.current = teamInput; }, [teamInput]);
  useEffect(() => { playerRef.current = playerInput; }, [playerInput]);
  useEffect(() => { ownerRef.current = ownerInput; }, [ownerInput]);
  useEffect(() => { filtersRef.current = currentFilters; }, [currentFilters]);

  const activeCount = [currentFilters.team, currentFilters.player, currentFilters.season, currentFilters.owner]
    .filter(Boolean).length;

  // Build a full URL from ref values + any overrides
  const buildUrl = (overrides: Partial<FilterState>) => {
    const f = filtersRef.current;
    const merged: FilterState = {
      team: overrides.team !== undefined ? overrides.team : teamRef.current,
      player: overrides.player !== undefined ? overrides.player : playerRef.current,
      owner: overrides.owner !== undefined ? overrides.owner : ownerRef.current,
      season: overrides.season !== undefined ? overrides.season : f.season,
      sort: overrides.sort !== undefined ? overrides.sort : f.sort,
    };
    const params = new URLSearchParams();
    if (merged.team) params.set('team', merged.team);
    if (merged.player) params.set('player', merged.player);
    if (merged.owner) params.set('owner', merged.owner);
    if (merged.season) params.set('season', merged.season);
    if (merged.sort && merged.sort !== 'newest') params.set('sort', merged.sort);
    const qs = params.toString();
    return `${pathname}${qs ? '?' + qs : ''}`;
  };

  // Debounced text filters (400 ms)
  const teamTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (teamInput === currentFilters.team) return;
    clearTimeout(teamTimer.current);
    teamTimer.current = setTimeout(() => router.push(buildUrl({ team: teamRef.current })), 400);
    return () => clearTimeout(teamTimer.current);
  }, [teamInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const playerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (playerInput === currentFilters.player) return;
    clearTimeout(playerTimer.current);
    playerTimer.current = setTimeout(() => router.push(buildUrl({ player: playerRef.current })), 400);
    return () => clearTimeout(playerTimer.current);
  }, [playerInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const ownerTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (ownerInput === currentFilters.owner) return;
    clearTimeout(ownerTimer.current);
    ownerTimer.current = setTimeout(() => router.push(buildUrl({ owner: ownerRef.current })), 400);
    return () => clearTimeout(ownerTimer.current);
  }, [ownerInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setTeamInput('');
    setPlayerInput('');
    setOwnerInput('');
    router.push(pathname);
  };

  const selectClass =
    'rounded-md border border-gray-700 bg-gray-800/80 text-white px-3 py-2 text-sm focus:border-[#39FF14] focus:outline-none w-full';

  const filtersUI = (
    <div className="space-y-3">
      {/* Row 1: text searches */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search team…"
          value={teamInput}
          onChange={(e) => setTeamInput(e.target.value)}
          className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#39FF14]"
        />
        <Input
          placeholder="Search player…"
          value={playerInput}
          onChange={(e) => setPlayerInput(e.target.value)}
          className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#39FF14]"
        />
      </div>
      {/* Row 2: selects + owner text */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={currentFilters.season}
          onChange={(e) => router.push(buildUrl({ season: e.target.value }))}
          className={selectClass}
        >
          <option value="">All seasons</option>
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">@</span>
          <Input
            placeholder="username…"
            value={ownerInput}
            onChange={(e) => setOwnerInput(e.target.value)}
            className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#39FF14] pl-7"
          />
        </div>

        <select
          value={currentFilters.sort}
          onChange={(e) => router.push(buildUrl({ sort: e.target.value }))}
          className={selectClass}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="team">Team A–Z</option>
          <option value="player">Player A–Z</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-4xl font-extrabold text-[#39FF14] tracking-wider uppercase font-oswald">
            Showcase
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {totalCount} {totalCount === 1 ? 'jersey' : 'jerseys'}
            {activeCount > 0 ? ' found' : ' from the community'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="text-gray-400 hover:text-white text-xs gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
          {/* Mobile toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden border-gray-700 text-gray-300 hover:border-[#39FF14] hover:text-[#39FF14] gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#39FF14] text-black text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block">{filtersUI}</div>

      {/* Mobile: collapsible */}
      {mobileOpen && (
        <div className="md:hidden border border-[#39FF14]/20 bg-gray-900/50 rounded-xl p-4 mb-4">
          {filtersUI}
        </div>
      )}
    </div>
  );
}
