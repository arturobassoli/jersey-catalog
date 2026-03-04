'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

const supabase = createClient();

interface ProfileFormProps {
  email: string;
  currentUsername: string;
  userId: string;
}

export default function ProfileForm({ email, currentUsername, userId }: ProfileFormProps) {
  const t = useTranslations('profile');
  const [username, setUsername] = useState(currentUsername);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSave = async () => {
    const trimmed = username.trim();

    if (!trimmed) {
      setMessage({ type: 'error', text: t('usernameEmpty') });
      return;
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      setMessage({ type: 'error', text: t('usernameInvalid') });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', trimmed)
      .neq('id', userId)
      .maybeSingle();

    if (existing) {
      setMessage({ type: 'error', text: t('usernameTaken') });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, username: trimmed }, { onConflict: 'id' });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: t('saveSuccess') });
    }

    setSaving(false);
  };

  return (
    <div className="border border-[#39FF14]/30 bg-gray-900/50 rounded-xl p-6 space-y-6">
      {/* Email (read-only) */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{t('email')}</p>
        <p className="text-gray-300 text-sm">{email}</p>
      </div>

      {/* Username */}
      <div>
        <Label htmlFor="username" className="text-gray-200 block mb-2">
          {t('username')}
        </Label>
        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 focus-within:border-[#39FF14] transition-colors">
          <span className="text-gray-500 select-none text-sm">@</span>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="your_username"
            maxLength={20}
            className="flex-1 bg-transparent text-white py-2 px-2 text-sm focus:outline-none placeholder:text-gray-600"
          />
        </div>
        <p className="text-xs text-gray-600 mt-1.5">
          {t('usernameHint')}
        </p>
      </div>

      {message && (
        <p className={`text-sm ${message.type === 'error' ? 'text-red-400' : 'text-[#39FF14]'}`}>
          {message.text}
        </p>
      )}

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#39FF14] text-black font-bold hover:bg-[#39FF14]/80 font-oswald uppercase"
      >
        {saving ? t('saving') : t('saveUsername')}
      </Button>
    </div>
  );
}
