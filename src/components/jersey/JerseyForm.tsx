'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const supabase = createClient();

/** Resize + re-encode an image as JPEG before uploading. */
function compressImage(file: File, maxPx = 1200, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width >= height) {
          height = Math.round((height / width) * maxPx);
          width = maxPx;
        } else {
          width = Math.round((width / height) * maxPx);
          height = maxPx;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], 'jersey.jpg', { type: 'image/jpeg' })),
        'image/jpeg',
        quality,
      );
    };
    img.src = objectUrl;
  });
}

export interface JerseyData {
  id: string;
  user_id: string;
  team: string;
  player: string;
  season: string;
  image_url?: string;
  purchase_location?: string;
  purchase_date?: string;
  purchase_price?: number;
  estimated_value?: number;
  notes?: string;
  private_note?: string;
  external_link?: string;
  is_public: boolean;
}

interface JerseyFormProps {
  mode: 'create' | 'edit';
  initialData?: JerseyData;
}

export default function JerseyForm({ mode, initialData }: JerseyFormProps) {
  const router = useRouter();

  const [team, setTeam] = useState(initialData?.team ?? '');
  const [player, setPlayer] = useState(initialData?.player ?? '');
  const [season, setSeason] = useState(initialData?.season ?? '');
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? '');
  const [externalLink, setExternalLink] = useState(initialData?.external_link ?? '');
  const [purchaseLocation, setPurchaseLocation] = useState(initialData?.purchase_location ?? '');
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchase_date ?? '');
  const [purchasePrice, setPurchasePrice] = useState<string>(initialData?.purchase_price?.toString() ?? '');
  const [estimatedValue, setEstimatedValue] = useState<string>(initialData?.estimated_value?.toString() ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [privateNote, setPrivateNote] = useState(initialData?.private_note ?? '');
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? false);

  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(initialData?.image_url ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);

      // Show preview immediately from the local blob (no waiting for upload)
      const localPreview = URL.createObjectURL(compressed);
      setImagePreview(localPreview);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const uuid = crypto.randomUUID();
      const filePath = `${user.id}/${uuid}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('jersey-images')
        .upload(filePath, compressed, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('jersey-images')
        .getPublicUrl(filePath);

      URL.revokeObjectURL(localPreview);
      setImageUrl(publicUrl);
      setImagePreview(publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!team || !player || !season) {
      setError('Team, player, and season are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const jerseyPayload = {
      team,
      player,
      season,
      image_url: imageUrl || null,
      external_link: externalLink || null,
      purchase_location: purchaseLocation || null,
      purchase_date: purchaseDate || null,
      purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
      notes: notes || null,
      private_note: privateNote || null,
      is_public: isPublic,
    };

    try {
      if (mode === 'create') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error: insertError } = await supabase
          .from('jerseys')
          .insert({ ...jerseyPayload, user_id: user.id });

        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from('jerseys')
          .update(jerseyPayload)
          .eq('id', initialData!.id);

        if (updateError) throw updateError;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save jersey');
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-[#39FF14]/30 bg-gray-900/50 rounded-xl p-6 space-y-8">
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-lg p-3">
          {error}
        </p>
      )}

      {/* Jersey Details */}
      <section>
        <h2 className="text-lg font-bold text-[#39FF14] font-oswald uppercase mb-4">Jersey Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="team" className="text-gray-200">Team</Label>
            <Input
              id="team"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="e.g. Manchester United"
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
            />
          </div>
          <div>
            <Label htmlFor="player" className="text-gray-200">Player</Label>
            <Input
              id="player"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              placeholder="e.g. Ronaldo"
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
            />
          </div>
          <div>
            <Label htmlFor="season" className="text-gray-200">Season</Label>
            <Input
              id="season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              placeholder="e.g. 2023-24"
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
            />
          </div>
        </div>
      </section>

      {/* Media */}
      <section>
        <h2 className="text-lg font-bold text-[#39FF14] font-oswald uppercase mb-4">Media</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="image" className="text-gray-200">Jersey Image</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#39FF14] file:text-black hover:file:bg-[#39FF14]/80 cursor-pointer disabled:opacity-50"
            />
            {uploading && <p className="text-sm text-gray-400 mt-1">Uploading...</p>}
          </div>
          {imagePreview && (
            <div>
              <p className="text-sm text-gray-400 mb-2">Preview:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Jersey preview"
                className="h-40 w-auto rounded-lg border border-[#39FF14]/30 object-cover"
              />
            </div>
          )}
          <div>
            <Label htmlFor="externalLink" className="text-gray-200">External Link</Label>
            <Input
              id="externalLink"
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://..."
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
            />
          </div>
        </div>
      </section>

      {/* Purchase Info */}
      <section>
        <h2 className="text-lg font-bold text-[#39FF14] font-oswald uppercase mb-4">Purchase Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchaseLocation" className="text-gray-200">Purchase Location</Label>
            <Input
              id="purchaseLocation"
              value={purchaseLocation}
              onChange={(e) => setPurchaseLocation(e.target.value)}
              placeholder="e.g. Official Store"
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
            />
          </div>
          <div>
            <Label htmlFor="purchaseDate" className="text-gray-200">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
            />
          </div>
          <div>
            <Label htmlFor="purchasePrice" className="text-gray-200">Purchase Price (€)</Label>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
            />
          </div>
          <div>
            <Label htmlFor="estimatedValue" className="text-gray-200">Estimated Value (€)</Label>
            <Input
              id="estimatedValue"
              type="number"
              min="0"
              step="0.01"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0.00"
              className="mt-1 bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
            />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section>
        <h2 className="text-lg font-bold text-[#39FF14] font-oswald uppercase mb-4">Notes</h2>
        <p className="text-xs text-gray-500 mb-2">Visible publicly in the showcase.</p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes about this jersey..."
          rows={4}
          className="bg-gray-800 text-white border-gray-700 focus:border-[#39FF14]"
        />
      </section>

      {/* Private Note */}
      <section className="border border-yellow-500/20 bg-yellow-500/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold text-yellow-400 font-oswald uppercase">Private Note</h2>
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Only visible to you</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">This note is never shown in the public showcase or to other users.</p>
        <Textarea
          value={privateNote}
          onChange={(e) => setPrivateNote(e.target.value)}
          placeholder="Authentication number, condition details, personal memories..."
          rows={3}
          className="bg-gray-800 text-white border-yellow-500/30 focus:border-yellow-400"
        />
      </section>

      {/* Visibility */}
      <section>
        <h2 className="text-lg font-bold text-[#39FF14] font-oswald uppercase mb-4">Visibility</h2>
        <div className="flex items-center gap-3">
          <Switch
            id="isPublic"
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="isPublic" className="text-gray-200 cursor-pointer">
            Show in public showcase
          </Label>
        </div>
      </section>

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="bg-[#39FF14] text-black font-bold hover:bg-[#39FF14]/80 font-oswald uppercase"
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Add Jersey' : 'Save Changes'}
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-200 hover:bg-gray-700">
            Cancel
          </Button>
        </Link>
      </div>
    </div>
  );
}
