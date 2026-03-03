import Link from 'next/link';
import Image from 'next/image';

interface JerseyCardProps {
  jersey: {
    id: string;
    team: string;
    player: string;
    season: string;
    image_url?: string;
    is_public: boolean;
  };
  href?: string;
  owner?: string;
}

export default function JerseyCard({ jersey, href, owner }: JerseyCardProps) {
  const fallbackImageUrl = '/jersey-placeholder.svg';
  const linkHref = href ?? `/dashboard/edit/${jersey.id}`;

  return (
    <Link href={linkHref} className="block">
      <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-neon transition-all duration-300 group">
        {/* Image */}
        <div className="w-full h-80 relative overflow-hidden bg-gray-700 flex items-center justify-center">
          <Image
            src={jersey.image_url || fallbackImageUrl}
            alt={`${jersey.team} ${jersey.player} ${jersey.season} jersey`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="group-hover:scale-105 transition-transform duration-300"
          />
          {/* Season Badge */}
          <span className="absolute top-2 right-2 bg-[#39FF14] text-black text-xs font-bold px-2 py-1 rounded-full font-oswald uppercase">
            {jersey.season}
          </span>
          {/* Private Icon */}
          {!jersey.is_public && (
            <span className="absolute top-2 left-2 bg-gray-900 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Private
            </span>
          )}
        </div>

        {/* Details */}
        <div className="p-4">
          <h3 className="text-xl font-extrabold text-[#39FF14] font-oswald uppercase truncate">
            {jersey.team}
          </h3>
          <p className="text-lg text-gray-200 font-geist-sans truncate">
            {jersey.player}
          </p>
          {owner && (
            <p className="text-xs text-gray-500 mt-1 truncate">by @{owner}</p>
          )}
        </div>
      </div>
    </Link>
  );
}